export interface Message {
  content: string;
  sender: 'user' | 'server';
}

export interface ChatHistory {
  id: number;
  title: string;
  created_at: string;
}
