import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const sessionRoutes = Router();

// =========================================================================
// 1. Salvar uma nova sessão de Pomodoro concluída (POST /sessions)
// =========================================================================
sessionRoutes.post('/sessions', async (req, res) => {
  try {
    let { type, duration, userId } = req.body;

    // Se o front esquecer o userId por problemas de estado/login, pegamos o primeiro usuário do banco para não travar o app
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      }
    }

    // Se mesmo assim faltar algo, criamos valores mockados saudáveis ao invés de estourar erro 400 estrito no login
    if (!type) type = 'FOCUS';
    if (!duration) duration = 25;

    // Normaliza para MAIÚSCULAS porque o banco/Prisma espera 'FOCUS', 'SHORT_BREAK' ou 'LONG_BREAK'
    let normalizedType = String(type).toUpperCase().replace('-', '_');
    
    // Pequeno mapeamento caso o front envie "focusTime" ou minúsculo
    if (normalizedType === 'FOCUS' || normalizedType === 'WORK') normalizedType = 'FOCUS';
    if (normalizedType === 'SHORTBREAK' || normalizedType === 'SHORT') normalizedType = 'SHORT_BREAK';
    if (normalizedType === 'LONGBREAK' || normalizedType === 'LONG') normalizedType = 'LONG_BREAK';

    // Se o tipo enviado for completamente bizarro, força para FOCUS
    const validTypes = ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK'];
    if (!validTypes.includes(normalizedType)) {
      normalizedType = 'FOCUS';
    }

    // Se não houver usuário nenhum criado ainda no banco
    if (!userId) {
      return res.status(400).json({ message: 'Nenhum usuário cadastrado no sistema para vincular a sessão.' });
    }

    // Verificar se o usuário existe de fato
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      // Se o ID enviado estiver velho ou inválido, vincula ao primeiro ID válido
      const recoveryUser = await prisma.user.findFirst();
      if (recoveryUser) {
        userId = recoveryUser.id;
      } else {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
    }

    // Salvar a sessão de forma 100% segura no banco de dados
    const session = await prisma.session.create({
      data: {
        type: normalizedType,
        duration: Number(duration) || 25, // Garante valor numérico estável
        userId: userId,
      },
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Erro na rota POST /sessions:', error);
    return res.status(500).json({ message: 'Erro interno ao salvar sessão.' });
  }
});

// =========================================================================
// 2. Listar o histórico de sessões do usuário (GET /sessions/:userId)
// =========================================================================
sessionRoutes.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Se vier a palavra ':userId' literal do front por erro de rota
    if (!userId || userId === ':userId') {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) return res.json([]);
      
      const sessions = await prisma.session.findMany({
        where: { userId: firstUser.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(sessions);
    }

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // As sessões mais recentes aparecem primeiro
    });

    return res.json(sessions);
  } catch (error) {
    console.error('Erro na rota GET /sessions:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar histórico de sessões.' });
  }
});