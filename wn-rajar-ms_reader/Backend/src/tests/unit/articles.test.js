const ArticlesService = require('../../services/articles');
const prisma = require('../../lib/prisma');

//Contrairement à comments.test.js ici on récupère lib/prisma car on a besoin de méthodes différentes 
// dans le mock. Dans comments le mock était statique. 

jest.mock('../../lib/prisma', () => ({
  article: {
    findFirst: jest.fn().mockResolvedValue({ id: 1, title: 'Article 1', body: 'Contenu de l\'article 1' }),
  },
}));

describe('ArticlesService', () => {
  let articlesService;

  beforeEach(() => {
    articlesService = new ArticlesService();
  });

  test('Return article', async () => {
    const result = await articlesService.getById(1);
    console.log(result);
    expect(result).toHaveProperty('id'); 
    expect(result.body).toBe('Contenu de l\'article 1');
  });

  test('Article not found', async () => {
  prisma.article.findFirst.mockResolvedValueOnce(null); //ici on modifie le comportement du mock en null. 
  const result = await articlesService.getById(999);
  console.log(result);
  expect(result).toBeNull();
  });
});