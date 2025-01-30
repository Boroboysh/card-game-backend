import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomErrorException extends HttpException {
  constructor(errorCode: number, message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ errorCode, message }, status);
  }
}
