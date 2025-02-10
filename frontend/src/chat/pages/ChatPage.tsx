import { useState } from 'react';
import { AppShell, Group, Title, Box } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatBox } from '../components/ChatBox';
import { API } from '../../constants/api';

export default function ChatPage() {
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

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
        setActiveHistoryId(data.id);
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
          activeHistoryId={activeHistoryId}
          onHistorySelect={setActiveHistoryId}
          onNewChat={handleNewChat}
          isCreating={isCreatingChat}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {activeHistoryId ? (
          <ChatBox activeHistoryId={activeHistoryId} />
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
