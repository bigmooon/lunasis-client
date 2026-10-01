import type { Message } from '../components/message-list';
import type { GetChatLogRes } from '../types/api.type';
import type { PendingMessage } from '../types/store.type';
import { convertChatMessagesToUIMessages } from './message-converter';

interface InitialMessagesInput {
  hydrated: boolean;
  isAnonymous: boolean;
  welcome: Message;
  apiData: GetChatLogRes | undefined;
  pending: PendingMessage | null;
}

export type InitialMessagesResult =
  | { status: 'wait' }
  | { status: 'preview'; messages: Message[] }
  | { status: 'ready'; messages: Message[]; clearPending: boolean };

const fromPending = (pending: PendingMessage): Message[] => [
  { id: 'user-initial', role: 'user', content: pending.question, timestamp: pending.timestamp },
  { id: 'ai-initial', role: 'assistant', content: pending.answer, timestamp: pending.timestamp },
];

/**
 * Decides what a chat room shows on first render.
 * Waits for auth rehydration: before it, a logged-in user looks anonymous,
 * which used to lock the room into "welcome only" on refresh/direct entry.
 * 'preview' shows pending messages for a logged-in user while server history is
 * still loading; the caller must not lock initialization or clear pending then.
 */
export function resolveInitialMessages({
  hydrated,
  isAnonymous,
  welcome,
  apiData,
  pending,
}: InitialMessagesInput): InitialMessagesResult {
  if (!hydrated) return { status: 'wait' };

  if (!isAnonymous && apiData) {
    return {
      status: 'ready',
      messages: [welcome, ...convertChatMessagesToUIMessages(apiData)],
      clearPending: true,
    };
  }
  if (pending) {
    const messages = [welcome, ...fromPending(pending)];
    return isAnonymous
      ? { status: 'ready', messages, clearPending: true }
      : { status: 'preview', messages };
  }
  if (isAnonymous) return { status: 'ready', messages: [welcome], clearPending: false };

  return { status: 'wait' };
}
