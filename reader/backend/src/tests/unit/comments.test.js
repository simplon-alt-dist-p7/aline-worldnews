const CommentsService = require('../../services/comments');

// mock pour la validation du contenu du commentaire.
// fonction Jest (jest.fn()) qui simule le comportement de Prisma.
// Au lieu que Prisma aille vraiment en BDD, Jest intercepte l'appel et retourne directement un faux objet.
jest.mock('../../lib/prisma', () => ({
  comment: {
    create: jest.fn().mockResolvedValue({ id: 3, content: 'Ceci est un commentaire valide.' }),
  },
}));

describe('CommentsService', () => {
  let commentsService;

  beforeEach(() => {
    commentsService = new CommentsService();
  });

  test('content most longer', async () => {
    const longContent = 'motarepeter'.repeat(1001);
    await expect(commentsService.addCommentToArticle(1, { content: longContent })).rejects.toThrow(
      'Contenu trop long (max 1000 caractères)',
    ); //il faut reprendre le message d'erreur du service sinon le test échouera
  });

  test('content empty', async () => {
    await expect(commentsService.addCommentToArticle(2, { content: '' })).rejects.toThrow(
      'Contenu obligatoire',
    ); //"rejects" on s'atteend à l'erreur. .toThrow() ce que l'erreur doit indiquer
  });

  test('content valid', async () => {
    const validContent = 'Ceci est un commentaire valide.';
    const result = await commentsService.addCommentToArticle(3, { content: validContent });
    expect(result).toHaveProperty('id'); // Vérifier que l'objet retourné a une propriété 'id'
    expect(result.content).toBe(validContent); // Vérifier que le contenu du commentaire est correct
  });
});
