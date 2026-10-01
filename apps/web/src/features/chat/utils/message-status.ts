import type { Message } from '../components/message-list';

export const markMessageFailed = (messages: Message[], id: string): Message[] =>
  messages.map((message) => (message.id === id ? { ...message, status: 'failed' } : message));
