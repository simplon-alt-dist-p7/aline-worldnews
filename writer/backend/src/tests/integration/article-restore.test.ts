import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { articleController } from '../../controller/article.controller.js';
import { AppDataSource } from '../../config/database.js';

const app: Express = express();
app.use(express.json());
app.post('/articles/:id/restore', (req, res, next) =>
  articleController.restoreArticle(req, res, next),
);

let articleId: number;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();

  const articleRepo = AppDataSource.getRepository('Article');
  const categoryRepo = AppDataSource.getRepository('Category');

  const category = await categoryRepo.findOne({ where: {} });
  if (!category) throw new Error('Aucune catégorie disponible en BDD de test');

  const article = articleRepo.create({
    title: 'Article de test restore',
    subtitle: 'Sous-titre de test',
    subhead: 'Chapeau de test',
    body: 'Contenu de test',
    category,
  });
  const saved = await articleRepo.save(article);
  articleId = saved.id;

  await articleRepo.softDelete(articleId);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    const articleRepo = AppDataSource.getRepository('Article');
    await articleRepo.delete(articleId);
    await AppDataSource.destroy();
  }
});

describe('POST /articles/:id/restore', () => {
  it('should return 400 if id is not a number', async () => {
    const res = await request(app).post('/articles/abc/restore');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID d'article invalide ou manquant");
  });

  it('should return 400 if id is negative', async () => {
    const res = await request(app).post('/articles/-1/restore');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ID d'article invalide ou manquant");
  });

  it('should return 404 if article not found', async () => {
    const res = await request(app).post('/articles/999999999/restore');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Article non trouvé');
  });

  it('should restore the article', async () => {
    const res = await request(app).post(`/articles/${articleId}/restore`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Article restauré avec succès');
    expect(res.body.data).toBeDefined();
  });
});
