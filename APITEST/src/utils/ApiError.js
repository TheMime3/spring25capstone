export class ApiError extends Error {
  constructor(message, status = 500, code = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}