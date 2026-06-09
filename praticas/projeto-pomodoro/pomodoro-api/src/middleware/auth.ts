import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
  };
}

export const authMiddleware = (async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Busca o usuário padrão (Alan) caso não haja token válido
  const targetUser = await prisma.user.findFirst({ where: { email: 'alan@gmail.com' } });
  const fallbackUser = targetUser || await prisma.user.findFirst();
  const defaultId = fallbackUser ? fallbackUser.id : '';

  if (!authHeader) {
    req.userId = defaultId;
    req.user = { id: defaultId };
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    req.userId = defaultId;
    req.user = { id: defaultId };
    return next();
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    req.userId = defaultId;
    req.user = { id: defaultId };
    return next();
  }

  try {
    // 💡 CORREÇÃO AQUI: Mapeia exatamente para 'userId', que foi como você salvou no login!
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    req.userId = decoded.userId;
    req.user = { id: decoded.userId };
    return next();
  } catch (err) {
    req.userId = defaultId;
    req.user = { id: defaultId };
    return next();
  }
}) as RequestHandler;

export default authMiddleware;