const express = require('express');
const router = express.Router({ mergeParams: true }); // 🔹 Obligatoire pour récupérer :id
const { getCommentsByArticleId, addCommentToArticle } = require('../controllers/comments');
const validate = require('../schemas/comments.schema');

// GET tous les commentaires d’un article
router.get('/', getCommentsByArticleId);

// POST un nouveau commentaire
router.post('/', validate(validate.addCommentToArticleSchema, 'body'), addCommentToArticle);

module.exports = router;
