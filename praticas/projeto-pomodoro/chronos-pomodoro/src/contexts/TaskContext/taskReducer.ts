import type { TaskStateModel } from '../../models/TaskStateModel';
import { formatSecondsToMinutes } from '../../utils/formatSecondsToMinutes';
import { getNextCycle } from '../../utils/getNextCycle';
import { initialTaskState } from './initialTaskState';
import { TaskActionTypes, type TaskActionModel } from './taskActions';

interface ApiTaskModel {
  id: string;
  name?: string;
  duration?: number;
  startDate?: string;
  createdAt?: string;
  status?: string;
  type?: string;
}

interface ApiSettings {
  id: string;
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  userId: string;
}

type ExtendedTaskActionModel = 
  | TaskActionModel
  | { type: 'SET_TASKS_FROM_API'; payload: ApiTaskModel[] }
  | { type: 'SET_SETTINGS_FROM_API'; payload: ApiSettings };

export function taskReducer(
  state: TaskStateModel,
  action: ExtendedTaskActionModel,
): TaskStateModel {
  switch (action.type) {
    case 'SET_TASKS_FROM_API': {
      const sanitizedTasks = action.payload.map((task: ApiTaskModel) => ({
        id: task.id,
        name: task.name || 'Tarefa sem nome',
        duration: task.duration || 0,
        startDate: task.startDate || task.createdAt || new Date().toISOString(),
        status: task.status || 'COMPLETED',
        type: task.type || 'workTime', 
      }));

      return {
        ...state,
        tasks: sanitizedTasks as unknown as TaskStateModel['tasks'],
      };
    }
    case 'SET_SETTINGS_FROM_API': {
      return {
        ...state,
        config: {
          workTime: action.payload.focusTime,
          shortBreakTime: action.payload.shortBreak,
          longBreakTime: action.payload.longBreak,
        },
      };
    }
    case TaskActionTypes.START_TASK: {
      const newTask = action.payload;
      const nextCycle = getNextCycle(state.currentCycle);
      const secondsRemaining = newTask.duration * 60;

      return {
        ...state,
        activeTask: newTask,
        currentCycle: nextCycle,
        secondsRemaining,
        formattedSecondsRemaining: formatSecondsToMinutes(secondsRemaining),
        tasks: [...state.tasks, newTask],
      };
    }
    case TaskActionTypes.INTERRUPT_TASK: {
      return {
        ...state,
        activeTask: null,
        secondsRemaining: 0,
        formattedSecondsRemaining: '00:00',
        tasks: state.tasks.map(task => {
          if (state.activeTask && state.activeTask.id === task.id) {
            return { ...task, status: 'INTERRUPTED' };
          }
          return task;
        }),
      };
    }
    case TaskActionTypes.COMPLETE_TASK: {
      return {
        ...state,
        activeTask: null,
        secondsRemaining: 0,
        formattedSecondsRemaining: '00:00',
        tasks: state.tasks.map(task => {
          if (state.activeTask && state.activeTask.id === task.id) {
            return { ...task, status: 'COMPLETED' };
          }
          return task;
        }),
      };
    }
    case TaskActionTypes.RESET_STATE: {
      return { ...initialTaskState };
    }
    case TaskActionTypes.COUNT_DOWN: {
      return {
        ...state,
        secondsRemaining: action.payload.secondsRemaining,
        formattedSecondsRemaining: formatSecondsToMinutes(
          action.payload.secondsRemaining,
        ),
      };
    }
    case TaskActionTypes.CHANGE_SETTINGS: {
      return { 
        ...state, 
        config: { 
          workTime: action.payload.workTime, 
          shortBreakTime: action.payload.shortBreakTime,
          longBreakTime: action.payload.longBreakTime
        } 
      };
    }
  }

  return state;
}