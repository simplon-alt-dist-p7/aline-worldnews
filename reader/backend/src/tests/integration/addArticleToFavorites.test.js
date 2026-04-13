const request = require('supertest');
const app = require('../../index');
const prisma = require('../../lib/prisma');

describe('/articles/:id/favorite', () => {
  afterEach(async () => {
    await prisma.articleFavorite.deleteMany();
  });

  test.each([['deslettres'], ['-5']])('return 400 for invalid id', async (invalidId) => {
    const response = await request(app).post(`/articles/${invalidId}/favorite`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Erreur de validation');
  });

  test('ajouter un article aux favoris', async () => {
    //on récupère un article Id valide
    const articlesResponse = await request(app).get('/articles');
    const articleId = articlesResponse.body.articles[0].id;

    //on ajoute cet article aux favoris
    const response = await request(app).post(`/articles/${articleId}/favorite`);
    expect(response.status).toBe(201);
  });
});
