import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const userRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// 1. REGISTRAR NOVA CONTA (Com Hash de Senha Seguro)
userRoutes.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: 'A senha precisa ter pelo menos 4 caracteres.' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está em uso!' });
    }

    // Hash seguro da senha
    const hashedPassword = await bcrypt.hash(password, 8);

    // Cria o usuário e já anexa uma configuração padrão para ele
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        settings: {
          create: {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15
          }
        }
      },
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
});

// 2. AUTENTICAR NO LOGIN (Retornando Sessão JWT Segura)
userRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios!' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Compara o hash seguro do banco com a senha digitada
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    // Mecanismo de sessão segura por token JWT válido por 1 dia
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: 'Login realizado com sucesso! 🎉',
      token,
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

// 3. RECUPERAÇÃO DE SENHA (Ambiente de laboratório/simplificado)
userRoutes.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Cria um token randômico temporário de 6 dígitos para o aluno usar
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000); // 1 hora de validade

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires
      }
    });

    // Como é ambiente de laboratório, devolvemos o token no JSON simulando o recebimento por e-mail
    return res.json({
      message: 'Fluxo de recuperação gerado com sucesso!',
      instructions: 'Em produção um e-mail seria enviado. Para testes de laboratório, use o token abaixo.',
      token: token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno na recuperação de senha.' });
  }
});

// 4. REDEFINIR SENHA USANDO O TOKEN
userRoutes.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.passwordResetToken !== token) {
      return res.status(400).json({ message: 'Token de recuperação inválido ou expirado.' });
    }

    // Verifica se o token expirou
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: 'Token de recuperação expirou.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // Atualiza a senha e limpa os campos de controle do token
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return res.json({ message: 'Senha redefinida com sucesso! Agora você já pode fazer login.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno ao redefinir senha.' });
  }
});