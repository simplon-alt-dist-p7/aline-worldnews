import { ArticleService } from '../../services/article.service.js';
import { articleRepository } from '../../repository/article.repository.js';

jest.mock('../../repository/article.repository', () => ({
  articleRepository: {
    findById: jest.fn(),
    softDelete: jest.fn(),
  },
}));

describe('ArticleService - softDeleteArticle', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = new ArticleService();
    jest.clearAllMocks();
  });

  test('softDeleteArticle --> article exists', async () => {
    const fakeArticleagain = {
      id: 2,
      title: 'Chris Pratt : prix nobel de la paix',
      subtitle: 'Chris Pratt reçoit le prix nobel pour avoir sauver la planète',
      subhead: 'J\'ai vraiment pas le temps de rédiger un chapeau',
      body: 'Move your body Chris',
      categoryId: 1,
      deletedAt: null,
    };

    (articleRepository.findById as jest.Mock).mockResolvedValue(fakeArticleagain);
    (articleRepository.softDelete as jest.Mock).mockResolvedValue(fakeArticleagain);

    await expect(service.softDeleteArticle(2)).resolves.toEqual(fakeArticleagain);

    });

});