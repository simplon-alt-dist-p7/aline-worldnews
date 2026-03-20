# 🌍 World News

**World News** est une application composée de **2 microservices** et **2 microfronts** :

- ✍️ **WRITER** – gestion et création d’articles
- 📖 **READER** – consultation et lecture d’articles

Chaque service et chaque front possède son propre environnement, ses propres tests et son propre Dockerfile, permettant un développement, un déploiement et des tests totalement indépendants.

📖 [Documentation technique détaillée](./DOCUMENTATION.md)

---

## Sommaire

- [README des sous-projets](#readme-des-sous-projets)
- [Architecture générale](#architecture-générale)
- [Base de données](#base-de-données)
- [Choix techniques transverses](#choix-techniques-transverses)
- [Hook Git — Lefthook, ESLint, Prettier](#hook-git--lefthook-eslint-prettier)
- [Tests backend](#tests-backend)
  - [Jest — Tests unitaires](#jest--tests-unitaires)
  - [Supertest — Tests d'intégration API](#supertest--tests-dintégration-api)
  - [Base de données de test](#base-de-données-de-test)
- [Tests frontend](#tests-frontend)
  - [Vitest et Testing Library](#vitest-et-testing-library)
  - [Playwright — Tests end-to-end](#playwright--tests-end-to-end)
- [Conteneurisation Docker](#conteneurisation-docker)
- [Intégration continue avec GitHub Actions](#intégration-continue-avec-github-actions)
- [Déploiement](#déploiement)

---

## README des sous-projets

- [Writer](https://github.com/simplon-alt-dist-p7/aline-worldnews/blob/main/writer/README.md)
- [Reader](https://github.com/simplon-alt-dist-p7/aline-worldnews/blob/main/reader/README.md)

---

## Architecture générale

```
aline-worldnews/
│
├─ writer/
│  │
│  ├─ frontend/
│  │   ├─ E2E/                          # Playwright
│  │   └─ src/
│  │       └─ tests/                    # Vitest / Testing Library
│  │   └─ Dockerfile
│  │
│  └─ backend/
│      ├─ src/
│      │   └─ tests/
│      │       ├─ unit/                 # Jest
│      │       └─ integration/          # Supertest
│      ├─ dist/
│      └─ Dockerfile
│
│
├─ reader/
│  │
│  ├─ frontend/
│  │   ├─ E2E/                          # Playwright
│  │   └─ src/
│  │       └─ tests/                    # Vitest / Testing Library
│  │   └─ Dockerfile
│  │
│  ├─ backend/
│      ├─ tests/
│      │   ├─ unit/                     # Jest
│      │   └─ integration/              # Supertest
│      └─ Dockerfile
│
├─ database/
│
├─ lefthook.yml
├─ docker-compose.yml
├─ docker-compose.test.yml
├─ package.json
├─ prettier.config.js
├─ run-tests.js
└─ settings.json
```

## Base de données

Les deux microservices partagent une seule base de données PostgreSQL avec deux schémas distincts :

- `writer` — données gérées par le microservice Writer
- `reader` — données gérées par le microservice Reader

Les scripts SQL se trouvent dans le dossier `database/` à la racine du projet et sont exécutés dans l'ordre numéroté.

```bash
# Démarrer la base de données principale
docker-compose up db

# Accéder à la base via psql
psql -h localhost -p 5432 -U postgres -d worldnews
```

## Choix techniques transverses

Les microservices **Writer** et **Reader** utilisent des stacks différentes (voir README propres à chaque projet).

Ce README racine documente uniquement les outils et choix techniques communs à l’ensemble du projet.

### Rappel des stacks :

- READER / BACK : JavaScript + Prisma
- WRITER / BACK : TypeScript + TypeORM

Les frontends sont alignés sur les choix techniques de leur backend respectif.

---

## Hook Git — Lefthook, ESLint, Prettier

Lefthook exécute automatiquement des vérifications avant chaque commit et avant chaque push.

### Installation

```bash
# Installer les hooks (inutile ici car déjà installé dans le package.json)
npx lefthook install
```

Le script `prepare` dans le `package.json` racine lance `lefthook install` automatiquement à chaque `npm install`.

### Pre-commit

Avant chaque commit, **ESLint** et **Prettier** s'exécutent sur les fichiers stagés de chaque service :

- **ESLint** — détecte les erreurs et mauvaises pratiques, corrige automatiquement ce qui peut l'être (`--fix`)
- **Prettier** — reformate le code selon les règles définies dans `prettier.config.js`

Seuls les fichiers modifiés et stagés sont vérifiés, ce qui rend le hook rapide.

### Pre-push

Avant chaque push, pour chaque service :

- **Typecheck TypeScript** (`tsc --noEmit`) — vérifie les types sans compiler (Writer uniquement, Reader est en JS)
- **Tests unitaires et d'intégration** — bloque le push si un test échoue

### Commandes utiles

```bash
# Lancer manuellement le pre-commit
npx lefthook run pre-commit

# Lancer manuellement le pre-push
npx lefthook run pre-push

# Mode verbose pour voir le détail
npx lefthook run pre-commit --verbose
```

## Tests backend

### Jest — Tests unitaires

Tests situés dans `backend/src/tests/unit/`.

Les dépendances externes (base de données, services tiers) sont **mockées** pour isoler uniquement le comportement du module testé.

```bash
# Depuis le dossier backend d'un service
npm test

# Tests unitaires uniquement
npm run test:unit
```

### Supertest — Tests d'intégration API

Tests situés dans `backend/src/tests/integration/`.

Teste l'intégration complète : route → controller → base de données → réponse. Nécessite la **base de données de test** (voir section suivante).

```bash
# Tests d'intégration uniquement
npm run test:integration
```

### Base de données de test

Une base PostgreSQL dédiée aux tests est définie dans `docker-compose.test.yml`. Elle est seedée automatiquement au démarrage via les fichiers SQL du dossier `database/`.

La base de test tourne sur le port `5433` pour éviter tout conflit avec la base principale (`5432`).

```bash
# Démarrer la base de test
docker-compose -f docker-compose.test.yml up -d

# Arrêter la base de test
docker-compose -f docker-compose.test.yml down

# Supprimer la base de test et ses données (force le re-seed au prochain démarrage)
docker-compose -f docker-compose.test.yml down -v
```

## Tests frontend

### Vitest et Testing Library

Tests situés dans `frontend/src/tests/`.

Tests unitaires des composants React — vérifient le rendu et le comportement des composants de manière isolée.

```bash
# Depuis le dossier frontend d'un service
npm test

# Mode watch
npm run test:watch
```

## Playwright — Tests End-to-End

Tests situés dans `frontend/E2E/`. Valident l'expérience utilisateur complète dans un vrai navigateur.

```bash
# Lancer tous les tests E2E
npx playwright test

# Interface graphique
npx playwright test --ui

# Navigateur visible
npx playwright test --headed

# Mode debug
npx playwright test --debug

# Rapport HTML
npx playwright show-report

# Test spécifique
npx playwright test E2E/tests/main-articles.spec.ts
```

---

## Conteneurisation Docker

Chaque service possède son propre `Dockerfile`. Le `docker-compose.yml` racine orchestre l'ensemble.

### Conteneurs du projet

| Conteneur      | Image                          | Port local | Port conteneur | Rôle                       |
| -------------- | ------------------------------ | ---------- | -------------- | -------------------------- |
| `db`           | `postgres:15`                  | 5432       | 5432           | Base de données principale |
| `db-test`      | `postgres:15`                  | 5433       | 5432           | Base de données de test    |
| `writer-back`  | `aline-worldnews-writer-back`  | 5000       | 5000           | Backend Writer             |
| `reader-back`  | `aline-worldnews-reader-back`  | 5001       | 5001           | Backend Reader             |
| `writer-front` | `aline-worldnews-writer-front` | 5174       | 5174           | Frontend Writer            |
| `reader-front` | `aline-worldnews-reader-front` | 5175       | 5175           | Frontend Reader            |

### Commandes utiles

```bash
# Construire et démarrer tous les conteneurs
docker-compose up --build

# Démarrer les conteneurs déjà construits
docker-compose up

# Arrêter et supprimer les conteneurs
docker-compose down
```

---

## Intégration continue avec GitHub Actions

Le pipeline CI se déclenche à chaque push sur `main` et à chaque pull request vers `main`.

Il lance **4 jobs en parallèle**, un par service :

| Job            | Lint | Tests | Base de données           |
| -------------- | ---- | ----- | ------------------------- |
| `reader-back`  | ✅   | ✅    | PostgreSQL de test + seed |
| `reader-front` | ✅   | ✅    | —                         |
| `writer-back`  | ✅   | ✅    | PostgreSQL de test + seed |
| `writer-front` | ✅   | ✅    | —                         |

Les jobs back provisionnent automatiquement une base PostgreSQL et exécutent les scripts SQL du dossier `database/` avant de lancer les tests.

---

## Déploiement

L'application est déployée sur Render.

| Service         | URL                                       |
| --------------- | ----------------------------------------- |
| Writer Frontend | https://writer-frontend-evrf.onrender.com |
| Writer Backend  | https://aline-worldnews.onrender.com      |
| Reader Frontend | https://reader-frontend-693p.onrender.com |
| Reader Backend  | https://reader-backend-y1ao.onrender.com  |
