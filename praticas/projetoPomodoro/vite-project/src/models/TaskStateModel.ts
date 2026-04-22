import type { TaskModel } from './TaskModel';

export type TaskStateModel = {
  // 1. O Histórico: Um array contendo todas as tarefas já feitas ou em andamento
  tasks: TaskModel[];

  // 2. Controle do Timer
  secondsRemaining: number; // Quantos segundos faltam no cronômetro atual
  formattedSecondsRemaining: string; // O texto pronto para a tela (ex: "25:00")
  activeTask: TaskModel | null; // Qual tarefa está rodando AGORA (se houver)

  // 3. Controle do Ciclo Pomodoro
  currentCycle: number; // Vai de 1 a 8 (controla as bolinhas coloridas)

  // 4. Configurações do Usuário
  config: {
    workTime: number; // Tempo de foco (ex: 25)
    shortBreakTime: number; // Descanso curto (ex: 5)
    longBreakTime: number; // Descanso longo (ex: 15)
  };
};