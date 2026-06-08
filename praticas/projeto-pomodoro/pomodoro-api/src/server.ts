import { app } from './app.js'; // ⬅️ Adicionado o .js aqui

const PORT = process.env.PORT || 3333;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});