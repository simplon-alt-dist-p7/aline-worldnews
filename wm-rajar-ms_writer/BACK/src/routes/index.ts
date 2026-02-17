import { Router } from 'express';
import articleRoutes from './article.route.js';
import categoryRoutes from './category.route.js';
import geminiRoutes from './gemini.route.js';

export const router: Router = Router();

router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/gemini', geminiRoutes);

export default router;
