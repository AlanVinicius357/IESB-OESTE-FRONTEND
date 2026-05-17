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

// Criamos uma interface mais simples, guardando apenas os critérios de ordenação
interface SortCriteria {
  field: 'name' | 'duration' | 'startDate';
  direction: 'asc' | 'desc';
}

export function History() {
  const { state, dispatch } = useTaskContext();
  const hasTasks = state.tasks.length > 0;

  // 1. O estado agora guarda APENAS as configurações de ordenação, sem duplicar a lista de tarefas
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>({
    field: 'startDate',
    direction: 'desc',
  });

  // 2. Calculamos as tarefas ordenadas diretamente na renderização.
  // Sem useEffect, sem renders em cascata, performance máxima!
  const orderedTasks = sortTasks({
    tasks: state.tasks,
    field: sortCriteria.field,
    direction: sortCriteria.direction,
  });

  // Define o título da página
  useEffect(() => {
    document.title = 'Histórico - Chronos Pomodoro';
  }, []);

  // Limpa mensagens pendentes ao desmontar o componente
  useEffect(() => {
    return () => {
      showMessage.dismiss();
    };
  }, []);

  // Altera os critérios de ordenação ao clicar no topo da tabela
  function handleSortTasks(field: SortCriteria['field']) {
    setSortCriteria(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }

  // Executa a limpeza do histórico direto no callback do evento do botão
  function handleResetHistory() {
    showMessage.dismiss();
    showMessage.confirm('Tem certeza?', confirmation => {
      if (confirmation) {
        dispatch({ type: TaskActionTypes.RESET_STATE });
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
                  <th
                    onClick={() => handleSortTasks('name')}
                    className={styles.thSort}
                  >
                    Tarefa ↕
                  </th>
                  <th
                    onClick={() => handleSortTasks('duration')}
                    className={styles.thSort}
                  >
                    Duração ↕
                  </th>
                  <th
                    onClick={() => handleSortTasks('startDate')}
                    className={styles.thSort}
                  >
                    Data ↕
                  </th>
                  <th>Status</th>
                  <th>Tipo</th>
                </tr>
              </thead>

              <tbody>
                {/* 3. Aqui nós mapeamos a variável calculada em tempo de execução */}
                {orderedTasks.map(task => {
                  const taskTypeDictionary = {
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
                      <td>{taskTypeDictionary[task.type]}</td>
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