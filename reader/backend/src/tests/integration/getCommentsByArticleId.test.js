const request = require('supertest');
const app = require('../../index');

describe('/articles/:id/comments', () => {
  test.each([['deslettres'], ['-5']])('return 400 for invalid id', async (invalidId) => {
    const response = await request(app).get(`/articles/${invalidId}/comments`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Erreur de validation');
  });

  test("retourne les commentaires d'un article", async () => {
    const res = await request(app).get('/articles/1/comments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
