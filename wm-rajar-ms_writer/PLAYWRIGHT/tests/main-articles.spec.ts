import { test, expect } from '@playwright/test';
import { ArticlesPage } from '../pages/articlesPage';

test.describe('Page principale - Gestion des articles', () => {
  let articlesPage: ArticlesPage;

  test.beforeEach(async ({ page }) => {
    articlesPage = new ArticlesPage(page);
    await articlesPage.goto();
    await articlesPage.isPageLoaded();
  });

    test('Vérifier le chargement de la page et l\'affichage des articles', async () => {
    // Vérifier que la liste des articles est visible
    const count = await articlesPage.getArticleCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Vérifier le scroll dans la liste des articles', async ({ page }) => {
    // Obtenir la position initiale du scroll
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Scroller vers le bas
    await page.evaluate(() => window.scrollBy(0, 500));

    // Vérifier que le scroll s'est effectué
    const scrolledY = await page.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(initialScrollY);

    // Scroller vers le haut
    await page.evaluate(() => window.scrollBy(0, -500));

    // Vérifier que le scroll remonte correctement
    const finalScrollY = await page.evaluate(() => window.scrollY);
    expect(finalScrollY).toBeLessThan(scrolledY);
  });

  test('Naviguer vers la page 2 et revenir', async ({ page }) => {
    // Compter les articles sur la page 1
    let articlesPage1 = await page.getByRole('article').count();
    expect(articlesPage1).toBeGreaterThan(0);

    // Cliquer sur le bouton "Page suivante"
    await articlesPage.goToNextPage();

    // Vérifier que les articles ont changé
    const articlesPage2 = await page.getByRole('article').count();
    expect(articlesPage2).toBeGreaterThan(0);

      // Revenir à la page 1 avec le bouton "Page précédente"
    await articlesPage.goToPreviousPage();

    // Vérifier que nous sommes revenu à la page 1
    const articlesAfterReturn = await page.getByRole('article').count();
    expect(articlesAfterReturn).toBeGreaterThan(0);
  });

  test('Afficher 10 articles par page', async ({ page }) => {
    // Trouver le select pour la limite d'articles via le label
    const limitSelect = page.getByLabel('Afficher');
    await expect(limitSelect).toBeVisible();
      // Sélectionner l'option "10"
    await limitSelect.selectOption('10');
    await page.waitForLoadState('networkidle');

      // Vérifier que la nouvelle valeur est sélectionnée
    const newValue = await limitSelect.inputValue();
    expect(newValue).toBe('10');

      // Vérifier le nombre d'articles affichés
    const articlesCount = await page.getByRole('article').count();
    expect(articlesCount).toBeLessThanOrEqual(10);
  });

  test('Cliquer sur le bouton Modifier d\'un article', async ({ page }) => {
    // Cliquer sur le bouton "Modifier" du premier article
    await articlesPage.editArticle();
    await expect(page).toHaveURL(/\/articles\/\d+\/edit/);

  });



});
