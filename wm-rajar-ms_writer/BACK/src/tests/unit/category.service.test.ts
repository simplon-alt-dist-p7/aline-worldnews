import { CategoryService } from "../../services/category.service";
import { ValidationError } from "../../errors/ValidationError";

// Mock du repository
jest.mock('../../repository/category.repository', () => ({
  categoryRepository: {
    findById: jest.fn(),
  },
}));

describe('CategoryService', () => {
    let service: CategoryService;

    beforeEach(() => {
        service = new CategoryService();
        jest.clearAllMocks();
    });

  test('getCategoryById --> ValidationError if id is missing', async () => {
    await expect(service.getCategoryById(undefined as any)).rejects.toThrow(ValidationError);
  });
});
