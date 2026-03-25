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
    <>
      {/* Seção 1: Logo */}
      <div className='container'>
        <div className='content'>
          <p>Logo do App</p>
        </div>
      </div>

      {/* Seção 2: Menu */}
      <div className='container'>
        <div className='content'>
          <p>Menu de Navegação</p>
        </div>
      </div>

      {/* Seção 3: Formulário / Cronômetro */}
      <div className='container'>
        <div className='content'>
          <p>Área do Cronômetro</p>
        </div>
      </div>

      {/* Seção 4: Footer */}
      <div className='container'>
        <div className='content'>
          <p>Rodapé da Página</p>
        </div>
      </div>
    </>
  );
}