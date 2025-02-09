import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import ChatPage from './chat/pages/ChatPage';

function App() {
  return (
    <MantineProvider>
      <ChatPage />
    </MantineProvider>
  );
}

export default App;
