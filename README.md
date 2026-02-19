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

### 🔗 README des sous-projets

- Writer – Frontend : `./wm-rajar-ms_writer/FRONT/README.md`
- Writer – Backend : `./wm-rajar-ms_writer/BACK/README.md`
- Reader – Frontend : `./wn-rajar-ms_reader/Frontend/README.md`
- Reader – Backend : `./wn-rajar-ms_reader/Backend/README.md`

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

## 🧪 Stratégie de tests

Le projet repose sur une stratégie de tests :

- Tests unitaires
- Tests d’intégration
- Tests End-to-End (E2E)

---

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

Commandes pour lancer les tests : 

#### Lancer tous les tests
```npx playwright test```
#### Mode watch pour développement rapide
```npx playwright test --watch```
#### Interface graphique pour visualiser les tests
```npx playwright test --ui```
#### Debugger étape par étape
```npx playwright test --debug```
#### Ouvrir le rapport HTML
```npx playwright show-report```
#### Lancer avec navigateur visible
```npx playwright test --headed```
#### Lancer un test spécifique
```npx playwright test E2E/main-articles.spec.ts```
 
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

### Docker Compose à la racine
- **Docker Compose rassemble tous les services** (fronts, back, bases de données) dans un seul fichier.  
- Définit les **ports exposés** et les **réseaux internes**, pour que les services puissent communiquer facilement entre eux.  
- Simplifie la configuration de **la base de données de test** et des services associés. 
- **Healthcheck** : assure que la base est prête avant de lancer les tests.

#### Commandes :

- `docker-compose up --build` : construire et démarrer tous les conteneurs
- `docker-compose up` : démarre tous les conteneurs déjà construit
- `docker-compose down`: arrêter et supprimer les conteneurs

## 🗄️ Base de données de test

Les tests d’intégration et E2E interagissent avec la base de données. Pour **ne pas altérer les données réelles**, une **BDD dédiée aux tests** est utilisée.  

#### Configuration Docker
La BDD de test est contenue dans un conteneur dédié, défini dans le `docker-compose.test.yml` à la racine.

#### Fichier `.env.test` et configuration 

- Le fichier `.env.test` contient les variables spécifiques à la BDD de test (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, etc.).  

#### TypeORM (writer)

Dans `database.ts`, `.env.test` est chargé automatiquement lorsque `NODE_ENV=test` est défini.

Cela permet aux tests d’utiliser le schema writer de test sans toucher aux données réelles.

#### Prisma (reader)

Le client Prisma existant est dans `src/lib/prisma.js`.

On adapte ce fichier pour charger `.env.test` lorsque `NODE_ENV=test`, ce qui permet aux tests de se connecter à la BDD test sans modifier les données réelles.


- Commandes utiles :  

```bash
docker-compose -f docker-compose.test.yml up --build
docker-compose -f docker-compose.test.yml down