export interface Message {
  content: string;
  sender: 'user' | 'bot';
}

export interface ChatHistory {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}
