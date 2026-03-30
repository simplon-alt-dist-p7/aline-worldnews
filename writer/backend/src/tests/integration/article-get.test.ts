import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { articleController } from '../../controller/article.controller.js';
import { AppDataSource } from '../../config/database.js';

const app: Express = express();
app.use(express.json());
app.get('/articles/:id', (req, res, next) => articleController.getArticle(req, res, next));

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
    await AppDataSource.destroy();
  }
});

it('should return 400 if id is not a number', async () => {
  const res = await request(app).get('/articles/abc');

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("ID d'article invalide ou manquant");
});

it('should return 400 if id is negative', async () => {
  const res = await request(app).get('/articles/-1');

  expect(res.status).toBe(400);
  expect(res.body.error).toBe("ID d'article invalide ou manquant");
});
