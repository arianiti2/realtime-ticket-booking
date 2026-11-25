import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'CLIENT' | 'ORGANIZER';
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Nuk jeni i autorizuar, mungon token-i.' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: 'CLIENT' | 'ORGANIZER' };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token i pavlefshëm ose i skaduar.' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Nuk keni leje për këtë veprim.' });
      return;
    }
    next();
  };
};
