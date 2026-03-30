import type { Request, Response, NextFunction } from 'express';
import { articleService } from '../services/article.service.js';
import type { CreateArticleDTO, UpdateArticleDTO } from '../types/article.types.js';

class ArticleController {
  async createArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, subtitle, subhead, body, categoryId } = req.body as CreateArticleDTO;

      if (!title || !subtitle || !subhead || !body || !categoryId) {
        res.status(400).json({
          error: 'Tous les champs sont requis (title, subtitle, subhead, body, categoryId)',
        });
        return;
      }

      const newArticle = await articleService.createArticle({
        title,
        subtitle,
        subhead,
        body,
        categoryId,
      });

      res.status(201).json({
        message: 'Article créé avec succès',
        data: newArticle,
      });
    } catch (error) {
      next(error);
    }
  }

  private parseId(param?: string | string[]): number | null {
    // Si c'est un tableau, on prend le premier élément
    const idStr = Array.isArray(param) ? param[0] : param;
    if (!idStr) return null;

    const id = parseInt(idStr, 10);
    return isNaN(id) || id <= 0 ? null : id;
  }

  async getArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = this.parseId(req.params.id);
      if (articleId === null) {
        res.status(400).json({ error: "ID d'article invalide ou manquant" });
        return;
      }

      const article = await articleService.getArticleById(articleId);
      if (!article) {
        res.status(404).json({ error: 'Article non trouvé' });
        return;
      }

      res.status(200).json({ data: article });
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = this.parseId(req.params.id);
      if (articleId === null) {
        res.status(400).json({ error: "ID d'article invalide ou manquant" });
        return;
      }

      const updatedArticle = await articleService.updateArticle(
        articleId,
        req.body as UpdateArticleDTO,
      );

      if (!updatedArticle) {
        res.status(404).json({ error: 'Article non trouvé' });
        return;
      }

      res.status(200).json({
        message: 'Article mis à jour avec succès',
        data: updatedArticle,
      });
    } catch (error) {
      next(error);
    }
  }

  async softDeleteArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = this.parseId(req.params.id);
      if (articleId === null) {
        res.status(400).json({ error: "ID d'article invalide ou manquant" });
        return;
      }

      const deleteArticle = await articleService.softDeleteArticle(articleId);
      if (!deleteArticle) {
        res.status(404).json({ error: 'Article non trouvé' });
        return;
      }

      res.status(200).json({
        message: 'Article supprimé avec succès',
        data: deleteArticle,
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = this.parseId(req.params.id);
      if (articleId === null) {
        res.status(400).json({ error: "ID d'article invalide ou manquant" });
        return;
      }

      const restoredArticle = await articleService.restoreArticle(articleId);

      if (!restoredArticle) {
        res.status(404).json({ error: 'Article non trouvé' });
        return;
      }

      res.status(200).json({
        message: 'Article restauré avec succès',
        data: restoredArticle,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const articleController = new ArticleController();
