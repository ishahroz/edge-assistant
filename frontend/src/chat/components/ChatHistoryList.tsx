import { ChatRow } from './ChatRow';
import { ChatHistory } from '../types';

interface ChatHistoryListProps {
    histories: ChatHistory[];
    activeHistoryId: number | null;
    onHistorySelect: (id: number) => void;
}

export function ChatHistoryList({ histories, activeHistoryId, onHistorySelect }: ChatHistoryListProps) {
    return (
        <>
            {histories.map((chat) => (
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
