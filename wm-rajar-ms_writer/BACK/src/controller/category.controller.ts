import type { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

class CategoryController {
  private parseId(param?: string | string[]): number | null {
    const idStr = Array.isArray(param) ? param[0] : param;
    if (!idStr) return null;

    const id = parseInt(idStr, 10);
    return isNaN(id) || id <= 0 ? null : id;
  }

  async getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = this.parseId(req.params.id);
      if (categoryId === null) {
        res.status(400).json({
          error: 'ID de la catégorie invalide ou manquant',
        });
        return;
      }

      const category = await categoryService.getCategoryById(categoryId);
      if (!category) {
        res.status(404).json({
          error: 'Catégorie non trouvée',
        });
        return;
      }

      res.status(200).json({
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
