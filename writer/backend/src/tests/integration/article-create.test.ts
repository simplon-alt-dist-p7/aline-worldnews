import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../../config/database.js';
import { articleController } from '../../controller/article.controller.js';

const app = express();
app.use(express.json());
app.post('/articles', (req, res, next) => articleController.createArticle(req, res, next));

beforeAll(async () => {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    const articleRepo = AppDataSource.getRepository('Article');
    await articleRepo.softDelete({ title: 'Article de test création' });
    await AppDataSource.destroy();
  }
});

describe('CREATE /articles', () => {
  it('should create a new article', async () => {
    const res = await request(app).post('/articles').send({
      title: 'Article de test création',
      subtitle: 'Une nouvelle exoplanète habitable',
      subhead: 'Une nouvelle exoplanète habitable',
      body: 'Une nouvelle exoplanète habitable',
      categoryId: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Article créé avec succès');
    expect(res.body.data.title).toBe('Article de test création');
  });

  it('should return 400 if fields are missing', async () => {
    const res = await request(app).post('/articles').send({ title: 'Seulement le titre' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'Tous les champs sont requis (title, subtitle, subhead, body, categoryId)',
    );
  });
});
