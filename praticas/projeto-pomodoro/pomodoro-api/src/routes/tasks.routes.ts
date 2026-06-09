import { Router, Request, Response, RequestHandler } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
  };
}

export const taskRoutes = Router();

// Aplica a trava de segurança JWT
taskRoutes.use(authMiddleware as RequestHandler);

// Auxiliar para capturar o ID do Usuário (Token, URL ou Fallback unificado do Alan)
const getValidUserId = async (req: AuthenticatedRequest): Promise<string> => {
  if (req.params.userId && req.params.userId !== ':userId') return String(req.params.userId);
  let id = req.userId || req.user?.id;
  if (!id) {
    const fallbackUser = await prisma.user.findFirst({
      where: { OR: [{ email: 'alan@gmail.com' }, { id: 'b0fd63dd-dbdf-4173-a724-b80a2e9ceb23' }] }
    }) || await prisma.user.findFirst();
    if (fallbackUser) id = fallbackUser.id;
  }
  return id ? String(id) : '';
};

// Auxiliar para extrair o ID da Task de qualquer canto que o Front envie
const getTaskIdFromRequest = (req: Request): string => {
  return String(req.params.id || req.body.id || req.body.taskId || '').trim();
};

// =========================================================================
// 1. CRIAR TAREFA (POST /tasks e variações)
// =========================================================================
const handleCreateTask = (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    const { id, name, title, text, duration, type } = req.body;

    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });
    const finalTitle = name || title || text || 'Nova Sessão Pomodoro';

    const task = await prisma.task.create({
      data: {
        id: id || String(Date.now()),
        title: finalTitle,
        description: `Tipo: ${type || 'focus'}, Duração: ${duration || 25}min`,
        userId: userId,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Erro no POST /tasks:', error);
    return res.status(500).json({ message: 'Erro interno ao criar tarefa.' });
  }
}) as RequestHandler;

taskRoutes.post('/tasks', handleCreateTask);
taskRoutes.post('/tasks/:userId', handleCreateTask);

// =========================================================================
// 2. LISTAR TAREFAS (GET /tasks e variações)
// =========================================================================
const handleListTasks = (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });
    
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.json(tasks);
  } catch (error) {
    console.error('Erro no GET /tasks:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar tarefas.' });
  }
}) as RequestHandler;

taskRoutes.get('/tasks', handleListTasks);
taskRoutes.get('/tasks/:userId', handleListTasks);

// =========================================================================
// 3. CONCLUIR TAREFA (Cobre todas as variações de rotas do Front)
// =========================================================================
const handleCompleteTask = (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    let taskId = getTaskIdFromRequest(req);

    // Se o front chamou uma rota genérica sem ID na URL, tentamos achar a última pendente
    if (!taskId && userId) {
      const lastTask = await prisma.task.findFirst({ where: { userId, status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
      if (lastTask) taskId = lastTask.id;
    }

    if (!taskId) return res.status(200).json({ message: 'Nenhuma tarefa ativa para concluir.' });

    const updatedTask = await prisma.task.updateMany({
      where: { id: taskId },
      data: { status: 'COMPLETED', description: 'Tarefa concluída com sucesso!' },
    });

    return res.json({ success: true, updatedTask });
  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    return res.status(500).json({ message: 'Erro interno ao concluir tarefa.' });
  }
}) as RequestHandler;

taskRoutes.patch('/tasks/:id/complete', handleCompleteTask);
taskRoutes.patch('/tasks/complete/:id', handleCompleteTask);
taskRoutes.patch('/complete', handleCompleteTask); // 🔥 Salva vidas se o front chamar direto

// =========================================================================
// 4. INTERROMPER TAREFA (Cobre o Erro 404 visto no painel de rede!)
// =========================================================================
const handleInterruptTask = (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    let taskId = getTaskIdFromRequest(req);

    // Se o front disparou apenas '/interrupt' genérico, captura a última tarefa aberta do usuário
    if (!taskId && userId) {
      const lastTask = await prisma.task.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      if (lastTask) taskId = lastTask.id;
    }

    // Se não houver tarefa nenhuma no banco, criamos uma retroativa para registrar o histórico do front!
    if (!taskId && userId) {
      const fallbackTask = await prisma.task.create({
        data: {
          id: String(Date.now()),
          title: 'Ciclo Interrompido',
          status: 'INTERRUPTED',
          description: 'Tarefa interrompida pelo usuário.',
          userId: userId
        }
      });
      return res.status(201).json(fallbackTask);
    }

    await prisma.task.updateMany({
      where: { id: taskId },
      data: { status: 'INTERRUPTED', description: 'Tarefa interrompida pelo usuário.' },
    });

    return res.json({ success: true, message: 'Tarefa marcada como interrompida.' });
  } catch (error) {
    console.error('Erro ao interromper tarefa:', error);
    return res.status(500).json({ message: 'Erro interno ao interromper tarefa.' });
  }
}) as RequestHandler;

taskRoutes.patch('/tasks/:id/interrupt', handleInterruptTask);
taskRoutes.patch('/tasks/interrupt/:id', handleInterruptTask);
taskRoutes.patch('/interrupt', handleInterruptTask); // 🚀 CAPTURA O ERRO 404 DA SUA IMAGEM!
taskRoutes.post('/interrupt', handleInterruptTask);  // Aceita caso o front envie como POST por engano

// =========================================================================
// 5. DELETAR / LIMPAR HISTÓRICO
// =========================================================================
taskRoutes.delete('/tasks', (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });
    await prisma.task.deleteMany({ where: { userId } });
    return res.status(204).send(); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao deletar.' });
  }
}) as RequestHandler);

export default taskRoutes;