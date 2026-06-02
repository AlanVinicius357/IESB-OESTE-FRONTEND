import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const taskRoutes = Router();

// 2.4 Criar Tarefa (POST /tasks)
taskRoutes.post('/tasks', async (req, res) => {
  try {
    const { id, name, duration, type, startDate } = req.body;

    // Se o professor mandar 'name', usamos como 'title'
    if (!name) {
      return res.status(400).json({ message: 'Título (name) é obrigatório!' });
    }

    // Criamos a tarefa vinculada ao 'global-settings'
    const task = await prisma.task.create({
      data: {
        id: id || String(Date.now()), // Caso o id não venha do Postman, gera um baseado no tempo
        title: name,
        description: `Tipo: ${type || 'workTime'}, Duração: ${duration || 25}min`,
        userId: 'global-settings',
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao criar tarefa.' });
  }
});

// 2.7 Listar Tasks (GET /tasks) e 2.9 Confirmar limpeza
taskRoutes.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: 'global-settings' },
      orderBy: { id: 'desc' }, // Ordena por ID decrescente (mais recentes primeiro)
    });
    return res.json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao buscar tarefas.' });
  }
});

// 2.5 Marcar Task como concluída (PATCH /tasks/:id/complete)
taskRoutes.patch('/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { 
        // Se no seu banco a coluna de data for completa, alteramos o status ou metadados
        description: 'Tarefa concluída com sucesso!'
      },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao concluir tarefa.' });
  }
});

// 2.6 Marcar Task como interrompida (PATCH /tasks/:id/interrupt)
taskRoutes.patch('/tasks/:id/interrupt', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { 
        description: 'Tarefa interrompida pelo usuário.'
      },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao interromper tarefa.' });
  }
});

// 2.8 Limpar histórico (DELETE /tasks)
taskRoutes.delete('/tasks', async (req, res) => {
  try {
    await prisma.task.deleteMany({
      where: { userId: 'global-settings' }
    });
    // Status 204 No Content conforme o PDF pede
    return res.status(204).send(); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao deletar tarefas.' });
  }
});