import {HttpException, HttpStatus} from '@nestjs/common';
import {describe, expect, it, vi} from 'vitest';

import {AllExceptionsFilter} from '../src/filters/all-exceptions.filter';

function createHost(response: {json: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn>}) {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  };
}

describe('AllExceptionsFilter', () => {
  it('formats not found http exceptions with normalized message', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({json}));
    const response = {json, status};
    const filter = new AllExceptionsFilter();

    filter.catch(new HttpException('should be replaced', HttpStatus.NOT_FOUND), createHost(response) as never);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      code: HttpStatus.NOT_FOUND,
      message: 'Not found',
    });
  });

  it('keeps custom message for other http exceptions', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({json}));
    const response = {json, status};
    const filter = new AllExceptionsFilter();

    filter.catch(new HttpException('Bad input', HttpStatus.BAD_REQUEST), createHost(response) as never);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      code: HttpStatus.BAD_REQUEST,
      message: 'Bad input',
    });
  });

  it('returns internal server error for unknown exceptions', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({json}));
    const response = {json, status};
    const filter = new AllExceptionsFilter();

    filter.catch('unexpected', createHost(response) as never);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
