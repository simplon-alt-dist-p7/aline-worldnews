# Bonnes pratiques et conventions Playwright

## 📐 Structure des tests

### Format de base
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature ou Page', () => {
  test.beforeEach(async ({ page }) => {
    // Setup commun à tous les tests
    await page.goto('/path');
  });

  test('Description claire de ce que testez', async ({ page }) => {
    // Arrange: Préparer les données
    
    // Act: Effectuer l'action
    
    // Assert: Vérifier le résultat
  });
});
```

## 🎯 Conventions de nommage

### Fichiers de test
- Format: `{feature}.spec.ts`
- Exemples: `main-articles.spec.ts`, `user-auth.spec.ts`

### Tests
- Décrire clairement ce que le test teste
- Format impératif: "Afficher les articles", "Naviguer vers la page 2"
- Être spécifique: ❌ "ça marche" → ✅ "Afficher 10 articles"

### Describe blocks
- Grouper les tests par feature
- Format: "Feature ou Page"
- Exemples: "Recherche d'articles", "Modification d'articles"

## 🔍 Sélecteurs recommandés

### Ordre de préférence
1. **Rôles ARIA** (meilleur, testent l'accessibilité)
   ```typescript
   page.getByRole('button', { name: 'Modifier' })
   page.getByRole('heading', { name: 'Titre' })
   page.getByRole('textbox', { name: 'Email' })
   ```

2. **Labels et placeholders** (bonnes)
   ```typescript
   page.getByLabel('Email')
   page.getByPlaceholder('Rechercher...')
   ```

3. **Aria-labels** (bon fallback)
   ```typescript
   page.locator('[aria-label="Fermer"]')
   ```

4. **Attributs spécifiques** (ok, mais moins robuste)
   ```typescript
   page.locator('input[type="search"]')
   page.locator('select#limit')
   ```

5. **Classes CSS** (à éviter, fragile)
   ```typescript
   // ❌ Éviter
   page.locator('[class*="article-card"]')
   ```

## ⏳ Attentes courantes

### Attendre les éléments
```typescript
// Attendre qu'un élément soit visible
await expect(page.getByRole('button')).toBeVisible();

// Attendre qu'un élément existe dans le DOM
await page.waitForSelector('button');

// Attendre le chargement complet
await page.waitForLoadState('networkidle');
```

### Vérifier le contenu
```typescript
// Vérifier la valeur d'un input
await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('test@test.com');

// Vérifier le texte affiché
await expect(page.getByRole('heading')).toContainText('Gestion des articles');

// Vérifier la visibilité
await expect(page.locator('#id')).toBeVisible();

// Vérifier qu'un élément n'est pas visible
await expect(page.locator('.modal')).not.toBeVisible();
```

## 🔄 Patterns courants

### Remplir et soumettre un formulaire
```typescript
const email = page.getByLabel('Email');
await email.fill('test@example.com');

const password = page.getByLabel('Mot de passe');
await password.fill('password123');

const submitButton = page.getByRole('button', { name: 'Se connecter' });
await submitButton.click();

// Attendre la redirection
await page.waitForURL('**/dashboard');
```

### Naviguer entre les pages
```typescript
// Cliquer sur un lien
await page.getByRole('link', { name: 'Modifier' }).click();

// Attendre la navigation
await page.waitForURL('**/edit');

// Faire un back
await page.goBack();
```

### Travailler avec les listes
```typescript
// Obtenir le nombre d'items
const count = await page.locator('[role="listitem"]').count();

// Itérer sur les items
const items = page.locator('[role="listitem"]');
for (let i = 0; i < await items.count(); i++) {
  const text = await items.nth(i).textContent();
  console.log(text);
}

// Cliquer sur le premier item contenant un texte
await items.filter({ hasText: 'Article 1' }).first().click();
```

### Sélects et dropdowns
```typescript
// Utiliser selectOption pour les selects HTML
const select = page.locator('select#category');
await select.selectOption('10');

// Cliquer et sélectionner dans un menu personnalisé
const trigger = page.getByRole('button', { name: 'Options' });
await trigger.click();

const option = page.getByRole('option', { name: 'Option 1' });
await option.click();
```

## 🚀 Optimisation des tests

### Performance
```typescript
// ✅ Bien: Réutiliser les locators
const button = page.getByRole('button', { name: 'Modifier' });
expect(await button.isVisible()).toBe(true);
await button.click();

// ❌ Moins bien: Créer le locator plusieurs fois
expect(await page.getByRole('button', { name: 'Modifier' }).isVisible()).toBe(true);
await page.getByRole('button', { name: 'Modifier' }).click();
```

### Attentes intelligentes
```typescript
// ✅ Bon: Playwright attend automatiquement
await page.getByRole('button').click(); // Attend la visibilité

// ❌ Moins optimal: Attendre puis interagir
await page.waitForSelector('button');
await page.locator('button').click();
```

### Gestion des timeouts
```typescript
// Timeout court pour les éléments censés être là
await page.waitForSelector('button', { timeout: 1000 });

// Timeout plus long pour les opérations réseau
await page.waitForLoadState('networkidle', { timeout: 30000 });

// Catcher les timeout
try {
  await page.waitForSelector('button', { timeout: 1000 });
} catch {
  console.log('Élément non trouvé');
}
```

## 📊 Assertions courantes

```typescript
// Visibilité
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Valeurs
expect(input).toHaveValue('test');
expect(element).toContainText('texte');
expect(element).toHaveAttribute('href', '/page');

// État
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(button).toBeChecked(); // Pour les checkboxes

// Autres
expect(page).toHaveURL('/articles');
expect(page).toHaveTitle('Titre de la page');
```

## 🐛 Anti-patterns à éviter

```typescript
// ❌ Pas d'attentes fixes
await page.waitForTimeout(1000); // Serait ok en dernier recours

// ❌ Pas de selecteurs fragiles
page.locator('.btn-primary.mr-2.p-4'); // CSS fragile

// ❌ Pas de tests trop larges
test('Tout le workflow d\'un utilisateur', async ({ page }) => {
  // Test trop gros, difficile à debugger
});

// ✅ Plutôt faire des tests petits et focalisés
test('Créer un article', async ({ page }) => { /* ... */ });
test('Modifier un article', async ({ page }) => { /* ... */ });
```

## 🎓 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-page)
- [Debugging Guide](https://playwright.dev/docs/debug)

## 💡 Tips pratiques

1. **Utilisez --debug pour déboguer**
   ```bash
   pnpm exec playwright test --debug tests/main-articles.spec.ts
   ```

2. **Utilisez --headed pour voir le navigateur**
   ```bash
   pnpm exec playwright test --headed
   ```

3. **Générez les tests avec le Codegen**
   ```bash
   pnpm exec playwright codegen http://localhost:5173
   ```

4. **Inspectez les éléments en temps réel**
   ```bash
   pnpm exec playwright inspector
   ```

5. **Prenez des screenshots et vidéos en cas d'échec**
   ```typescript
   await page.screenshot({ path: 'screenshot.png' });
   ```
