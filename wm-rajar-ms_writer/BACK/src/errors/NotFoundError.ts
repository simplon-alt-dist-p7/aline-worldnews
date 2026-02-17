import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource non trouvée') {
    super(404, message);
  }
}
