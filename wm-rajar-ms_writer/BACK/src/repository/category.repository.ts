import { AppDataSource } from '../config/database';
import { Category } from '../models/category.model';
import { Repository } from 'typeorm';

class CategoryRepository {
  private repository: Repository<Category>;

  constructor() {
    this.repository = AppDataSource.getRepository(Category);
  }

  async findById(id: number): Promise<Category | null> {
    return await this.repository.findOneBy({ id });
  }
}

export const categoryRepository = new CategoryRepository();
