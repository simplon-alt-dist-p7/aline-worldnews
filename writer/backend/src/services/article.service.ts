// services/article.service.ts
import { articleRepository } from '../repository/article.repository.js';
import { Article } from '../models/article.model.js';
import type { CreateArticleDTO, UpdateArticleDTO } from '../types/article.types.js';
import { ValidationError } from '../errors/ValidationError.js';
import { ConflictError } from '../errors/ConflictError.js';
import { AppDataSource } from '../config/database.js';

export class ArticleService {
  async getArticleById(id: number): Promise<Article | null> {
    return await articleRepository.findById(id);
  }

  async createArticle(data: CreateArticleDTO): Promise<Article> {
    if (!data.title || data.title.trim().length === 0)
      throw new ValidationError('Le titre est requis');
    if (data.title.length > 300)
      throw new ValidationError('Le titre ne peut pas dépasser 300 caractères');
    if (!data.subtitle || data.subtitle.trim().length === 0)
      throw new ValidationError('Le sous-titre est requis');
    if (data.subtitle.length > 300)
      throw new ValidationError('Le sous-titre ne peut pas dépasser 300 caractères');
    if (!data.subhead || data.subhead.trim().length === 0)
      throw new ValidationError('Le chapeau est requis');
    if (data.subhead.length > 1000)
      throw new ValidationError('Le chapeau ne peut pas dépasser 1000 caractères');
    if (!data.body || data.body.trim().length === 0)
      throw new ValidationError('Le contenu est requis');
    if (!data.categoryId) throw new ValidationError('Une catégorie est requise');

    const sanitizedData: CreateArticleDTO = {
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      subhead: data.subhead.trim(),
      body: data.body.trim(),
      categoryId: data.categoryId,
    };

    try {
      return await articleRepository.create(sanitizedData);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictError('Un article avec ce titre existe déjà pour cette date');
      }
      throw error;
    }
  }

  async updateArticle(id: number, data: UpdateArticleDTO): Promise<Article | null> {
    const existingArticle = await articleRepository.findById(id);
    if (!existingArticle) return null;

    const sanitizedData: Partial<Article> = {};
    if (data.title !== undefined) sanitizedData.title = data.title.trim();
    if (data.subtitle !== undefined) sanitizedData.subtitle = data.subtitle.trim();
    if (data.subhead !== undefined) sanitizedData.subhead = data.subhead.trim();
    if (data.body !== undefined) sanitizedData.body = data.body.trim();
    if (data.categoryId !== undefined) sanitizedData.category = { id: data.categoryId } as any;
    sanitizedData.update_date = new Date();

    return await articleRepository.update(id, sanitizedData);
  }

  async softDeleteArticle(id: number): Promise<Article | null> {
    const article = await articleRepository.findById(id);
    if (!article) return null;
    await articleRepository.softDelete(id);
    return articleRepository.findById(id);
  }

  async restoreArticle(id: number): Promise<Article | null> {
    // findById avec withDeleted:true pour trouver les soft deleted
    // mais on utilise une requête directe sans relations pour éviter le bug TypeORM
    const exists = await AppDataSource.getRepository(Article)
      .createQueryBuilder('article')
      .withDeleted()
      .where('article.id = :id', { id })
      .getOne();

    if (!exists) return null;

    await articleRepository.restore(id);
    return articleRepository.findById(id);
  }
}

// Export d’une instance par défaut
export const articleService = new ArticleService();
