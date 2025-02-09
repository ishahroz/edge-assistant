import { ScrollArea, Stack } from '@mantine/core';
import { useState } from 'react';
import { ChatSearchBar } from './ChatSearchBar';
import { ChatHistoryList } from './ChatHistoryList';
import { ChatHistory } from '../types';

interface ChatSidebarProps {
    histories: ChatHistory[];
    activeHistoryId: number | null;
    onHistorySelect: (id: number) => void;
}

export function ChatSidebar({ histories, activeHistoryId, onHistorySelect }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistories = histories.filter(history =>
        history.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollArea>
            <Stack gap="xs">
                <ChatSearchBar value={searchQuery} onChange={setSearchQuery} />
                <ChatHistoryList
                    histories={filteredHistories}
                    activeHistoryId={activeHistoryId}
                    onHistorySelect={onHistorySelect}
                />
            </Stack>
        </ScrollArea>
    );
}
