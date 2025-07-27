import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Prisma specific errors
  if (error.code === 'P2002') {
    res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this value already exists'
    });
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      error: 'Not found',
      message: 'The requested resource was not found'
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired',
      message: 'The provided token has expired'
    });
    return;
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      message: error.message,
      details: error.errors
    });
    return;
  }

  // Rate limit errors
  if (error.type === 'rate-limit') {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded'
    });
    return;
  }

  // Default error
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};
