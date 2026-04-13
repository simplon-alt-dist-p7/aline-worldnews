const Joi = require('joi');

const addCommentToArticleSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'string.base': 'Le contenu doit être une chaîne de caractères',
    'string.empty': 'Le contenu ne peut pas être vide',
    'string.max': 'Le contenu ne peut pas dépasser 1000 caractères',
    'any.required': 'Le contenu est requis',
  }),
});

const getCommentsByArticleIdSchema = Joi.object({
  articleId: Joi.number().integer().positive().required().messages({
    'number.base': "L'ID de l'article doit être un nombre",
    'number.integer': "L'ID de l'article doit être un entier",
    'number.positive': "L'ID de l'article doit être positif",
    'any.required': "L'ID de l'article est requis",
  }),
});

module.exports = {
  getCommentsByArticleIdSchema,
  addCommentToArticleSchema,
};
