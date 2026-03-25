// 1º: Importamos as variáveis (o tema)
import './styles/theme.css';
// 2º: Importamos os estilos globais
import './styles/global.css';
//importação do heading
import { Heading } from './components/Heading';
// Importando o ícone
import { Timer } from 'lucide-react'; 

export function App() {
  return (
    <Heading>
      Histórico
      <button>
        <Timer /> {/* Renderizando o ícone dentro do botão */}
      </button>
    </Heading>
  );
}