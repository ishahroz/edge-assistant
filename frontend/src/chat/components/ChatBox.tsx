import { Box, Button, ScrollArea, TextInput } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { useState, useEffect } from 'react';
import { API } from '../../constants/api';

interface ChatBoxProps {
  activeHistoryId: number | null;
}

export function ChatBox({ activeHistoryId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (activeHistoryId) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.histories.messages(activeHistoryId)}`)
        .then(res => res.json())
        .then(data => setMessages(data.map((msg: any) => ({
          content: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }))));
    } else {
      setMessages([]);
    }
  }, [activeHistoryId]);

  const handleSendMessage = () => {
    setMessages(prev => [
      ...prev,
      { content: inputValue, sender: 'user' },
      { content: '', sender: 'bot' }
    ]);

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}${API.CHAT_API.stream(encodeURIComponent(inputValue), activeHistoryId)}`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        return;
      }

      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];

        if (event.type === 'status') {
          if (lastMessage.sender === 'bot') {
            lastMessage.content = event.data;
          } else {
            updated.push({ content: event.data, sender: 'bot' });
          }
          return updated;
        }

        if (lastMessage?.sender === 'bot') {
          const current = lastMessage.content;
          const incoming = event.data;

          if (incoming.startsWith(current)) {
            lastMessage.content = incoming;
          } else {
            let overlapLength = 0;
            for (let i = 1; i <= Math.min(current.length, incoming.length); i++) {
              if (current.slice(-i) === incoming.slice(0, i)) {
                overlapLength = i;
              }
            }
            lastMessage.content = current + incoming.slice(overlapLength);
          }
        }
        return updated;
      });
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };
    setInputValue('');
  };

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
              handleSendMessage();
            }
          }}
          style={{ width: '600px' }}
        />
        <Button
          variant="filled"
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
