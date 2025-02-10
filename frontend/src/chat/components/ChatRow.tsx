import { Group } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { ChatHistory } from '../types';

interface ChatRowProps {
    history: ChatHistory;
    isActive: boolean;
    onClick: () => void;
}

export function ChatRow({ history, isActive, onClick }: ChatRowProps) {
    const truncatedTitle = history.title.length > 20
        ? `${history.title.slice(0, 20)}...`
        : history.title;

    return (
        <Group
            p="sm"
            bg={isActive ? 'var(--mantine-color-blue-light)' : 'transparent'}
            style={{
                borderRadius: 'var(--mantine-radius-sm)',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
            }}
            onClick={() => {
                if (!isActive) {
                    onClick();
                }
            }}
        >
            <IconMessageCircle size={18} />
            {truncatedTitle}
        </Group>
    );
}
