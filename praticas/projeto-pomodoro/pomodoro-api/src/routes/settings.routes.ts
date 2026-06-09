import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
export const settingsRoutes = Router();

const parseMinutes = (value: any): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 25 : parsed;
};


const handlePutSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let userId = (req as any).user?.id;
    
  
    if (!userId) {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) {
        userId = fallbackUser.id;
      } else {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }
    }

  
    const { focusTime, workTime, focus, shortBreak, shortBreakTime, longBreak, longBreakTime } = req.body;

   
    const finalFocus = parseMinutes(focusTime ?? workTime ?? focus ?? 25);
    const finalShort = parseMinutes(shortBreak ?? shortBreakTime ?? 5);
    const finalLong = parseMinutes(longBreak ?? longBreakTime ?? 15);


    const existingSettings = await prisma.settings.findFirst({
      where: { userId: String(userId) },
    });

    let updatedSettings;

    if (existingSettings) {
      updatedSettings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          focusTime: finalFocus,
          shortBreak: finalShort,
          longBreak: finalLong,
        },
      });
    } else {
      updatedSettings = await prisma.settings.create({
        data: {
          userId: String(userId),
          focusTime: finalFocus,
          shortBreak: finalShort,
          longBreak: finalLong,
        },
      });
    }

    const data = updatedSettings as any;

    return res.json({
      id: data.id ? String(data.id) : undefined,
      userId: data.userId ? String(data.userId) : undefined,
      focusTime: Number(data.focusTime ?? 25),
      shortBreak: Number(data.shortBreak ?? 5),
      longBreak: Number(data.longBreak ?? 15),
      workTime: Number(data.focusTime ?? 25),
      shortBreakTime: Number(data.shortBreak ?? 5),
      longBreakTime: Number(data.longBreak ?? 15),
      type: "focus",
      duration: Number(data.focusTime ?? 25)
    });

  } catch (error) {
    console.error('Erro detalhado no PUT /settings:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar configurações.' });
  }
};

const handleGetSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let userId = (req as any).user?.id;

    if (!userId) {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) userId = fallbackUser.id;
    }

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    let settings = await prisma.settings.findFirst({
      where: { userId: String(userId) },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: String(userId),
          focusTime: 25,
          shortBreak: 5,
          longBreak: 15,
        },
      });
    }

    const data = settings as any;

    return res.json({
      id: data.id ? String(data.id) : undefined,
      userId: data.userId ? String(data.userId) : undefined,
      focusTime: Number(data.focusTime ?? 25),
      shortBreak: Number(data.shortBreak ?? 5),
      longBreak: Number(data.longBreak ?? 15),
      workTime: Number(data.focusTime ?? 25),
      shortBreakTime: Number(data.shortBreak ?? 5),
      longBreakTime: Number(data.longBreak ?? 15),
      type: "focus",
      duration: Number(data.focusTime ?? 25)
    });
  } catch (error) {
    console.error('Erro no GET /settings:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar configurações.' });
  }
};

settingsRoutes.get('/', authMiddleware as any, handleGetSettings);
settingsRoutes.get('/settings', authMiddleware as any, handleGetSettings);

settingsRoutes.put('/', authMiddleware as any, handlePutSettings);
settingsRoutes.put('/settings', authMiddleware as any, handlePutSettings);

export default settingsRoutes;