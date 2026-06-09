import { useEffect, useReducer, useRef } from 'react';
import { initialTaskState } from './initialTaskState';
import { taskReducer } from './taskReducer';
import { TaskContext } from './TaskContext';
import { TimerWorkerManager } from '../../workers/TimerWorkerManager';
import { TaskActionTypes } from './taskActions';
import { loadBeep } from '../../utils/loadBeep';
import { showMessage } from '../../adapters/showMessage';
import type { TaskStateModel } from '../../models/TaskStateModel';

type TaskContextProviderProps = {
  children: React.ReactNode;
};

interface CustomAction {
  type: string;
  payload?: {
    id?: string;
    title?: string;
    name?: string;
    duration?: number;
  };
}

// ID sincronizado com o usuário Alan no banco de dados Docker
const USER_ID = 'b0fd63dd-dbdf-4173-a724-b80a2e9ceb23';
const API_URL = 'http://localhost:3333';

export function TaskContextProvider({ children }: TaskContextProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState, () => {
    const storageState = localStorage.getItem('state');
    if (storageState === null) return initialTaskState;
    const parsedStorageState = JSON.parse(storageState) as TaskStateModel;

    return {
      ...parsedStorageState,
      activeTask: null,
      secondsRemaining: 0,
      formattedSecondsRemaining: '00:00',
    };
  });

  type ReducerActionType = Parameters<typeof dispatch>[0];

  const playBeepRef = useRef<ReturnType<typeof loadBeep> | null>(null);
  const worker = TimerWorkerManager.getInstance();

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    async function loadInitialDataFromAPI() {
      try {
        console.log('[Chronos API] Carregando dados iniciais para o usuário:', USER_ID);
        const settingsRes = await fetch(`${API_URL}/settings/${USER_ID}`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          dispatch({ type: 'SET_SETTINGS_FROM_API', payload: settingsData });
        }

        const tasksRes = await fetch(`${API_URL}/tasks/${USER_ID}`);
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          console.log('[Chronos API] Tarefas carregadas do banco:', tasksData);
          dispatch({ type: 'SET_TASKS_FROM_API', payload: tasksData });
        }
      } catch (err) {
        console.error('[Chronos API] Erro ao conectar com o backend no carregamento inicial:', err);
      }
    }
    loadInitialDataFromAPI();
  }, []);

  useEffect(() => {
    worker.onmessage(async (e: MessageEvent) => {
      const countDownSeconds = e.data;
      const currentState = stateRef.current;

      if (countDownSeconds <= 0) {
        if (playBeepRef.current) {
          playBeepRef.current();
          playBeepRef.current = null;
        }

        if (currentState.activeTask) {
          try {
            const configMapeado = currentState.config as Record<string, unknown> | null;
            const taskMapeada = currentState.activeTask as Record<string, unknown>;

            const workTime = typeof configMapeado?.workTime === 'number' ? configMapeado.workTime : 25;
            const duration = typeof taskMapeada.duration === 'number' ? taskMapeada.duration : 25;
            const fallbackDuration = workTime || duration;

            const taskId = currentState.activeTask.id || 'last';
            console.log('[Chronos API] Finalizando ciclo automaticamente para a task:', taskId);
            
            await fetch(`${API_URL}/tasks/${taskId}/complete`, { method: 'PATCH' });
            
            await fetch(`${API_URL}/sessions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: taskMapeada.name || taskMapeada.title || 'Tarefa Concluída',
                type: 'focusTime', 
                duration: fallbackDuration,
                userId: USER_ID,
              }),
            });
          } catch (err) {
            console.error('[Chronos API] Erro ao concluir tarefa automaticamente:', err);
          }
        }

        dispatch({ type: TaskActionTypes.COMPLETE_TASK });
        worker.terminate();
      } else {
        dispatch({
          type: TaskActionTypes.COUNT_DOWN,
          payload: { secondsRemaining: countDownSeconds },
        });
      }
    });
  }, [worker]); 

  const customDispatch = async (action: ReducerActionType) => {
    const customAction = action as unknown as CustomAction;
    console.log('[Chronos Monitor] Action disparada no front-end:', customAction.type, customAction.payload);
    
    if (customAction.type === TaskActionTypes.START_TASK) {
      try {
        const inputTaskName = (document.getElementById('task-name-input') as HTMLInputElement | null)?.value;
        const taskTitle = customAction.payload?.title || customAction.payload?.name || inputTaskName || 'Nova Tarefa Pomodoro';
        const taskId = customAction.payload?.id || String(Date.now());
        
        const configMapeado = state.config as Record<string, unknown> | null;
        const workTimeFromConfig = typeof configMapeado?.workTime === 'number' ? configMapeado.workTime : 25;
        const taskDuration = customAction.payload?.duration || workTimeFromConfig;

        console.log('[Chronos API] Tentando enviar POST /tasks com dados:', { id: taskId, title: taskTitle, duration: taskDuration });

        const response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: taskId,
            title: taskTitle,
            duration: taskDuration,
            type: 'workTime',
            userId: USER_ID 
          }),
        });

        console.log('[Chronos API] Resposta recebida do POST /tasks. Status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Chronos API] O servidor recusou a criação da tarefa:', errorText);
        }
      } catch (err) {
        console.error('[Chronos API] Erro fatal de rede ao tentar criar a tarefa via POST:', err);
      }
    }

    // Monitora a ação de interrupção clicada no botão vermelho
    if (customAction.type === TaskActionTypes.INTERRUPT_TASK) {
      try {
        const taskId = state.activeTask?.id || 'last';
        console.log('[Chronos API] Tentando enviar PATCH de interrupção para a tarefa:', taskId);
        
        const response = await fetch(`${API_URL}/tasks/${taskId}/interrupt`, { 
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('[Chronos API] Resposta da interrupção. Status:', response.status);
        showMessage.warning('Ciclo de foco interrompido.');
      } catch (err) {
        console.error('[Chronos API] Erro de rede ao interromper tarefa:', err);
      }
    }
    
    dispatch(action); 
  };

  useEffect(() => {
    localStorage.setItem('state', JSON.stringify(state));
    if (!state.activeTask) {
      worker.terminate();
    }
    document.title = `${state.formattedSecondsRemaining} - Chronos Pomodoro`;
    worker.postMessage(state);
  }, [worker, state]);

  useEffect(() => {
    if (state.activeTask && playBeepRef.current === null) {
      playBeepRef.current = loadBeep();
    } else {
      playBeepRef.current = null;
    }
  }, [state.activeTask]);

  return (
    <TaskContext.Provider value={{ state, dispatch: customDispatch }}>
      {children}
    </TaskContext.Provider>
  );
}