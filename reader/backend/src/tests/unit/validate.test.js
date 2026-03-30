const validate = require('../../middlewares/validate');
const { getArticleByIdSchema } = require('../../schemas/articles.schema');

// le middleware qui valide les données d'une requête avant qu'elles arrivent au controller.
// ici on veut tester l'id

describe('validate middleware', () => {
  test('id validate', () => {
    const validateId = validate(getArticleByIdSchema, 'params');

    const req = { params: { id: '1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    validateId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.params).toEqual({ id: 1 });
  });

  test('id validate error', () => {
    const validateId = validate(getArticleByIdSchema, 'params');

    const req = { params: { id: 'jecrisnimportequoi' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    validateId(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
