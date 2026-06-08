import { Router, Request, Response, RequestHandler } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

// Interface customizada para estender as propriedades injetadas pelo middleware
interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
  };
}

export const taskRoutes = Router();

// Aplica a tranca de segurança em todas as rotas de tarefas abaixo
taskRoutes.use(authMiddleware as RequestHandler);

// Função interna auxiliar fortemente tipada para extrair o ID do usuário com segurança
const getValidUserId = async (req: AuthenticatedRequest): Promise<string> => {
  let id = req.userId || req.user?.id;
  
  // Proteção local/Postman caso o token não venha na requisição
  if (!id) {
    const fallbackUser = await prisma.user.findFirst();
    if (fallbackUser) {
      id = fallbackUser.id;
    }
  }
  return id ? String(id) : '';
};

// =========================================================================
// 1. POST /tasks -> Criar tarefa vinculada ao usuário autenticado
// =========================================================================
taskRoutes.post('/tasks', (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    const { id, name, duration, type } = req.body as { id?: string; name?: string; duration?: number; type?: string };

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Título (name) é obrigatório!' });
    }

    const task = await prisma.task.create({
      data: {
        id: id || String(Date.now()),
        title: name,
        description: `Tipo: ${type || 'workTime'}, Duração: ${duration || 25}min`,
        userId: userId, // Vínculo real com o dono
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Erro no POST /tasks:', error);
    return res.status(500).json({ message: 'Erro interno ao criar tarefa.' });
  }
}) as RequestHandler);

// =========================================================================
// 2. GET /tasks -> Listar apenas as tarefas do usuário autenticado
// =========================================================================
taskRoutes.get('/tasks', (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
    
    return res.json(tasks);
  } catch (error) {
    console.error('Erro no GET /tasks:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar tarefas.' });
  }
}) as RequestHandler);

// =========================================================================
// 3. PATCH /tasks/:id/complete -> Concluir tarefa própria
// =========================================================================
taskRoutes.patch('/tasks/:id/complete', (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    
    // Força o ID a ser explicitamente tratado como uma string primitiva única
    const taskId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    // Garante que a tarefa existe e pertence ao usuário antes de atualizar
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { description: 'Tarefa concluída com sucesso!' },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Erro no PATCH /tasks/:id/complete:', error);
    return res.status(500).json({ message: 'Erro interno ao concluir tarefa.' });
  }
}) as RequestHandler);

// =========================================================================
// 4. PATCH /tasks/:id/interrupt -> Interromper tarefa própria
// =========================================================================
taskRoutes.patch('/tasks/:id/interrupt', (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    
    // Força o ID a ser tratado estritamente como uma string primitiva única
    const taskId = String(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { description: 'Tarefa interrompida pelo usuário.' },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error('Erro no PATCH /tasks/:id/interrupt:', error);
    return res.status(500).json({ message: 'Erro interno ao interromper tarefa.' });
  }
}) as RequestHandler);

// =========================================================================
// 5. DELETE /tasks -> Limpar apenas as tarefas do usuário autenticado
// =========================================================================
taskRoutes.delete('/tasks', (async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = await getValidUserId(req);
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    await prisma.task.deleteMany({
      where: { userId }
    });
    
    return res.status(204).send(); 
  } catch (error) {
    console.error('Erro no DELETE /tasks:', error);
    return res.status(500).json({ message: 'Erro interno ao deletar tarefas.' });
  }
}) as RequestHandler);

export default taskRoutes;