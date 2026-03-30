const request = require('supertest');
const app = require('../../index');

describe('/articles', () => {
  //article/id
  test.each([['deslettres'], ['!?&']])('return 400 for invalid id', async (invalidId) => {
    const response = await request(app).get(`/articles/${invalidId}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Erreur de validation');
  });

  //getallarticles
  test('retourne les 5 premiers articles avec leur catégorie', async () => {
    const res = await request(app).get('/articles');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('articles');
    expect(res.body).toHaveProperty('categories');
    expect(Array.isArray(res.body.articles)).toBe(true);
    expect(res.body.articles.length).toBeGreaterThan(0);
  });
});
