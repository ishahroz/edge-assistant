import './App.css'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { useState } from 'react';
import { AppShell, Group, Title } from '@mantine/core';

interface Message {
  content: string;
  sender: 'user' | 'server';
}
import { ChatSidebar } from './components/ChatSidebar';
import { ChatBox } from './components/ChatBox';
import { IconMessageCircle } from '@tabler/icons-react';

function App() {
  const [chatSessions] = useState([
    { id: 1, title: "Edge Case Discussion" },
    { id: 2, title: "Performance Review" },
    { id: 3, title: "Feature Planning" },
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  return <MantineProvider>
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="xs">
          <IconMessageCircle size={30} />
          <Title order={1} size="h4">Edge Chat</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" withBorder>
        <ChatSidebar sessions={chatSessions} />
      </AppShell.Navbar>

      <AppShell.Main>
        <ChatBox
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={() => {
            // Append the user message and a placeholder for the server response
            setMessages(prev => [
              ...prev,
              { content: inputValue, sender: 'user' },
              { content: '', sender: 'server' }
            ]);

            // Open an SSE connection to the backend SSE endpoint
            const eventSource = new EventSource(`http://localhost:8000/rag/stream/?query=${encodeURIComponent(inputValue)}`);

            eventSource.onmessage = (event) => {
              if (event.data === "[DONE]") {
                eventSource.close();
                return;
              }

              setMessages(prev => {
                const updated = [...prev];
                if (updated.length && updated[updated.length - 1].sender === 'server') {
                  const lastMessage = updated[updated.length - 1];
                  const current = lastMessage.content;
                  const incoming = event.data;

                  if (incoming.startsWith(current)) {
                    lastMessage.content = incoming; // Full replacement
                  } else {
                    // Find maximum overlap between current end and incoming start
                    let overlapLength = 0;
                    for (let i = 1; i <= Math.min(current.length, incoming.length); i++) {
                      if (current.slice(-i) === incoming.slice(0, i)) {
                        overlapLength = i;
                      }
                    }
                    lastMessage.content = current + incoming.slice(overlapLength);
                  }
                }
                return updated;
              });
            };

            eventSource.onerror = (error) => {
              console.error("SSE Error:", error);
              eventSource.close();
            };
            setInputValue('');
          }}
        />
      </AppShell.Main>
    </AppShell>
  </MantineProvider>
}

export default App
