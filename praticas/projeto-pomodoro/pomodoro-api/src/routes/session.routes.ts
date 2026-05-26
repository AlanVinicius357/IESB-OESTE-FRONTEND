import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const sessionRoutes = Router();

// 1. Salvar uma nova sessão de Pomodoro concluída (POST /sessions)
sessionRoutes.post('/sessions', async (req, res) => {
  try {
    const { type, duration, userId } = req.body;

    // Validação básica dos dados recebidos
    if (!type || !duration || !userId) {
      return res.status(400).json({ message: 'Tipo, duração e ID do usuário são obrigatórios!' });
    }

    // Validar se o tipo é um dos aceitos pelo app
    const validTypes = ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo de sessão inválido. Use: FOCUS, SHORT_BREAK ou LONG_BREAK.' });
    }

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Salvar a sessão no banco de dados
    const session = await prisma.session.create({
      data: {
        type,
        duration: Number(duration), // Garante que vai como número inteiro
        userId,
      },
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao salvar sessão.' });
  }
});

// 2. Listar o histórico de sessões do usuário (GET /sessions/:userId)
sessionRoutes.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // As sessões mais recentes aparecem primeiro
    });

    return res.json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao buscar histórico de sessões.' });
  }
});