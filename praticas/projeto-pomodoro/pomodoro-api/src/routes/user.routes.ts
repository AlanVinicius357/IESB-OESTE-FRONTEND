import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const userRoutes = Router();

// 1. Rota de Cadastro (Você já tem essa)
userRoutes.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
       return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está em uso!' });
    }

    const user = await prisma.user.create({
      data: { name, email, password },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
});

// 2. 🌟 NOVA ROTA: Rota de Login (Autenticação)
userRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar se os campos foram enviados
    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios!' });
    }

    // Buscar o usuário pelo e-mail no banco
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário não existir OU a senha estiver errada
    // Nota: Usamos uma mensagem genérica por segurança para não dar pistas a hackers
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Se deu tudo certo, retorna os dados do usuário
    // Em uma API real completa, aqui retornaríamos um Token JWT. Vamos deixar simples por enquanto!
    return res.json({
      message: 'Login realizado com sucesso! 🎉',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
});