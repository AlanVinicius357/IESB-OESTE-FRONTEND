import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const settingsRoutes = Router();


const GLOBAL_SETTINGS_ID = 'global-settings';

// 2.2 Buscar Settings (GET /settings)
settingsRoutes.get('/settings', async (req, res) => {
  try {
    
    let settings = await prisma.settings.findUnique({
      where: { userId: GLOBAL_SETTINGS_ID },
    });

   
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: GLOBAL_SETTINGS_ID,
          focusTime: 25,  
          shortBreak: 5,
          longBreak: 15,
        },
      });
    }

    return res.json({
      workTime: settings.focusTime,
      shortBreakTime: settings.shortBreak,
      longBreakTime: settings.longBreak
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao buscar configurações.' });
  }
});

// 2.3 Atualizar Settings (PUT /settings)
settingsRoutes.put('/settings', async (req, res) => {
  try {
    
    const { workTime, shortBreakTime, longBreakTime } = req.body;

    if (workTime === undefined || shortBreakTime === undefined || longBreakTime === undefined) {
      return res.status(400).json({ message: 'Todos os tempos são obrigatórios!' });
    }

    const updatedSettings = await prisma.settings.upsert({
      where: { userId: GLOBAL_SETTINGS_ID },
      update: {
        focusTime: Number(workTime),
        shortBreak: Number(shortBreakTime),
        longBreak: Number(longBreakTime),
      },
      create: {
        userId: GLOBAL_SETTINGS_ID,
        focusTime: Number(workTime),
        shortBreak: Number(shortBreakTime),
        longBreak: Number(longBreakTime),
      },
    });

    return res.json({
      workTime: updatedSettings.focusTime,
      shortBreakTime: updatedSettings.shortBreak,
      longBreakTime: updatedSettings.longBreak
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao atualizar configurações.' });
  } 
});