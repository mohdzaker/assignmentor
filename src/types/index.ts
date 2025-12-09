export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  course?: string;
  collegeName?: string;
  section?: string;
  semester?: string;
}

export interface Assignment {
  id: string;
  subject: string;
  topic: string;
  module?: string;
  wordLimit: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
