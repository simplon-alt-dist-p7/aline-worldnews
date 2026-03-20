import { test } from '@playwright/test';
import { UpdatePage } from '../pages/updatePage';

test.describe("Mise à jour d'un article", () => {
  let updatePage: UpdatePage;

  test.beforeEach(async ({ page }) => {
    updatePage = new UpdatePage(page);

    const articleId = 1;
    await updatePage.goto(articleId);
  });

  test("Vérifier la mise à jour d'un article", async () => {
    // Soumettre le formulaire
    await updatePage.submitForm();
    // Fermer la modale et attendre la redirection vers la liste
    await updatePage.closeSuccessModal();
  });
});
