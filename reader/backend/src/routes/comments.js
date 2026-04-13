const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCommentsByArticleId, addCommentToArticle } = require('../controllers/comments');
const validate = require('../middlewares/validate');
const { addCommentToArticleSchema } = require('../schemas/comments.schema');

// GET tous les commentaires d’un article
router.get('/', getCommentsByArticleId);

// POST un nouveau commentaire
router.post('/', validate(addCommentToArticleSchema, 'body'), addCommentToArticle);

module.exports = router;
