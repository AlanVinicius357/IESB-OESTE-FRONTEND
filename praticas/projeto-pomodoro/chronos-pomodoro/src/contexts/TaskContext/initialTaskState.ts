import type { TaskStateModel } from '../../models/TaskStateModel';

export const initialTaskState: TaskStateModel = {
  tasks: [],
  secondsRemaining: 0,
  formattedSecondsRemaining: '00:00',
  activeTask: null,
  currentCycle: 0,
  config: {
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
  },
};


const configMapeado = initialTaskState.config as Record<string, unknown>;
configMapeado.focusTime = 25;
configMapeado.shortBreak = 5;
configMapeado.longBreak = 15;