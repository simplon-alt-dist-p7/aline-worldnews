# 🚀 Démarrage rapide - Tests Playwright

## 📋 Menu rapide

<details>
<summary><strong>Je veux juste exécuter les tests maintenant</strong></summary>

### Commandes rapides (depuis le dossier PLAYWRIGHT)

```bash
# Vérifier que les dépendances sont installées
pnpm install

# Lancer tous les tests
pnpm run test

# Ou avec UI (plus visuel)
pnpm run test:ui
```

</details>

<details>
<summary><strong>Les tests échouent, que faire?</strong></summary>

### Checklist de dépannage

1. **Vérifier que les serveurs tournent:**
   ```bash
   # Terminal 1
   cd BACK && pnpm run dev
   
   # Terminal 2
   cd FRONT && pnpm run dev
   ```

2. **Vérifier les ports:**
   - Frontend: http://localhost:5173 ✅
   - Backend: http://localhost:3000 (ou votre port) ✅

3. **Vérifier la base de données:**
   - Les articles sont présents ✅
   - Les catégories sont présentes ✅

4. **Relancer les tests:**
   ```bash
   cd PLAYWRIGHT && pnpm run test
   ```

5. **Enable le debug mode:**
   ```bash
   pnpm run test:debug
   ```

</details>

---

## 📍 Première utilisation - Étapes complètes

### Étape 1: Préparer 3 terminaux

```
┌─────────────────┬─────────────────┬──────────────────┐
│   Terminal 1    │   Terminal 2    │   Terminal 3     │
│   (BACK)        │   (FRONT)       │   (PLAYWRIGHT)   │
├─────────────────┼─────────────────┼──────────────────┤
│ cd BACK         │ cd FRONT        │ cd PLAYWRIGHT    │
│ pnpm run dev    │ pnpm run dev    │ pnpm install     │
│                 │                 │ pnpm run test:ui │
└─────────────────┴─────────────────┴──────────────────┘
```

### Étape 2: Vérifier que tout est prêt

```bash
# Dans le Terminal BACK - vous devez voir:
# ✓ Server ready at http://localhost:3000

# Dans le Terminal FRONT - vous devez voir:
# ✓ VITE v... ready in ... ms
# ➜  Local:   http://localhost:5173/

# Si OK, passer à l'étape 3
```

### Étape 3: Installer les dépendances Playwright

```bash
# Terminal 3 - PLAYWRIGHT
pnpm install

# Résultat attendu:
# added XXX packages in X.Xs
```

### Étape 4: Exécuter les tests

```bash
# Option A: Tests en mode texte
pnpm run test

# Option B: Tests avec interface UI (recommandé pour première fois)
pnpm run test:ui

# Option C: Lancer le navigateur et voir ce qui se passe
pnpm run test:headed
```

---

## 📊 Commandes disponibles

```bash
# Tous les scripts dans package.json
pnpm run test              # Exécute tous les tests
pnpm run test:watch       # Relance automatiquement lors de changements
pnpm run test:ui          # Interface visuelle (recommandé)
pnpm run test:debug       # Mode debug avec inspection
pnpm run test:report      # Affiche le rapport HTML après test
pnpm run test:headed      # Voir le navigateur faire les tests
pnpm run test:main        # Seulement les tests main-articles.spec.ts
```

---

## 🎯 Comprendre les résultats

### ✅ Tous les tests passent

```
Ran 12 test(s) in 34.9s
✓ 12 passed (34.9s)
```

**C'est bon! Tous les tests passent, votre page fonctionne correctement.**

### ✗ Un test échoue

```
✗ Créer un nouvel article et enregistrer (3.8s)
  → Error: page.goto: net::ERR_CONNECTION_REFUSED
   http://localhost:5173/articles/create
```

**Solution:** Vérifier que le frontend est bien démarré sur le port 5173

### ⏱️ Tests trop lents

Si les tests prennent plus d'une minute, ce n'est pas normal.

**Vérifier:**
- Connexion internet bonne
- Pas trop d'autres applications
- Base de données répond vite

---

## 🎬 Mode UI - Comment naviguer

```bash
pnpm run test:ui
```

Interface visuelle avec:
- **Listing des tests** - qui a passé/échoué
- **Lecture vidéo** - replay des actions
- **Locator** - inspecteur pour trouver des éléments
- **Filtres** - chercher un test spécifique
- **Debug** - étapes par étapes avec pause

Parfait pour déboguer rapidement! 🔍

---

## 🐛 Mode Debug - Pause et inspection

```bash
pnpm run test:debug
```

Cela lance Chromium avec les DevTools et vous permet de:
- ⏸️ Pauser avant chaque action
- 🔎 Inspecter les éléments
- 📝 Modifier les données au vol
- ▶️ Avancer étape par étape

Très utile pour comprendre pourquoi un test échoue!

---

## 📈 Générer le rapport

```bash
# Après avoir exécuté les tests
pnpm run test:report
```

Cela génère et ouvre un rapport HTML avec:
- 📊 Vue d'ensemble complète
- 🎥 Vidéos des tests échoués
- 📸 Screenshots
- 🔋 Traces détaillées
- ⏱️ Durées d'exécution

---

## 📋 Checklist avant de démarrer

- [ ] Backend démarré sur port 3000 (ou configuré)
- [ ] Frontend démarré sur port 5173
- [ ] Articles présents en base de données
- [ ] `pnpm install` exécuté dans PLAYWRIGHT
- [ ] Pas d'erreur de permission d'accès

---

## 🆘 Questions courantes

**Q: Où voir les fichiers de test?**
```
PLAYWRIGHT/tests/main-articles.spec.ts
```

**Q: Comment modifier un test?**
```
- Ouvrir main-articles.spec.ts
- Modifier le code
- Relancer avec pnpm run test:watch
```

**Q: Aucun test ne s'exécute?**
```
- Vérifier que playwright.config.ts existe
- Vérifier que tests/main-articles.spec.ts existe
- Relancer: pnpm install
```

**Q: Comment ajouter un nouveau test?**
```typescript
import { test, expect } from '@playwright/test';

test('Mon nouveau test', async ({ page }) => {
  await page.goto('/articles');
  // Votre code ici
});
```

---

## 🎓 Ressources supplémentaires

📖 **Documentation Playwright:**
- [page.goto()](https://playwright.dev/docs/api/class-page#page-goto)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging](https://playwright.dev/docs/debug)

---

## 🎪 Tips pro

1. **Utilisez getByRole pour plus de robustesse:**
   ```typescript
   page.getByRole('button', { name: 'Modifier' })  // ✅ Bon
   page.locator('.btn.modifier')                    // ❌ Fragile
   ```

2. **Attendez les éléments avec wisdom:**
   ```typescript
   await page.getByRole('button').click()  // Attend auto la visibilité
   ```

3. **Groupez les actions logiques:**
   ```typescript
   test('Scénario complet', async ({ page }) => {
     // Pas de test énorme, plutôt petits et focalisés
   });
   ```

4. **Utilisez `--headed` pour déboguer visuellement:**
   ```bash
   pnpm exec playwright test --headed
   ```

---

## 🎉 C'est prêt!

Vous avez maintenant une suite de tests Playwright complète!

```
✅ 12 tests créés
✅ Configuration automatique
✅ Documentation complète
✅ Scripts prêts à l'emploi

🚀 Happy testing! 🚀
```

---

**Besoin d'aide?** Consultez `TEST_GUIDE.md` ou `BEST_PRACTICES.md`
