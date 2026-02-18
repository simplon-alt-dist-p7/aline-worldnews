import request from 'supertest';
import express from 'express';
import type { Express } from 'express';
import { getAllArticles } from '../../controller/article-list.controller.js';
import { AppDataSource } from '../../config/database.js';

const app: Express = express();
app.use(express.json());
app.get('/articles', getAllArticles);

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('get all articles', () => {
  it('should return paginated articles with default limit', async () => {
    const res = await request(app).get('/articles');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.articles)).toBe(true);
    expect(res.body.articles.length).toBeGreaterThan(0);
  });
});
