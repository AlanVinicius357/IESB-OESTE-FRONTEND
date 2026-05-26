import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const taskRoutes = Router();

// 1. Criar Tarefa (POST /tasks)
taskRoutes.post('/tasks', async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: 'Título e ID do usuário são obrigatórios!' });
    }

    const task = await prisma.task.create({
      data: { title, description, userId },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao criar tarefa.' });
  }
});

// 2. Listar Tarefas (GET /tasks/:userId)
taskRoutes.get('/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao buscar tarefas.' });
  }
});

// 3. Concluir Tarefa (PATCH /tasks/:id/complete) -> Exigido na Rubrica
taskRoutes.patch('/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao concluir tarefa.' });
  }
});

// 4. Interromper Tarefa (PATCH /tasks/:id/interrupt) -> Exigido na Rubrica
taskRoutes.patch('/tasks/:id/interrupt', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: 'INTERRUPTED' },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao interromper tarefa.' });
  }
});

// 5. Deletar Tarefa (DELETE /tasks/:id) -> Exigido na Rubrica
taskRoutes.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    return res.json({ message: 'Tarefa deletada com sucesso! 🗑️' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao deletar tarefa.' });
  }
});