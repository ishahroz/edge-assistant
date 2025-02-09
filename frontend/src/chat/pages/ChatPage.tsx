import { useState, useEffect } from 'react';
import { AppShell, Group, Title } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatBox } from '../components/ChatBox';
import { ChatHistory, Message } from '../types';

export default function ChatPage() {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/chats/')
      .then(res => res.json())
      .then(data => setChatHistories(data));
  }, []);

  const handleSendMessage = () => {
    setMessages(prev => [
      ...prev,
      { content: inputValue, sender: 'user' },
      { content: '', sender: 'server' }
    ]);

    const eventSource = new EventSource(`http://localhost:8000/rag/stream/?query=${encodeURIComponent(inputValue)}`);

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        return;
      }

      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];

        if (event.type === 'status') {
          if (lastMessage.sender === 'server') {
            lastMessage.content = event.data;
          } else {
            updated.push({ content: event.data, sender: 'server' });
          }
          return updated;
        }

        if (lastMessage?.sender === 'server') {
          const current = lastMessage.content;
          const incoming = event.data;

          if (incoming.startsWith(current)) {
            lastMessage.content = incoming;
          } else {
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
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="xs">
          <IconMessageCircle size={30} />
          <Title order={1} size="h4">Edge Assistant</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" withBorder>
        <ChatSidebar
          histories={chatHistories}
          activeHistoryId={activeHistoryId}
          onHistorySelect={setActiveHistoryId}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <ChatBox
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
        />
      </AppShell.Main>
    </AppShell>
  );
}
