import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/user.routes.js';
import { taskRoutes } from './routes/tasks.routes.js';
import { sessionRoutes } from './routes/session.routes.js';
import { settingsRoutes } from './routes/settings.routes.js'; // <-- Importando as configurações

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ ok: true, database: 'connected' });
});

app.use(userRoutes);
app.use(taskRoutes);
app.use(sessionRoutes);
app.use(settingsRoutes); 

const PORT = process.env.PORT || 3333;


app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});