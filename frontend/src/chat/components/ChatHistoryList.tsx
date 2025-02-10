import { useEffect, useState } from 'react';
import { ChatRow } from './ChatRow';
import { ChatHistory } from '../types';
import { API } from '../../constants/api';

interface ChatHistoryListProps {
    activeHistoryId: number | null;
    onHistorySelect: (id: number) => void;
    searchQuery: string;
}

export function ChatHistoryList({
    activeHistoryId,
    onHistorySelect,
    searchQuery
}: ChatHistoryListProps) {
    const [histories, setHistories] = useState<ChatHistory[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.histories.list}`)
            .then(res => res.json())
            .then(data => setHistories(data));
    }, []);

    const filteredHistories = histories.filter(history =>
        history.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {filteredHistories.map((chat) => (
                <ChatRow
                    key={chat.id}
                    history={chat}
                    isActive={chat.id === activeHistoryId}
                    onClick={() => onHistorySelect(chat.id)}
                />
            ))}
        </>
    );
}
