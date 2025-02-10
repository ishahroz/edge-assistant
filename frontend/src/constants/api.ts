export const API = {
  CHAT_API: {
    BASE: '/api/chats',
    histories: {
      list: '/api/chats/histories/',
      create: '/api/chats/histories/create/',
      messages: (historyId: number) => `/api/chats/histories/${historyId}/messages/`,
    },
    stream: (query: string, chatHistoryId: number | null) => 
      `/api/chats/stream/?query=${query}&chat_history_id=${chatHistoryId || ''}`
  }
} as const;
