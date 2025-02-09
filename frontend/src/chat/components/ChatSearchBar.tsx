import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function ChatSearchBar({ value, onChange }: SearchBarProps) {
    return (
        <TextInput
            placeholder="Search chats..."
            leftSection={<IconSearch size={16} />}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            mb="md"
        />
    );
}
