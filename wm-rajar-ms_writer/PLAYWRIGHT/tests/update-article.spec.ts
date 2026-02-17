import { test, expect } from '@playwright/test';
import { UpdatePage } from '../pages/updatePage';
import { formUpdateData } from '../data/form-update';

test.describe("Mise à jour d'un article", () => {
  let updatePage: UpdatePage;

  test.beforeEach(async ({ page }) => {
    updatePage = new UpdatePage(page);

    // 🔹 Utiliser un ID d'article existant dans la DB
    const articleId = 1; // Remplacer par un ID valide si nécessaire

    // Aller sur la page d'édition frontend via le helper de page
    await updatePage.goto(articleId);
  });

  test("Vérifier la mise à jour d'un article", async ({ page }) => {
    // Remplir le formulaire avec les nouvelles données
    await updatePage.updateForm();

    // Soumettre le formulaire
    await updatePage.submitForm();

    // Vérifier la modale de succès affichée et que les champs du formulaire contiennent les nouvelles valeurs
    await expect(page.locator('dialog[data-type="success"]')).toBeVisible();
    await expect(page.locator('#title')).toHaveValue(formUpdateData.title);
    await expect(page.locator('#subtitle')).toHaveValue(formUpdateData.subtitle);
    await expect(page.locator('#subhead')).toHaveValue(formUpdateData.subhead);
    await expect(page.locator('#body')).toHaveValue(formUpdateData.body);

    // Fermer la modale et attendre la redirection vers la liste
    await updatePage.closeSuccessModal();
  });
});
