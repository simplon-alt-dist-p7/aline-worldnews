import { ArticleService } from '../../services/article.service';
import { articleRepository } from '../../repository/article.repository';

jest.mock('../../repository/article.repository', () => ({
  articleRepository: {
    create: jest.fn(),
  },
}));

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(() => {
    service = new ArticleService();
    jest.clearAllMocks();
  });

  test('createArticle --> input valide', async () => {

    const fakeArticle = {
      id: 1,
      title: 'Des E.T. cryogénisés découverts en Antarctique',
      subtitle: 'Chris Pratt réussi à sauver la planète en leur injectant un serum',
      subhead: 'j\'ai pas le temps de rédiger un chapeau',
      body: 'Encore moins un article',
      categoryId: 1,
    };

    (articleRepository.create as jest.Mock).mockResolvedValue(fakeArticle);
    //le but c'est que l'article créé soit bien un mock et non une vraie instance
    //mockResolvedValue est l'une des méthodes de jest pour renvoyer une valeur fake. 
    
    await expect(service.createArticle(fakeArticle)).resolves.toEqual(fakeArticle);

  });

});
