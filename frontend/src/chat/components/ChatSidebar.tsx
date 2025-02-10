import { Button, ScrollArea, Stack } from '@mantine/core';
import { useState } from 'react';
import { ChatSearchBar } from './ChatSearchBar';
import { ChatHistoryList } from './ChatHistoryList';

interface ChatSidebarProps {
    activeHistoryId: number | null;
    onHistorySelect: (id: number) => void;
    onNewChat: () => void;
    isCreating: boolean;
}

export function ChatSidebar({
    activeHistoryId,
    onHistorySelect,
    onNewChat,
    isCreating
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ScrollArea>
            <Stack gap="xs">
                <Button
                    onClick={onNewChat}
                    variant="light"
                    fullWidth
                    mb="sm"
                    loading={isCreating}
                >
                    {isCreating ? "Creating..." : "New Chat"}
                </Button>
                <ChatSearchBar value={searchQuery} onChange={setSearchQuery} />
                <ChatHistoryList
                    activeHistoryId={activeHistoryId}
                    onHistorySelect={onHistorySelect}
                    searchQuery={searchQuery}
                />
            </Stack>
        </ScrollArea>
    );
}
