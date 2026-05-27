import { TrashIcon } from 'lucide-react';
import { Container } from '../../components/Container';
import { DefaultButton } from '../../components/DefaultButton';
import { Heading } from '../../components/Heading';
import { MainTemplate } from '../../templates/MainTemplate';

import styles from './styles.module.css';
import { useTaskContext } from '../../contexts/TaskContext/useTaskContext';
import { formatDate } from '../../utils/formatDate';
import { getTaskStatus } from '../../utils/getTaskStatus';
import { sortTasks } from '../../utils/sortTasks';
import { useEffect, useState } from 'react';
import { TaskActionTypes } from '../../contexts/TaskContext/taskActions';
import { showMessage } from '../../adapters/showMessage';

const API_URL = 'http://localhost:3333';

interface SortCriteria {
  field: 'name' | 'duration' | 'startDate';
  direction: 'asc' | 'desc';
}

type TaskType = 'workTime' | 'shortBreakTime' | 'longBreakTime';

export function History() {
  const { state, dispatch } = useTaskContext();
  const hasTasks = state.tasks.length > 0;

  const [sortCriteria, setSortCriteria] = useState<SortCriteria>({
    field: 'startDate',
    direction: 'desc',
  });

  const orderedTasks = sortTasks({
    tasks: state.tasks,
    field: sortCriteria.field,
    direction: sortCriteria.direction,
  });

  useEffect(() => {
    document.title = 'Histórico - Chronos Pomodoro';
  }, []);

  useEffect(() => {
    return () => {
      showMessage.dismiss();
    };
  }, []);

  function handleSortTasks(field: SortCriteria['field']) {
    setSortCriteria(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }

  function handleResetHistory() {
    showMessage.dismiss();
    showMessage.confirm('Tem certeza que deseja limpar todo o histórico?', async (confirmation) => {
      if (confirmation) {
        try {
          // Deleta cada tarefa pelo id dinâmico dela vindo do estado
          const deletePromises = state.tasks.map(task =>
            fetch(`${API_URL}/tasks/${task.id}`, { method: 'DELETE' })
          );

          await Promise.all(deletePromises);

          dispatch({ type: TaskActionTypes.RESET_STATE });
          showMessage.success('Histórico limpo com sucesso no banco de dados! 🗑️');
        } catch (err) {
          console.error('Erro ao limpar histórico na API:', err);
          showMessage.error('Não foi possível limpar o histórico no servidor.');
        }
      }
    });
  }

  return (
    <MainTemplate>
      <Container>
        <Heading>
          <span>History</span>
          {hasTasks && (
            <span className={styles.buttonContainer}>
              <DefaultButton
                icon={<TrashIcon />}
                color='red'
                aria-label='Apagar todo o histórico'
                title='Apagar histórico'
                onClick={handleResetHistory}
              />
            </span>
          )}
        </Heading>
      </Container>

      <Container>
        {hasTasks && (
          <div className={styles.responsiveTable}>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSortTasks('name')} className={styles.thSort}>
                    Tarefa ↕
                  </th>
                  <th onClick={() => handleSortTasks('duration')} className={styles.thSort}>
                    Duração ↕
                  </th>
                  <th onClick={() => handleSortTasks('startDate')} className={styles.thSort}>
                    Data ↕
                  </th>
                  <th>Status</th>
                  <th>Tipo</th>
                </tr>
              </thead>

              <tbody>
                {orderedTasks.map(task => {
                  const taskTypeDictionary: Record<TaskType, string> = {
                    workTime: 'Foco',
                    shortBreakTime: 'Descanso curto',
                    longBreakTime: 'Descanso longo',
                  };
                  return (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>{task.duration}min</td>
                      <td>{formatDate(task.startDate)}</td>
                      <td>{getTaskStatus(task, state.activeTask)}</td>
                      <td>{taskTypeDictionary[task.type as TaskType] || 'Foco'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!hasTasks && (
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            Ainda não existem tarefas criadas.
          </p>
        )}
      </Container>
    </MainTemplate>
  );
}