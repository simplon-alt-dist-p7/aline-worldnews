import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {
  test('pagination bouton suivant', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Récupérer le titre du premier article de la page 1
    const firstArticleTitle = await page.locator('.article-card h2').first().textContent();

    // Cliquer sur “Suivant”
    await page.click('button:has-text("Suivant")');

    // Vérifier que la page a changé (titre différent)
    const newFirstTitle = await page.locator('.article-card h2').first().textContent();
    expect(newFirstTitle).not.toBe(firstArticleTitle);
  });

  test('affichage par catégorie', async ({ page }) => {
    // Aller sur la page d’accueil
    await page.goto('http://localhost:5175');

    // Attendre que le dropdown soit visible et sélectionner la catégorie
    const categorySelect = page.locator('#category-select');
    await expect(categorySelect).toBeVisible();
    const chosenCategory = 'Science';
    await categorySelect.selectOption(chosenCategory);

    // Récupérer tous les articles affichés
    const articles = page.locator('.article-card');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    // Vérifier que chaque article a la bonne catégorie
    for (let i = 0; i < count; i++) {
      const articleCategory = await articles
        .nth(i)
        .locator('.article-card__category')
        .textContent();
      expect(articleCategory.trim()).toBe(chosenCategory);
    }
  });

  test('articleId', async ({ page }) => {
    await page.goto('http://localhost:5175');
    const articleCard = page.locator('.article-card').first();
    await articleCard.click();

    const favoriteButton = page.locator('.favorite-button');
    await favoriteButton.click();
  });
});
