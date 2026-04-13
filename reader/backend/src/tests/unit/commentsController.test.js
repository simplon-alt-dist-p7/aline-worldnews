const { getCommentsByArticleId, addCommentToArticle } = require('../../controllers/comments');

const CommentsService = require('../../services/comments');

jest.mock('../../services/comments', () => {
  return jest.fn().mockImplementation(() => ({
    getCommentsByArticleId: jest.fn().mockResolvedValue([{ id: 1, content: 'un commentaire' }]),
    addCommentToArticle: jest.fn().mockResolvedValue({ id: 1, content: 'un commentaire' }),
  }));
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getCommentsByArticleId', () => {
  test('retourne les commentaires', async () => {
    const req = { params: { id: '1' } };
    const res = mockRes();
    await getCommentsByArticleId(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('addCommentToArticle', () => {
  test('ajoute un commentaire', async () => {
    const req = { params: { id: '1' }, body: { content: 'un commentaire' } };
    const res = mockRes();
    await addCommentToArticle(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ comment: { id: 1, content: 'un commentaire' } });
  });
});
