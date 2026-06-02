import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const settingsRoutes = Router();

// ID estático que representará o nosso escopo global de configurações
const GLOBAL_SETTINGS_ID = 'global-settings';

// Função auxiliar para garantir que o "usuário global" exista de fato na tabela 'users'
async function ensureGlobalUserExists() {
  await prisma.user.upsert({
    where: { id: GLOBAL_SETTINGS_ID },
    update: {}, // Se já existir, não altera nada
    create: {
      id: GLOBAL_SETTINGS_ID,
      name: "Global System User",
      email: "global@chronos.local",
      password: "$arbitrary_secure_password_or_hash_123" // Campo obrigatório exigido pelo seu Schema
    },
  });
}

// 2.2 Buscar Settings (GET /settings)
settingsRoutes.get('/settings', async (req, res) => {
  try {
    // 1. Garante a existência do usuário para evitar quebra de Chave Estrangeira (FK)
    await ensureGlobalUserExists();
    
    let settings = await prisma.settings.findUnique({
      where: { userId: GLOBAL_SETTINGS_ID },
    });

    // 2. Se não existir configuração para este ID, cria com os valores padrões
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

    // 3. Retorna mapeado exatamente na estrutura que o professor quer no Postman
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

    // 1. Garante a existência do usuário aqui também
    await ensureGlobalUserExists();

    // 2. Atualiza ou cria o registro de configurações (Upsert)
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

    // 3. Retorna a resposta limpa para o Postman
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