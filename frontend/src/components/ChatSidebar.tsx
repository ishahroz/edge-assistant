import { Group, ScrollArea, Stack } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';

export interface ChatSession {
  id: number;
  title: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
}

export function ChatSidebar({ sessions }: ChatSidebarProps) {
  return (
    <ScrollArea>
      <Stack gap="xs">
        {sessions.map((chat) => (
          <Group 
            key={chat.id} 
            p="sm" 
            bg="var(--mantine-color-blue-light)"
            style={{ borderRadius: 'var(--mantine-radius-sm)', cursor: 'pointer' }}
          >
            <IconMessageCircle size={18} />
            {chat.title}
          </Group>
        ))}
      </Stack>
    </ScrollArea>
  );
}
