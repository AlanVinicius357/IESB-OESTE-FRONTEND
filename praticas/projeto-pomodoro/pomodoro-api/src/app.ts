import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Health Check (Critério de conclusão do Encontro 1)
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Rotas provisórias para o Encontro 1 (ajustaremos no Encontro 2)
app.get('/settings', async (req, res) => {
  try {
    // Procura as configurações no banco
    let settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    // Se o banco estiver vazio, retorna os valores padrão (requisito do roteiro)
    if (!settings) {
      return res.json({
        id: 1,
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
      });
    }

    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

export { app };