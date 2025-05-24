import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  public readonly errorCode?: string;

  constructor(message: string, status: HttpStatus, errorCode?: string) {
    super(message, status);
    this.errorCode = errorCode;
  }
}
