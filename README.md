# 🌍 World News

**World News** est une application composée de **2 microservices** et **2 microfronts** :

- ✍️ **WRITER** – gestion et création d’articles  
- 📖 **READER** – consultation et lecture d’articles  

Chaque service et chaque front possède :

- son propre environnement  
- ses propres tests  
- son propre Dockerfile  

Cela permet un développement, un déploiement et des tests totalement indépendants.

---

## 📑 Sommaire

- [README des sous-projets](#🔗-readme-des-sous-projets)
- [Architecture générale](#📁-architecture-générale)
- [Base de données](#🗄-base-de-données)
- [Choix techniques transverses](#⚙️-choix-techniques-transverses)
- [Git Hook automatisé : Lefthook](#🪝-git-hook-automatisé-lefthook)
- [ESLint](#eslint)
- [Prettier](#prettier)
- [Jest — Tests unitaires](#🧩-jest-—-tests-unitaires)
- [Supertest — Tests d’intégration API](#🌐-supertest-—-tests-dintégration-api)
- [Base de données de test](#🗄️-base-de-données-de-test)
- [Playwright — Tests End-to-End](#🎭-playwright-—-tests-end-to-end)
- [Conteneurisation Docker](#🐳-conteneurisation-docker)
- [Volumes Docker](#-volumes-docker)
- [Intégration continue avec Github Actions](#intégration-continue-avec-github-actions)
- [Déploiement](#déploiement)

---

### 🔗 README des sous-projets

- [Writer]  (https://github.com/simplon-alt-dist-p7/wm-rajar-ms_writer)
- [Reader]  (https://github.com/simplon-alt-dist-p7/wn-rajar-ms_reader)

---

## 📁 Architecture générale

```
aline-worldnews/
│
├─ wm-rajar-ms_writer/
│  │
│  ├─ FRONT/
│  │   ├─ E2E/
│  │   └─ Dockerfile
│  │
│  ├─ BACK/
│  │   ├─ tests/
│  │   │   ├─ unit/
│  │   │   └─ integration/
│  │   ├─ dist/
│  │   └─ Dockerfile
│  │
│  └─ BDD/
│
├─ wn-rajar-ms_reader/
│  │
│  ├─ Frontend/
│  │   ├─ E2E/
│  │   └─ Dockerfile
│  │
│  ├─ Backend/
│  │   ├─ tests/
│  │   │   ├─ unit/
│  │   │   └─ integration/
│  │   └─ Dockerfile
│  │
│  └─ BDD/
│
├─ lefthook/
├─ lefthook.yml
├─ docker-compose.yml
├─ docker-compose.test.yml
├─ package.json
├─ prettier.config.js
├─ run-tests.js
└─ settings.json
```


## 🗄 Base de données

Les dossiers `BDD/` sont présents dans Writer et Reader.

Ils contiennent le même schéma de base de données.

Ce choix a été fait pour :

- faciliter le travail en équipe.

 ---

## ⚙️ Choix techniques transverses

Les microservices **Writer** et **Reader** utilisent des stacks différentes (voir README propres à chaque projet).

Ce README racine documente uniquement les outils et choix techniques communs à l’ensemble du projet.

### Rappel des stacks :

- READER / BACK : JavaScript + Prisma
- WRITER / BACK : TypeScript + TypeORM

Les frontends sont alignés sur les choix techniques de leur backend respectif.

---

## 🪝 Git Hook automatisé : Lefthook

Lefthook permet d’exécuter automatiquement des tâches avant un commit ou un push. L'objectif est de maintenir la qualité du code et éviter de pousser des erreurs ou du code mal formaté.

Contrairement à **husky** par exemple, il gère bien différentes stacks dans le même projet, et l'intégration CI/CD demande moins d'ajustement.

Fichier de configuration : **lefthook.yml** 
- pre-commit : avant chaque commit, Lefthook exécute Prettier sur tous les fichiers source de chaque service/front pour les formater automatiquement.

- pre-push : avant chaque push, Lefthook lance tous les tests unitaires et d’intégration via run-tests.js. Cela évite de pousser du code cassé ou non testé.

### ESlint ###

Chaque microservice et front possède sa propre configuration ESLint (eslint.config.js) adaptée à sa stack. Pour que VSCode détecte correctement les configurations dans tous les sous-dossiers, le fichier settings.json à la racine indique les règles spécifiques de chaque configuration
ESLint analyse le code pour détecter les erreurs, mauvaises pratiques et incohérences de style.

- Présent dans tous les projets (back et front)
- Intégré avec Lefthook pour bloquer les commits si des erreurs sont détectées
- Configuration dans .eslintrc.js ou directement via package.json
- Compatible avec TypeScript via 

``@typescript-eslint/parser`` et ``@typescript-eslinteslint-plugin``

### Prettier ###

Prettier est utilisé pour uniformiser le style du code (indentation, quotes, fin de ligne…).

La configuration est présente à la racine du projet dans ``prettier.config.js``


## 🧩 Jest — Tests unitaires

Utilisé dans les backends et frontends

**Pourquoi ?**

- Rapide et simple à configurer  
- Expérience préalable avec Jest, je souhaitai ne pas trop m'éparpiller dans les outils.
- Support natif du mocking, pas besoin d'une librairie supplémentaire.  

Les dépendances externes (services, base de données, modules) sont mockées pour tester uniquement le comportement du module ciblé, tout en évitant d’impacter les données réelles.

---

## 🌐 Supertest — Tests d’intégration API

Utilisé pour tester les routes HTTP et l’intégration complète des composants backend, depuis la requête jusqu’à la base de données. (route, controller, accès à la base, réponse envoyée)

**Pourquoi ?**

- Permet de simuler des requêtes HTTP
- Teste l’application dans sa globalité (routes, middlewares, contrôleurs)
- Expérience préalable, je souhaitai ne pas trop m'éparpiller dans les outils.

Les tests d’intégration interagissent avec la base de données.

👉 C’est pourquoi une base de données dédiée aux tests est utilisée (voir section plus bas). Contrairement aux tests unitaires, on ne peut pas simplement “mocker” les tests d’intégration : ils doivent parcourir réellement tout le chemin des composants pour être efficaces. La BDD de test permet ainsi de valider ce fonctionnement sans risquer de modifier ou supprimer les données réelles.

---

## 🗄️ Base de données de test

Chaque backend (Writer/Reader) utilise une **base de données dédiée aux tests**.  

- Les tests unitaires n’interagissent généralement pas avec la base, ils se basent sur des mocks.  
- Les tests d’intégration utilisent **Supertest** et parcourent tout le chemin de la requête jusqu’à la base.  

### Configuration

La BDD de test est contenue dans un conteneur dédié, défini dans le `docker-compose.test.yml` à la racine.

### Fichier `.env.test` et configuration

Le fichier `.env.test` contient les variables spécifiques à la BDD de test (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, etc.).

### Writer – TypeORM

Dans `database.ts`, `.env.test` est chargé automatiquement lorsque `NODE_ENV=test` est défini.  
La variable `NODE_ENV=test` est définie de manière **portable** via `cross-env` dans les scripts du `package.json` :  

### Reader – Prisma (à venir)

Le client Prisma existant se trouve dans `src/lib/prisma.js`.  
Ce fichier est adapté pour charger `.env.test` lorsque `NODE_ENV=test`. 

### Commandes utiles

```bash
# Lancer la BDD de test
docker-compose -f docker-compose.test.yml up --build

# Arrêter la BDD de test
docker-compose -f docker-compose.test.yml down

# Arrêter et supprimer les données de la BDD test (supression du volumes)
docker-compose -f docker-compose.test.yml down -v
```

## 🎭 Playwright — Tests End-to-End

Présent dans chaque frontend pour valider le comportement réel de l’application du point de vue utilisateur.
J’ai choisi Playwright car c’est un outil que j'utilise déjà en entreprise, ce qui m’a permis de ne pas m’éparpiller et de me concentrer sur la configuration et le déploiement.

Structure type :
```
E2E/
  ├─ pages/           # Page Object Model (POM)
  └─ tests/           # spec.ts
```
**Pourquoi ?**

- Gestion simple des fixtures, screenshots et traces.
- Idéal pour un déploiement automatisé, car il facilite le lancement des tests E2E globaux.
- Permet d’éviter des erreurs liées aux routes partagées entre plusieurs fronts grâce à une configuration adaptée.

Il est possible d'installer playwright à la base du projet. Cependant, il y a 2 fronts différents avec les mêmes route. Il faut configurer playwright pour tester les 2 fronts et adapter ses tests avec des conditions particulières pour éviter des erreurs au lancement du test. 

Ce choix peut-être judicieux pour un déploiement automatisé, car il facilite le lancement des tests e2e globaux. 
Cependant j'ai fais le choix d'installer playwright dans les 2 fronts séparément, là encore pour me faciliter la configuration et les tests.

## ⚡ Commandes pour lancer les tests : 

Chaque microservice/front possède son propre dossier et sa propre configuration.  

💡 **À savoir :**  
- Pour les **tests unitaires et d’intégration**, il faut se placer dans le dossier du back correspondant.  

#### Lancer tous les tests unitaires et intégrations depuis un service
```bash 
npm test
```

- Le fichier **run-tests.js** à la racine permet de :  
  - itérer automatiquement sur **tous les services** (Writer/Reader, Front/Back)  
  - lancer **unitaires et intégration** en un seul endroit  
  - garantir que chaque test est exécuté dans le bon dossier avec la bonne configuration 

#### Lancer tous les tests unitaires et intégrations depuis la racine du projet
```bash 
node run-tests.js
```


💡 **À savoir :**  
Les scripts de tests utilisent `cross-env` pour définir la variable `NODE_ENV=test` de manière portable.  
Cela garantit que les tests d’intégration se connectent à la **BDD de test**, peu importe le système d’exploitation.


💡 **À savoir :**  
Il est possible de lancer les tests **unitaires** et **d’intégration** séparément.  
Pour cela, il faut configurer chaque backend avec **deux scripts distincts** dans le `package.json` (fichiers de config à créer):  

```json
{
  "scripts": {
    "test:unit": "jest --config jest.unit.config.js",
    "test:integration": "jest --config
    jest.integration.config.js"
  }
}
```

Ensuite de lancer :

```bash 
npm run test:unit
npm run test:integration
```

### Playwright - configuration des commandes dans le package.json de chaque front

```bash
#Lancer tous les tests
npx playwright test

#Mode watch pour développement rapide
```npx playwright test --watch```

#Interface graphique pour visualiser les tests
```npx playwright test --ui```

#Debugger étape par étape
```npx playwright test --debug```

#Ouvrir le rapport HTML
```npx playwright show-report```

#Lancer avec navigateur visible
```npx playwright test --headed```

#Lancer un test spécifique
```npx playwright test E2E/main-articles.spec.ts```
```
---

## 🐳 Conteneurisation Docker

Docker est utilisé pour uniformiser l’environnement de développement et simplifier le déploiement, que ce soit en local ou dans CI/CD.

**Pourquoi ?**

- Isolation des environnements : chaque conteneur fonctionne indépendamment, donc les dépendances d’un front n’interfèrent pas avec celles d’un autre front ou du back.
- Reproductibilité : les conteneurs garantissent que l’application tourne exactement de la même façon sur toutes les machines et serveurs.
- Compatibilité CI/CD : facile à intégrer dans des pipelines de déploiement automatisés.

### Dockerfiles dans chaque projet

Chaque front et back possède son propre Dockerfile :

- Décrit comment construire l’image du projet (installations, build, configurations).
- Permet de gérer les dépendances spécifiques à chaque projet sans conflit.
- Facilite les mises à jour ou modifications isolées.

A titre d'exemple, on y trouve : 
- ```FROM``` – image de base pour ton conteneur. (ex: node).
- ```WORKDIR``` – dossier de travail à l’intérieur du conteneur. (ex: /app)
- ```COPY``` – copie des fichiers depuis ton projet vers le conteneur. (ex: package.json)
- ```RUN``` – exécute une commande (souvent pour installer des dépendances). (ex: npm i)
- ```EXPOSE``` – indique le port sur lequel l’application écoute. (ex: 3000)
- ```CMD``` – commande qui démarre l’application quand le conteneur se lance. (ex: npm, start)

💡 **À savoir :** 

Le dossier `dist/` présent dans writer/back contient le code compilé du backend TypeScript.

- TypeScript est utilisé pour développer le backend (`.ts`) mais Node.js ne peut exécuter que du `.js`.
- Le script `"build": "tsc"` (package.json) compile le code source depuis `src/` vers `dist/`.

---> **Dans Dockerfile :**

- `RUN npm run build`  
  - Compile le TypeScript en JavaScript **au moment de construire l’image**.  
  - Résultat : le dossier `dist/` est créé **dans l’image** et prêt à être exécuté.

- `CMD ["npm", "start"]`  
  - Lance le serveur Node.js **quand le conteneur tourne**.  
  - Ici, il exécute `node dist/index.js`, donc le code déjà compilé.


### Docker Compose à la racine
- **Docker Compose rassemble tous les services** (fronts, back, bases de données) dans un seul fichier.  
- Définit les **ports exposés** et les **réseaux internes**, pour que les services puissent communiquer facilement entre eux.  
- Simplifie la configuration de **la base de données de test** et des services associés. 
- **Healthcheck** : assure que la base est prête avant de lancer les tests.

#### Commandes :

- `docker-compose up --build` : construire et démarrer tous les conteneurs
- `docker-compose up` : démarre tous les conteneurs déjà construit
- `docker-compose down`: arrêter et supprimer les conteneurs

###  Exemples des conteneurs, images et ports dans ce projet

| Conteneur | Image | Port conteneur | Port exposé sur machine | Rôle |
|-----------|-------|----------------|------------------------|------|
| `db-test` | `postgres:15` | 5432 | 5433 | Base de test. Postgres écoute sur 5432 dans le conteneur, exposé sur 5433 pour éviter un conflit avec la DB principale. |
| `db` | `postgres:15` | 5432 | 5432 | Base principale, accessible directement sur 5432. |
| `reader-front` | `aline-worldnews-reader-front` | 5175 | 5175 | Frontend reader |
| `writer-front` | `aline-worldnews-writer-front` | 5174 | 5174 | Frontend writer|
| `writer-back` | `aline-worldnews-writer-back` | 5000 | 5000 | Backend writer|
| `reader-back` | `aline-worldnews-reader-back` | 5001 | 5001 | Backend reader|

💡 **Explications**  

- Les **ports internes** (colonne “Port conteneur”) correspondent à ce que le service écoute **dans le conteneur**.  
- Les **ports exposés en local** (colonne “Port exposé sur machine”) permettent de se connecter depuis le PC.  
- Pour la DB de test, le port en local est différent (`5433`) pour éviter tout conflit avec la DB principale (`5432`).  
- Tous les autres services gardent le même port interne et externe car ils n’entrent pas en conflit entre eux étant donné qu'ils sont sur des images différentes.

Ici, je n'ai pas de PORTS en local pour les back et front. Mais on pourrait très bien les rajouter soit : 
- en exposant un port différent sur mon pc dans Docker Compose

Exemple : 5176:5174 → le PC peut se connecte sur localhost:5176, et Docker redirige vers 5174 dans le conteneur

- en modifiant tle front pour écouter directement sur un port local quand je ne passe pas par Docker

Exemple : process.env.LOCAL_PORT = 5176 → npm start en local ouvre ce port

---

###  Volumes Docker

Les **volumes** servent à stocker les données de façon persistante, même si un conteneur est supprimé ou reconstruit.  

Exemples de volumes utilisés dans ce projet :  

- `aline-worldnews_pgdata`  contient les données des bases Postgres associées au projet `aline-worldnews`.  

---

## Intégration continue avec Github Actions

(A faire)

---

## Déploiement

(A faire)