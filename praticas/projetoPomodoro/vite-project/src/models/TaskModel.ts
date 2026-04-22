import type { TaskStateModel } from './TaskStateModel';

export type TaskModel = {
  id: string; // Identificador único da tarefa
  name: string; // Nome digitado no input
  duration: number; // Duração em minutos
  startDate: number; // Timestamp de quando começou (usamos number para facilitar o localStorage)
  completeDate: number | null; // quando o timer chega ao final
  interruptDate: number | null; // quando a task for interrompida
  type: keyof TaskStateModel['config'];
};