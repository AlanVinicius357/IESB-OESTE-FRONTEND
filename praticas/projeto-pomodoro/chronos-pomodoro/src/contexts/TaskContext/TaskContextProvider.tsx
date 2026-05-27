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

const USER_ID = 'b0fd63dd-a332-4826-b8dd-fe76873cfd93';
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

  const playBeepRef = useRef<ReturnType<typeof loadBeep> | null>(null);
  const worker = TimerWorkerManager.getInstance();

  // Guardamos o estado atualizado em uma referência para que o worker leia sem recriar o listener
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    async function loadInitialDataFromAPI() {
      try {
        const settingsRes = await fetch(`${API_URL}/settings/${USER_ID}`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          dispatch({ type: 'SET_SETTINGS_FROM_API', payload: settingsData });
        }

        const tasksRes = await fetch(`${API_URL}/tasks/${USER_ID}`);
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          dispatch({ type: 'SET_TASKS_FROM_API', payload: tasksData });
        }
      } catch (err) {
        console.error('Erro de rede ao conectar com a API:', err);
        showMessage.error('Erro de conexão com o servidor. Usando dados locais.');
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
            // SOLUÇÃO ESLINT: Criamos um mapeamento seguro usando Record para aceitar focusTime e title sem usar explicit any
            const configMapeado = currentState.config as Record<string, unknown> | null;
            const taskMapeada = currentState.activeTask as Record<string, unknown>;

            const focusTime = typeof configMapeado?.focusTime === 'number' ? configMapeado.focusTime : 25;
            const duration = typeof taskMapeada.duration === 'number' ? taskMapeada.duration : 25;
            const fallbackDuration = focusTime || duration;

            await fetch(`${API_URL}/tasks/${currentState.activeTask.id}/complete`, { method: 'PATCH' });
            
            await fetch(`${API_URL}/sessions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: taskMapeada.name || taskMapeada.title || 'Tarefa',
                type: 'focusTime', 
                duration: fallbackDuration,
                userId: USER_ID,
              }),
            });
          } catch (err) {
            console.error('Erro ao atualizar status da tarefa na API:', err);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker]); 

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customDispatch = async (action: any) => {
    if (action.type === TaskActionTypes.INTERRUPT_TASK && state.activeTask) {
      try {
        await fetch(`${API_URL}/tasks/${state.activeTask.id}/interrupt`, { method: 'PATCH' });
        showMessage.warning('Ciclo de foco interrompido.');
      } catch (err) {
        console.error('Erro ao comunicar interrupção:', err);
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