import { AppError } from './AppError';

export class ServiceError extends AppError {
  constructor(message: string = 'Service externe indisponible') {
    super(503, message);
  }
}
