import { AppDataSource } from '../config/database.js';
import { Article } from '../models/article.model.js';
import { Category } from '../models/category.model.js';

export const setupTestDB = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const catRepo = AppDataSource.getRepository(Category);
  const articleRepo = AppDataSource.getRepository(Article);

  // Vider les tables pour repartir à zéro
  await articleRepo.clear();
  await catRepo.clear();

  // Créer une catégorie
  const cat = new Category();
  cat.title = 'Tech';
  await catRepo.save(cat);

  // Créer un article de test avec tous les champs obligatoires
  const article = new Article();
  article.title = 'Test Article';
  article.subtitle = 'Sous-titre test';
  article.subhead = 'Subhead test';
  article.body = 'Contenu test complet';
  article.category = cat;
  await articleRepo.save(article);
};
