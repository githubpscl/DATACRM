import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from './auth';

export const requestLogger = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Continue with request
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log response
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} - ${statusCode} - ${duration}ms`
    );
    
    // Store audit log for important actions
    if (req.method !== 'GET' && req.path.startsWith('/api/') && req.user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user?.id,
            action: `${req.method} ${req.path}`,
            resource: req.path.split('/')[2] || 'unknown',
            resourceId: req.params.id || null,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            newValues: req.method === 'POST' || req.method === 'PUT' ? req.body : null
          }
        });
      } catch (error) {
        console.error('Failed to create audit log:', error);
      }
    }
  });
  
  next();
};
