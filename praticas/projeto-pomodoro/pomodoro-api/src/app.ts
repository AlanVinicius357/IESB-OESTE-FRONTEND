import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// 🔄 Importações com extensão .js exigidas pelo modulo node16/nodenext
import { userRoutes } from './routes/user.routes.js';
import { taskRoutes } from './routes/tasks.routes.js';
import { sessionRoutes } from './routes/session.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// 🔓 Rota de Teste Global / Health Check
app.get('/health', (req, res) => {
  res.json({ ok: true, database: 'connected' });
});

// 🔓 Rotas Públicas Principais (Usuários e Sessões de Login)
app.use(userRoutes);    
app.use(sessionRoutes); 

// 🔒 Rotas Oficiais do Projeto (Deixando os arquivos de rotas controlarem tudo)
app.use(taskRoutes);
app.use(settingsRoutes); 

export { app };