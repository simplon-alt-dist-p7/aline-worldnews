import express from 'express';
import request from 'supertest';
import { articleController } from '../../controller/article.controller.js';
import { AppDataSource } from '../../config/database.js';

const app = express();
app.use(express.json());
app.put('/articles/:id', (req, res, next) => articleController.updateArticle(req, res, next));

let articleId: number;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const articleRepo = AppDataSource.getRepository('Article');
  const article = await articleRepo.findOneBy({ title: 'Découverte scientifique : une nouvelle exoplanète habitable' });
  if (!article) throw new Error('article not found');
  articleId = article.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

console.log(AppDataSource.options.database);


describe('PUT /articles/:id', () => {
  it('should update the title in the test_db', async () => {
    const res = await request(app)
      .put(`/articles/${articleId}`)
      .send({ title: 'Découverte scientifique : Urion : une nouvelle exoplanète habitable' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Découverte scientifique : Urion : une nouvelle exoplanète habitable');
    expect(res.body.message).toBe('Article mis à jour avec succès');
  });
});
