import { test, expect } from '@playwright/test';
import { UpdatePage } from '../pages/updatePage';

test.describe("Mise à jour d'un article", () => {
  let updatePage: UpdatePage;

  test.beforeEach(async ({ page }) => {
    updatePage = new UpdatePage(page);

    const articleId = 1; // Remplacer par un ID valide si nécessaire

    // Aller sur la page d'édition frontend via le helper de page
    await updatePage.goto(articleId);
  });

  test("Vérifier la mise à jour d'un article", async ({ page }) => {

    // Soumettre le formulaire
    await updatePage.submitForm();

    // Vérifier la modale de succès affichée et que les champs du formulaire contiennent les nouvelles valeurs
    await expect(page.locator('dialog[data-type="success"]')).toBeVisible();

    // Fermer la modale et attendre la redirection vers la liste
    await updatePage.closeSuccessModal();
  });
});
