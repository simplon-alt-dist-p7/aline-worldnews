# Documentation technique — World News

## Sommaire

- [Base de données](#base-de-données)
- [Choix techniques transverses](#choix-techniques-transverses)
- [Hook Git — Lefthook, ESLint, Prettier](#hook-git--lefthook-eslint-prettier)
- [Jest — Tests unitaires](#jest--tests-unitaires)
- [Supertest — Tests d'intégration API](#supertest--tests-dintégration-api)
- [Base de données de test](#base-de-données-de-test)
- [Playwright — Tests End-to-End](#playwright--tests-end-to-end)
- [Organisation des tests](#organisation-des-tests)
- [Conteneurisation Docker](#conteneurisation-docker)
- [Intégration continue avec GitHub Actions](#intégration-continue-avec-github-actions)
- [Déploiement](#déploiement)

---

## Base de données

Les deux microservices Writer et Reader partagent une seule base de données PostgreSQL, organisée en deux schémas distincts :

- `writer` — données gérées par le microservice Writer (articles, catégories)
- `reader` — données gérées par le microservice Reader (commentaires, favoris)

Les scripts SQL sont centralisés dans le dossier `database/` à la racine du projet, exécutés dans l'ordre numéroté :

- `01-worldnews.sql` — création des schémas et des tables
- `02-seed.sql` — données de test (articles)
- `03-seed-comments.sql` — données de test (commentaires)
- `04-categories.sql` — données de test (catégories)

Ce choix de centralisation facilite la maintenance et la cohérence entre les deux services. Il évite d'avoir des schémas dupliqués dans chaque microservice, ce qui était le cas dans une version précédente du projet (`BDD/` dans Writer et Reader).

## Choix techniques transverses

Les microservices **Writer** et **Reader** utilisent des stacks différentes (voir README propres à chaque projet).

### Rappel des stacks :

- **Reader / Back** : JavaScript + Prisma
- **Writer / Back** : TypeScript + TypeORM
- Les frontends sont alignés sur les choix techniques de leur backend respectif

---

## Hook Git — Lefthook, ESLint, Prettier

Lefthook permet d’exécuter automatiquement des tâches avant un commit ou un push. L'objectif est de maintenir la qualité du code et éviter de pousser des erreurs ou du code mal formaté.

Contrairement à **husky** par exemple, il gère bien différentes stacks dans le même projet, et l'intégration CI/CD demande moins d'ajustement.

Fichier de configuration : **`lefthook.yml`** à la racine du projet.

Dans le `package.json` racine :

```json
"scripts": {
  "prepare": "lefthook install"
}
```

### Pre-commit

Avant chaque commit, Lefthook exécute **ESLint** et **Prettier** uniquement sur les **fichiers stagés**, filtrés par extension et par dossier de service. Seuls les fichiers réellement modifiés sont traités, ce qui rend le hook rapide.

```yaml
pre-commit:
  parallel: true
  commands:
    eslint-writer-back:
      glob: '*.{ts,js}'
      root: 'writer/backend/'
      run: npx eslint --fix {staged_files} && git add {staged_files}
    # ... idem pour writer/frontend, reader/backend, reader/frontend
```

**pourquoi glob ?**

Par exemple si je stage un fichier .md, ESLint va le recevoir et retourner une erreur car il ne sait pas le linter. Donc on précise les fichiers à analyser.

- `glob` — filtre les fichiers par extension
- `root` — restreint le hook au dossier du service
- `{staged_files}` — injecte automatiquement la liste des fichiers stagés correspondants
- `git add {staged_files}` — re-stage les fichiers après correction automatique pour les inclure dans le commit

---

### Pre-push

Avant chaque push, Lefthook lance pour chaque service :

- **Typecheck TypeScript** (`tsc --noEmit`) — vérifie les types sans générer de fichiers compilés. Uniquement sur Writer (backend et frontend), car Reader est en JavaScript.
- **Tests unitaires et d'intégration** — bloque le push si un test échoue.

```yaml
pre-push:
  commands:
    typecheck-writer-back:
      run: cd writer/backend && npx tsc --noEmit
    test-writer-back:
      run: cd writer/backend && npx jest --passWithNoTests
    test-writer-front:
      run: cd writer/frontend && npx vitest run --passWithNoTests
    # ... idem pour reader
```

Le `cd` dans le `run` change le répertoire d'exécution de la commande sans filtrer de fichiers — ce qui est le comportement voulu au pre-push, où on veut tout vérifier indépendamment des fichiers modifiés.

Les **tests E2E Playwright** ne sont pas inclus dans le pre-push car ils nécessitent un serveur Vite en cours d'exécution. Ils sont délégués à la CI (GitHub Actions).

---

### ESlint

Chaque microservice et front possède sa propre configuration ESLint (`eslint.config.js`) adaptée à sa stack.

Pour que VSCode détecte correctement les configurations dans tous les sous-dossiers, le fichier `settings.json` à la racine référence les chemins de chaque configuration.

ESLint analyse le code pour détecter les erreurs, mauvaises pratiques et incohérences de style :

- Présent dans tous les projets (back et front)
- Intégré avec Lefthook pour bloquer les commits si des erreurs non corrigeables automatiquement sont détectées
- Compatible avec TypeScript via `@typescript-eslint/parser` et `@typescript-eslint/eslint-plugin`

---

### Prettier

Prettier uniformise le style du code (indentation, quotes, fins de ligne…).

La configuration est centralisée à la racine dans `prettier.config.js`, ce qui garantit un style cohérent sur l'ensemble du projet quelle que soit la stack du service.

---

## Jest — Tests unitaires

Jest est utilisé dans tous les backends pour les tests unitaires.

**Pourquoi Jest ?**

- Rapide et simple à configurer
- Support natif du mocking, sans librairie supplémentaire
- Expérience préalable, pour ne pas s'éparpiller dans les outils

Les dépendances externes (services, base de données, modules tiers) sont **mockées** pour isoler uniquement le comportement du module testé, sans impacter les données réelles.

---

## Supertest — Tests d'intégration API

Supertest est utilisé pour tester les routes HTTP et l'intégration complète des composants backend, de la requête jusqu'à la base de données : route → controller → service → base de données → réponse.

**Pourquoi Supertest ?**

- Permet de simuler des requêtes HTTP sans démarrer un vrai serveur
- Teste l'application dans sa globalité (routes, middlewares, contrôleurs)
- Expérience préalable, pour ne pas s'éparpiller dans les outils.

Les tests d'intégration interagissent réellement avec la base de données — contrairement aux tests unitaires, on ne peut pas simplement mocker les appels en base : le but est précisément de vérifier que toute la chaîne fonctionne. C'est pourquoi une **base de données dédiée aux tests** est utilisée (voir section suivante), pour ne pas modifier ou supprimer les données réelles.

---

## Base de données de test

Les deux backends (Writer et Reader) utilisent une base de données PostgreSQL dédiée aux tests, définie dans `docker-compose.test.yml` à la racine.

- Les tests **unitaires** n'interagissent pas avec la base — ils utilisent des mocks.
- Les tests **d'intégration** utilisent Supertest et parcourent tout le chemin jusqu'à la base.

### Seed automatique

La base de test est seedée automatiquement au démarrage du conteneur grâce au mécanisme `docker-entrypoint-initdb.d` de PostgreSQL. Les fichiers SQL du dossier `database/` sont montés comme volumes et exécutés dans l'ordre numéroté à la première création du conteneur.

```yaml
volumes:
  - ./database/01-worldnews.sql:/docker-entrypoint-initdb.d/01-worldnews.sql
  - ./database/02-seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
  - ./database/03-seed-comments.sql:/docker-entrypoint-initdb.d/03-seed-comments.sql
  - ./database/04-categories.sql:/docker-entrypoint-initdb.d/04-categories.sql
```

> ⚠️ `docker-entrypoint-initdb.d` ne s'exécute qu'à la **première création** du conteneur. Si les données existent déjà, les scripts sont ignorés. Pour forcer un re-seed, il faut supprimer le volume avec `docker-compose -f docker-compose.test.yml down -v`.

### Fichier `.env.test` et configuration

Le fichier `.env.test` dans chaque backend contient les variables de connexion à la base de test (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, etc.).

**Writer – TypeORM**

Dans `database.ts`, le fichier `.env.test` est chargé automatiquement lorsque `NODE_ENV=test` est défini.

**Reader – Prisma**

Dans `src/lib/prisma.js`, le fichier `.env.test` est chargé de la même façon lorsque `NODE_ENV=test`. Prisma impose un format de `DATABASE_URL` complet :

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_db
```

Dans les deux cas, `NODE_ENV=test` est défini via **`cross-env`** dans les scripts `package.json`, ce qui garantit la portabilité entre Windows, Mac et Linux.

---

## Playwright — Tests End-to-End

Playwright est présent dans chaque frontend pour valider le comportement réel de l'application du point de vue utilisateur.

**Pourquoi Playwright ?**

- Outil déjà utilisé en entreprise, pas besoin de monter en compétence
- Gestion simple des fixtures, screenshots et traces
- Adapté au déploiement automatisé en CI/CD

**Pourquoi un Playwright par front et non à la racine ?**

Les deux fronts partagent les mêmes routes (`/articles`, etc.). Installer Playwright à la racine du projet aurait nécessité une configuration complexe avec des conditions pour distinguer les deux fronts. En installant Playwright séparément dans chaque front, la configuration reste simple et les tests sont complètement indépendants.

Structure type :

```
E2E/
  ├─ pages/           # Page Object Model (POM)
  └─ tests/           # spec.ts
```

Le **Page Object Model** est un pattern de conception qui consiste à encapsuler les interactions avec une page dans une classe dédiée. Cela rend les tests plus lisibles et plus faciles à maintenir — si une page change, on ne modifie que la classe correspondante, pas tous les tests.

## Organisation des tests

Chaque microservice et front possède son propre dossier de tests et sa propre configuration Jest/Vitest.

Les scripts de tests utilisent `cross-env` pour définir `NODE_ENV=test` de manière portable, garantissant que les tests d'intégration se connectent à la BDD de test quel que soit le système d'exploitation.

Il est possible de lancer les tests unitaires et d'intégration séparément grâce à deux scripts distincts dans chaque `package.json` backend :

```json
{
  "scripts": {
    "test:unit": "jest --config jest.unit.config.js",
    "test:integration": "jest --config jest.integration.config.js"
  }
}
```

---

## Conteneurisation Docker

Docker est utilisé pour uniformiser l'environnement de développement et simplifier le déploiement, en local comme en CI/CD.

**Pourquoi Docker ?**

- **Isolation** : chaque conteneur fonctionne indépendamment, les dépendances d'un service n'interfèrent pas avec les autres.
- **Reproductibilité** : l'application tourne exactement de la même façon sur toutes les machines.
- **Compatibilité CI/CD** : les conteneurs s'intègrent facilement dans les pipelines de déploiement automatisé.

### Dockerfiles

Chaque service (back et front) possède son propre `Dockerfile` qui décrit comment construire son image :

| Instruction | Rôle                                 | Exemple                |
| ----------- | ------------------------------------ | ---------------------- |
| `FROM`      | Image de base                        | `FROM node:20`         |
| `WORKDIR`   | Dossier de travail dans le conteneur | `WORKDIR /app`         |
| `COPY`      | Copie des fichiers vers le conteneur | `COPY package.json .`  |
| `RUN`       | Exécute une commande au build        | `RUN npm install`      |
| `EXPOSE`    | Port d'écoute de l'application       | `EXPOSE 5000`          |
| `CMD`       | Commande de démarrage du conteneur   | `CMD ["npm", "start"]` |

**Cas particulier : Writer Backend (TypeScript)**

Node.js ne peut exécuter que du JavaScript. Le backend Writer étant en TypeScript, il faut une étape de compilation :

```dockerfile
RUN npm run build   # Compile src/*.ts → dist/*.js au moment du build de l'image
CMD ["npm", "start"]  # Lance node dist/index.js quand le conteneur tourne
```

Le dossier `dist/` contient le code compilé — il est généré dans l'image et n'a pas besoin d'être committé dans git.

### Docker Compose

Le `docker-compose.yml` à la racine orchestre tous les services : fronts, backs, et base de données. Il définit les ports exposés, les réseaux internes et les volumes.

### Conteneurs, images et ports

| Conteneur      | Image                          | Port local | Port conteneur | Rôle                       |
| -------------- | ------------------------------ | ---------- | -------------- | -------------------------- |
| `db`           | `postgres:15`                  | 5432       | 5432           | Base de données principale |
| `db-test`      | `postgres:15`                  | 5433       | 5432           | Base de données de test    |
| `writer-back`  | `aline-worldnews-writer-back`  | 5000       | 5000           | Backend Writer             |
| `reader-back`  | `aline-worldnews-reader-back`  | 5001       | 5001           | Backend Reader             |
| `writer-front` | `aline-worldnews-writer-front` | 5174       | 5174           | Frontend Writer            |
| `reader-front` | `aline-worldnews-reader-front` | 5175       | 5175           | Frontend Reader            |

La base de test utilise le port local `5433` (au lieu de `5432`) pour éviter tout conflit avec la base principale qui tourne sur `5432`.

### Volumes Docker

Les volumes permettent de persister les données même si un conteneur est supprimé ou reconstruit.

- `aline-worldnews_pgdata` — données de la base PostgreSQL principale

---

💡 **A savoir**

Dans cette configuration, les backs et fronts ne sont accessibles qu'à travers Docker — il n'y a pas d'environnement local en dehors des conteneurs. Pour un développeur qui souhaite travailler en local sans Docker, il serait utile d'exposer des ports dédiés, de deux façons possibles :

- **Via Docker Compose** : exposer un port différent sur la machine locale  
  Exemple : `5176:5174` → le PC se connecte sur `localhost:5176`, Docker redirige vers `5174` dans le conteneur

- **Via le code** : configurer le front pour écouter sur un port local quand Docker n'est pas utilisé  
  Exemple : `process.env.LOCAL_PORT = 5176` → `npm start` en local ouvre ce port

---

## Intégration continue avec GitHub Actions

### Définitions

**CI (Intégration Continue)** — vérifier automatiquement que le code fonctionne à chaque fois que quelqu'un pousse du code. L'idée est d'intégrer les changements fréquemment et de détecter les problèmes tôt. Concrètement : lint + tests.

**CD (Déploiement Continu)** — déclencher automatiquement le déploiement si la CI est au vert. Concrètement : GitHub Actions qui dit à l'hébergeur "vas-y, déploie".

**Pipeline** — suite d'étapes automatisées qui s'exécutent dans un ordre défini, chaque étape dépendant du succès de la précédente.

### Fonctionnement

Quand GitHub Actions lance un pipeline, il crée une **machine virtuelle Ubuntu** hébergée chez GitHub — pas un conteneur Docker, mais un vrai OS complet. Cette machine est vierge : rien n'est installé par défaut, ni Node, ni npm, ni psql. C'est pour ça que chaque job commence par installer les outils nécessaires via `actions/checkout` et `actions/setup-node`.

Une fois le pipeline terminé, la machine est supprimée.

### Configuration du pipeline

Le pipeline se déclenche **à chaque push sur `main`** et **à chaque pull request vers `main`**.

Il lance **4 jobs en parallèle**, un par service :

```yaml
on:
  push:
    branches: ['main']
  pull_request:
    branches: ['main']
```

**Pourquoi `ubuntu-latest` ?**

C'est gratuit sur GitHub Actions et cohérent avec l'environnement de production (Docker tourne sous Linux).

### Étapes de chaque job

Pour chaque service Node.js, la logique est toujours la même :

1. `actions/checkout` — récupère le code du dépôt
2. `actions/setup-node` — installe Node.js
3. `npm ci` — installe les dépendances de façon propre et reproductible (`ci` est plus strict que `install`)
4. `npm run lint` — vérifie la qualité du code
5. `npm test` — lance les tests

**Pour les backends (writer-back et reader-back)**, un service PostgreSQL est provisionné directement dans le job GitHub Actions, et les scripts SQL du dossier `database/` sont exécutés avant les tests pour seeder la base :

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    ports:
      - 5433:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 2s
      --health-timeout 2s
      --health-retries 10
```

**Pour reader-back spécifiquement**, une étape `npx prisma generate` est ajoutée avant les tests car le client Prisma doit être généré — il n'est pas commité dans git.

---

## Coverage

### Fonctionnement global

Le coverage mesure le pourcentage de code source réellement exécuté pendant les tests.
Il est calculé automatiquement à chaque push par le pipeline CI.

```
Tests (Jest/Vitest) --> coverage-summary.json --> script --> badges SVG --> commit dans le repo
```

### Génération du rapport

Jest et Vitest génèrent un fichier `coverage-summary.json` dans un dossier `coverage/`
à l'intérieur de chaque service, via les scripts `test:coverage` dans chaque `package.json` :

```json
"test:coverage": "cross-env NODE_ENV=test jest --detectOpenHandles --forceExit --coverage"
"test:coverage": "vitest run --coverage"
```

Les reporters sont configurés dans `jest.config.js` et `vite.config.js` :

```js
coverageReporters: ['json-summary', 'text'];
```

`json-summary` génère le fichier JSON lu par le script.
`text` affiche le tableau de coverage dans les logs du pipeline.

### Artifacts GitHub Actions

Les jobs tournent sur des machines virtuelles séparées qui sont supprimées à la fin.
Les fichiers `coverage-summary.json` sont donc uploadés en tant qu'artifacts pour être
récupérés ensuite par le job `badge` :

```yaml
- name: Upload coverage
  uses: actions/upload-artifact@v4
  with:
    name: coverage-reader-back
    path: reader/backend/coverage/coverage-summary.json
```

Le job `badge` attend que les 4 jobs soient terminés (`needs`), télécharge les 4 fichiers,
puis lance le script :

```yaml
badge:
  needs: [reader-back, reader-front, writer-back, writer-front]
```

### Script generate-coverage-badge.js

Le script `scripts/generate-coverage-badge.js` lit chaque `coverage-summary.json`,
extrait le pourcentage de lignes couvertes (`total.lines.pct`) et génère un badge SVG
via la librairie `badge-maker` :

- 🔴 Rouge — coverage < 25%
- 🟠 Orange — coverage < 40%
- 🟢 Vert — coverage ≥ 40%

Les badges sont ensuite committés automatiquement dans le repo par le pipeline
et affichés dans le README.

---

## Déploiement

L'application est déployée sur https://render.com et se compose de 5 services :

| Service           | Type                 | URL                                       |
| ----------------- | -------------------- | ----------------------------------------- |
| `worldnews-db`    | PostgreSQL           | —                                         |
| `writer/backend`  | Web Service (Docker) | https://aline-worldnews.onrender.com      |
| `reader/backend`  | Web Service (Docker) | _(URL reader-back)_                       |
| `writer-frontend` | Static Site          | https://writer-frontend-evrf.onrender.com |
| `reader-frontend` | Static Site          | _(URL reader-front)_                      |

---

1. Base de données PostgreSQL

Créer une base PostgreSQL sur Render (**New → PostgreSQL**), puis récupérer l'**External Database URL** et initialiser la base avec les scripts SQL :

```bash
psql <EXTERNAL_DATABASE_URL> -f database/01-worldnews.sql
psql <EXTERNAL_DATABASE_URL> -f database/04-categories.sql
psql <EXTERNAL_DATABASE_URL> -f database/02-seed.sql
psql <EXTERNAL_DATABASE_URL> -f database/03-seed-comments.sql
```

---

### Backends — Web Services (Docker)

Créer un **Web Service** pour chaque backend (**New → Web Service**) en sélectionnant le repo `aline-worldnews` et en renseignant le répertoire racine du service (`writer/backend` ou `reader/backend`). Render détecte automatiquement le Dockerfile.

- Défini les variables d'environnement pour chaque service

Ajouter un nom de user et un mot de passe pour sécuriser les données entre les services.

- SSL

Render impose SSL pour les connexions PostgreSQL - les données transitent sur internet entre le backend et la base de données.

- **Writer (TypeORM)** — la config SSL est gérée dans `database.ts` via la variable `DB_SSL=true` :
  ```typescript
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
  ```
- **Reader (Prisma)** — la config SSL est gérée directement dans la `DATABASE_URL` via `?sslmode=require`.

- CORS

Chaque backend autorise uniquement les requêtes provenant de son frontend via la variable `FRONTEND_URL`. Cette variable doit contenir l'URL exacte du frontend déployé sur Render.

### Frontends — Static Sites

Les frontends React sont déployés en **Static Site** (pas en Web Service) car `npm run build` génère des fichiers HTML/CSS/JS statiques qui n'ont pas besoin d'un serveur Node.js pour tourner.

Créer un **Static Site** pour chaque frontend (**New → Static Site**) avec ces paramètres :

| Paramètre         | writer/frontend                | reader/frontend                |
| ----------------- | ------------------------------ | ------------------------------ |
| Répertoire racine | `writer/frontend`              | `reader/frontend`              |
| Build Command     | `npm install && npm run build` | `npm install && npm run build` |
| Publish Directory | `dist`                         | `dist`                         |

> **`npm run build`** — compile le code React/TypeScript en fichiers statiques optimisés via Vite. Le dossier `dist/` contient le résultat : un `index.html` et des fichiers JS/CSS minifiés prêts à être servis.
