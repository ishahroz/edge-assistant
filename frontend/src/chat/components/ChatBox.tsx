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
    <Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollArea style={{ flexGrow: 1, paddingBottom: '120px' }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            mb="md"
            style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <Box style={{
              backgroundColor: msg.sender === 'bot' ? '#f0f0f0' : '#ffffff',
              padding: '1rem',
              borderRadius: '8px',
              maxWidth: '80%'
            }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </Box>
          </Box>
        ))}
      </ScrollArea>

      <Box style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <TextInput
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSendMessage();
            }
          }}
          style={{ width: '600px' }}
        />
        <Button
          variant="filled"
          onClick={onSendMessage}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
