import { Router } from 'express';
import { getAllCategories } from '../controller/category-list.controller.js';
import { categoryController } from '../controller/category.controller.js';

export const router: Router = Router(); // <-- annotation explicite

// Récupérer toutes les catégories
router.get('/', getAllCategories);

// Récupérer une catégorie
router.get('/:id', (req, res, next) => categoryController.getCategory(req, res, next));

export default router;
