import { Page, expect } from "@playwright/test";

export class UpdatePage {
    constructor(private page: Page) {}

    async goto(articleId: number) {
        await this.page.goto(`/articles/${articleId}/edit`);
        await expect(this.page.locator('#title')).toBeVisible();
    }

    async submitForm() {
        await this.page.click('button:has-text("Mettre à jour")');
        const modal = this.page.locator('dialog[data-type="success"]');
        await expect(modal).toBeVisible();
    }

    async closeSuccessModal() {
        const modal = this.page.locator('dialog[data-type="success"]');
        await modal.locator('button:has-text("Compris")').click();
        await this.page.waitForURL('**/articles', { timeout: 5000 }).catch(() => {});
    }
}    