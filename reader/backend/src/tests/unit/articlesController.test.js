const {
  getArticleById,
  getFavoriteArticles,
  removeArticleFromFavorites,
  addArticleToFavorites,
} = require('../../controllers/articles');

jest.mock('../../services/articles', () => {
  return jest.fn().mockImplementation(() => ({
    getById: jest.fn(),
    getFavorites: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
  }));
});

const ArticlesService = require('../../services/articles');
let mockService;

beforeEach(() => {
  mockService = new ArticlesService();
  ArticlesService.mockClear();
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getArticleById', () => {
  test('retourne 404 si article non trouvé', async () => {
    mockService.getById.mockResolvedValue(null);
    const req = { params: { id: '999' } };
    const res = mockRes();
    await getArticleById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Article non trouvé' });
  });
});

describe('getFavoriteArticles', () => {
  test('retourne les favoris', async () => {
    mockService.getFavorites.mockResolvedValue([{ id: 1 }]);
    const req = {};
    const res = mockRes();
    await getFavoriteArticles(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('removeArticleFromFavorites', () => {
  test('supprime un favori', async () => {
    mockService.removeFromFavorites.mockResolvedValue({ id: 1 });
    const req = { params: { id: '1' } };
    const res = mockRes();
    await removeArticleFromFavorites(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('addArticleToFavorites', () => {
  test('retourne 404 si article non trouvé', async () => {
    mockService.getById.mockResolvedValue(null);
    const req = { params: { id: '999' } };
    const res = mockRes();
    await addArticleToFavorites(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
