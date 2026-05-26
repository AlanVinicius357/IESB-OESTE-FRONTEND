import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const settingsRoutes = Router();

// 1. Buscar Configurações (GET /settings/:userId)
// Nota: Passamos o :userId porque cada usuário terá sua própria configuração do Pomodoro
settingsRoutes.get('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Tenta encontrar a configuração do usuário
    // O Prisma gera a propriedade baseada no modelo "Settings", mapeando para "settings"
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    // Se o usuário acabou de se cadastrar e não tem settings, criamos o padrão (25, 5, 15)
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId,
          focusTime: 25,
          shortBreak: 5,
          longBreak: 15,
        },
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao buscar configurações.' });
  }
});

// 2. Atualizar Configurações (PUT /settings/:userId)
settingsRoutes.put('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { focusTime, shortBreak, longBreak } = req.body;

    // Validação básica se os campos numéricos foram enviados corretamente
    if (focusTime === undefined || shortBreak === undefined || longBreak === undefined) {
      return res.status(400).json({ message: 'Todos os tempos são obrigatórios!' });
    }

    // Atualiza ou cria as configurações daquele usuário usando upsert
    const updatedSettings = await prisma.settings.upsert({
      where: { userId },
      update: {
        focusTime: Number(focusTime),
        shortBreak: Number(shortBreak),
        longBreak: Number(longBreak),
      },
      create: {
        userId,
        focusTime: Number(focusTime),
        shortBreak: Number(shortBreak),
        longBreak: Number(longBreak),
      },
    });

    return res.json(updatedSettings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao atualizar configurações.' });
  }
});