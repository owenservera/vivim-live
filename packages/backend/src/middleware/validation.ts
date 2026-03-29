import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error-handler';

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid request body', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query);
      req.query = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid query parameters', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params);
      req.params = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid URL parameters', error.errors));
      } else {
        next(error);
      }
    }
  };
}

export function validateHeaders<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.headers);
      req.headers = result as typeof req.headers;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid request headers', error.errors));
      } else {
        next(error);
      }
    }
  };
}
