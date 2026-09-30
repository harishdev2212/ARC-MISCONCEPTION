export class DiagnosticError extends Error {
  code: string;
  details?: string;

  constructor(code: string, message: string, details?: string) {
    super(message);
    this.name = 'DiagnosticError';
    this.code = code;
    this.details = details;
  }
}
