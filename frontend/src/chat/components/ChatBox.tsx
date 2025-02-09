import { Box, Button, ScrollArea, TextInput } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatBoxProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
}

export function ChatBox({ messages, inputValue, setInputValue, onSendMessage }: ChatBoxProps) {
  return (
    <>
      <ScrollArea style={{ flexGrow: 1 }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            mb="md"
            style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <Box style={{
              backgroundColor: msg.sender === 'server' ? '#f0f0f0' : '#ffffff',
              padding: '1rem',
              borderRadius: '8px',
              maxWidth: '80%'
            }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </Box>
          </Box>
        ))}
      </ScrollArea>

      <TextInput
        placeholder="Type a message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSendMessage();
          }
        }}
      />
      <Button
        variant="filled"
        mt="sm"
        onClick={onSendMessage}
      >
        Send
      </Button>
    </>
  );
}
