import { Page, expect } from '@playwright/test';

export class ArticlesPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/articles');
        await this.page.waitForLoadState('networkidle');
    }

    async isPageLoaded() {
        await expect(this.page.getByRole('heading', { name: 'Gestion des articles' })).toBeVisible();
        await expect(this.page.getByRole('article').first()).toBeVisible();
    }   
    
    async getArticleCount() {
        return await this.page.getByRole('article').count();
    }

    // Cliquer sur le bouton "Page suivante"
    async goToNextPage() {
        await this.page.getByRole('button', { name: 'Page suivante' }).first().click();
        await expect(this.page.getByRole('button', { name: 'Page suivante' })).toBeVisible();
    }

    // Cliquer sur le bouton "Page précédente"
    async goToPreviousPage() {
        await this.page.getByRole('button', { name: 'Page précédente' }).first().click();
        await expect(this.page.getByRole('button', { name: 'Page précédente' })).toBeVisible();
    }

    // cliquer sur le bouton Modifier d'un article
    async editArticle() {
        await this.page.locator('li.article-row')
            .first()
            .getByRole('button', { name: /modifier/i })
            .click();
        }

}