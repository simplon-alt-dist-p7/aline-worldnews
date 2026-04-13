const CommentsService = require('../services/comments');
const commentsService = new CommentsService();

// Récupérer les commentaires d'un article
async function getCommentsByArticleId(req, res) {
  try {
    const articleId = Number(req.params.id);
    const comments = await commentsService.getCommentsByArticleId(articleId);

    res.status(200).json(comments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Ajouter un commentaire à un article
async function addCommentToArticle(req, res) {
  try {
    const articleId = Number(req.params.id);
    const { content } = req.body;
    const newComment = await commentsService.addCommentToArticle(articleId, { content });
    res.status(201).json({ comment: newComment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

module.exports = { getCommentsByArticleId, addCommentToArticle };
