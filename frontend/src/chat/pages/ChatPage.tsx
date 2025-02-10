import { useState, useEffect } from 'react';
import { AppShell, Group, Title, Box } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatBox } from '../components/ChatBox';
import { ChatHistory, Message } from '../types';
import { API } from '../../constants/api';

export default function ChatPage() {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.histories.list}`)
      .then(res => res.json())
      .then(data => setChatHistories(data));
  }, []);

  useEffect(() => {
    if (activeHistoryId) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.histories.messages(activeHistoryId)}`)
        .then(res => res.json())
        .then(data => setMessages(data.map((msg: any) => ({
          content: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }))));
    } else {
      setMessages([]);
    }
  }, [activeHistoryId]);

  const handleSendMessage = () => {
    setMessages(prev => [
      ...prev,
      { content: inputValue, sender: 'user' },
      { content: '', sender: 'bot' }
    ]);

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.stream(encodeURIComponent(inputValue), activeHistoryId)}`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        return;
      }

      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];

        if (event.type === 'status') {
          if (lastMessage.sender === 'bot') {
            lastMessage.content = event.data;
          } else {
            updated.push({ content: event.data, sender: 'bot' });
          }
          return updated;
        }

        if (lastMessage?.sender === 'bot') {
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

  const handleNewChat = () => {
    setIsCreatingChat(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.histories.create}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: '' }),
    })
      .then(res => res.json())
      .then(data => {
        setChatHistories(prev => [data, ...prev]);
        setActiveHistoryId(data.id);
        setMessages([]);
      })
      .finally(() => setIsCreatingChat(false));
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
          onNewChat={handleNewChat}
          isCreating={isCreatingChat}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {activeHistoryId ? (
          <ChatBox
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <Box style={{
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div>
              <Title order={2} mb="md">
                Welcome to Edge Assistant
              </Title>
              <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto' }}>
                Your one-stop solution for querying company knowledge management.
                Select an existing chat or start a new conversation.
              </p>
            </div>
          </Box>
        )}
      </AppShell.Main>
    </AppShell>
  );
}
