import { PlaygroundProvider } from './context/PlaygroundContext';
import { FoxLayout } from './components/fox/FoxLayout';

export function App() {
  return (
    <PlaygroundProvider>
      <FoxLayout />
    </PlaygroundProvider>
  );
}

export default App;
