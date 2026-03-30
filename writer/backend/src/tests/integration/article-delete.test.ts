import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { articleController } from '../../controller/article.controller.js';
import { AppDataSource } from '../../config/database.js';

const app: Express = express();
app.use(express.json());
app.delete('/articles/:id', (req, res, next) =>
  articleController.softDeleteArticle(req, res, next),
);

let articleId: number;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const articleRepo = AppDataSource.getRepository('Article');
  const article = await articleRepo.findOneBy({
    title: 'Découverte scientifique : une nouvelle exoplanète habitable',
  });
  if (!article) throw new Error('article not found');
  articleId = article.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    if (articleId) {
      const articleRepo = AppDataSource.getRepository('Article');
      await articleRepo.restore(articleId);
    }
    await AppDataSource.destroy();
  }
});

describe('DELETE /articles/:id', () => {
  it('should return 400 if id is not a number', async () => {
    const res = await request(app).delete('/articles/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID d'article invalide ou manquant");
  });

  it('should return 400 if id is negative', async () => {
    const res = await request(app).delete('/articles/-1');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID d'article invalide ou manquant");
  });

  it('should return 404 if article not found', async () => {
    const res = await request(app).delete('/articles/1000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Article non trouvé');
  });

  it('should delete the article', async () => {
    const res = await request(app).delete(`/articles/${articleId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Article supprimé avec succès');
    expect(res.body.data.title).toBe('Découverte scientifique : une nouvelle exoplanète habitable');
  });
});
