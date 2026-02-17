# Guide des Tests Playwright - Page Principale

## 📋 Résumé des tests

Le fichier `main-articles.spec.ts` contient une suite complète de tests pour la page de gestion des articles. Voici ce qui est couvert:

### Tests inclus:

1. **Affichage initial des articles**
   - Vérification du titre de la page
   - Présence d'au moins un article
   - Visibilité de la liste

2. **Scroll dans la liste**
   - Scroll vers le bas ✓
   - Scroll vers le haut ✓
   - Vérification de la position

3. **Navigation pagination**
   - Naviguer vers la page 2
   - Revenir à la page 1
   - Vérification du changement des articles

4. **Affichage de 10 articles**
   - Sélection du nombre d'articles par page
   - Vérification du changement du select
   - Affichage correct des articles

5. **Recherche d'article**
   - Remplissage de la barre de recherche
   - Soumission de la recherche
   - Affichage des résultats

6. **Réinitialisation de la recherche**
   - Effacement de la barre de recherche
   - Retour à l'affichage initial

7. **Modification d'article**
   - Navigation vers la page d'édition
   - Vérification des champs
   - Retour à la liste

8. **Création d'article**
   - Navigation vers le formulaire de création
   - Remplissage des champs
   - Soumission et validation

9. **Modification du statut**
   - Activation/Désactivation d'un article
   - Vérification du changement

10. **Pagination complète**
    - Vérification des contrôles de pagination
    - Affichage des informations

11. **Gestion des erreurs**
    - Affichage des messages d'erreur si présents

12. **Tests supplémentaires**
    - Accessibilité de base
    - Filtres par limite d'articles

## 🚀 Comment exécuter les tests

### 1. Installation (première fois)
```bash
cd PLAYWRIGHT
pnpm install
```

### 2. Exécuter tous les tests
```bash
pnpm run test
```

### 3. Exécuter les tests en mode watch (regarde les changements)
```bash
pnpm run test:watch
```

### 4. Exécuter un test spécifique
```bash
pnpm exec playwright test tests/main-articles.spec.ts
```

### 5. Exécuter avec UI mode (interface visuelle)
```bash
pnpm exec playwright test --ui
```

### 6. Afficher le rapport HTML
Après avoir exécuté les tests:
```bash
pnpm exec playwright show-report
```

## 📝 Prérequis

- ✅ Le serveur Frontend doit être démarré (`pnpm run dev` dans le dossier FRONT)
- ✅ Le serveur Backend doit être en ligne
- ✅ Les articles doivent être présents en base de données

## ⚙️ Configuration

La configuration se trouve dans `playwright.config.ts`:

**Configuration appliquée:**
- `baseURL`: `http://localhost:5173` (l'URL du frontend)
- `viewport`: `1280x720` (résolution standard)
- `webServer`: Lance automatiquement le serveur dev si absent
- `trace`: Enregistre les traces en cas d'échec

## 🔍 Structure des tests

Chaque test suit ce modèle:
1. **beforeEach**: Naviguer vers `/articles`
2. **Test principal**: Effectuer l'action
3. **Assertions**: Vérifier le résultat

## ✨ Points clés des tests

### Sélecteurs utilisés
- `article[class*="article-card"]` - Les cartes d'articles
- `select#limit` - Le sélecteur de limite d'articles
- `input[aria-label="Rechercher un article"]` - La barre de recherche
- `button[aria-label="Page suivante"]` - Bouton pagination
- `nav[aria-label="Pagination des articles"]` - Navigation pagination

### Attentes communes
- `page.waitForLoadState('networkidle')` - Attendre le chargement réseau
- `page.waitForSelector()` - Attendre un élément
- `expect().toBeVisible()` - Vérifier la visibilité
- `expect().toHaveValue()` - Vérifier la valeur d'un input

## 🐛 Dépannage

### Les tests échouent
1. Vérifiez que le frontend est démarré sur `http://localhost:5173`
2. Vérifiez que le backend est accessible
3. Vérifiez qu'il y a des articles en base de données

### Le serveur ne démarre pas
- Assurez-vous que les ports ne sont pas occupés
- Vérifiez les dépendances: `pnpm install`

### Les sélecteurs ne trouvent rien
- Inspectez les éléments avec le DevTools Playwright (`--debug`)
- Mettez à jour les sélecteurs en accord avec le code

## 📊 Résultats des tests

Après l'exécution, un rapport HTML est généré:
```
playwright-report/index.html
```

Ouvrez-le avec votre navigateur pour voir les détails.

## 🎯 Améliorations futures

- [ ] Tests sur les permissions d'accès
- [ ] Tests avec différentes résolutions (responsive)
- [ ] Tests de performance
- [ ] Tests de concurrence (plusieurs utilisateurs)
- [ ] Screenshots/Snapshots visuels
