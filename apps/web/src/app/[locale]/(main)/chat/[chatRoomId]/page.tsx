'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { getErrorMessage } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';
import { MessageList, type Message } from '@web/features/chat/components/message-list';
import { useChatLayout } from '@web/features/chat/contexts';
import {
  useChatMessagesQuery,
  useSendAnonymousMessageMutation,
  useSendMessageMutation,
} from '@web/features/chat/hooks';
import { useChatStore } from '@web/features/chat/stores';
import { markMessageFailed, resolveInitialMessages } from '@web/features/chat/utils';

import styles from '../chat.module.scss';

/** Maximum allowed file size for chat attachments (10 MB) */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function ChatRoomPage() {
  const t = useTranslations('chat');
  const { locale, chatRoomId } = useParams<{ locale: string; chatRoomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setLayoutActions } = useChatLayout();
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const lastSentIdRef = useRef<string | null>(null);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { isIncognito, pendingMessages, clearPendingMessages, setCurrentChatId } = useChatStore();
  // Only use isLoggedIn after hydration to prevent false negatives
  const isAnonymous = isIncognito || !hydrated || !isLoggedIn;

  // Fetch messages for logged-in users only
  const { data: chatMessagesData } = useChatMessagesQuery(isAnonymous ? null : chatRoomId);

  // React Query mutations
  const sendMessageMutation = useSendMessageMutation(chatRoomId, {
    onSuccess: (apiMessages) => {
      if (!isMountedRef.current) return;
      // API returns full conversation history; extract only the last message (AI response)
      // User message was already added optimistically in handleSend
      const lastMessage = apiMessages[apiMessages.length - 1];
      if (lastMessage) {
        const aiMessage: Message = {
          id: `${lastMessage.chatId}-answer`,
          role: 'assistant',
          content: lastMessage.answer,
          timestamp: new Date(),
          ...(lastMessage.image
            ? { attachments: [{ type: 'image', url: lastMessage.image, name: 'Image' }] }
            : {}),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
      setIsLoading(false);
    },
    onError: (error) => {
      if (!isMountedRef.current) return;
      toast.error(getErrorMessage(error));
      const failedId = lastSentIdRef.current;
      if (failedId) setMessages((prev) => markMessageFailed(prev, failedId));
      setIsLoading(false);
    },
  });

  const sendAnonymousMessageMutation = useSendAnonymousMessageMutation({
    onSuccess: (data) => {
      if (!isMountedRef.current) return;
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      if (!isMountedRef.current) return;
      toast.error(getErrorMessage(error));
      const failedId = lastSentIdRef.current;
      if (failedId) setMessages((prev) => markMessageFailed(prev, failedId));
      setIsLoading(false);
    },
  });

  // currentChatId를 URL params와 동기화 (익명: chatRoomId=anonymousId, 로그인: chatRoomId=서버 ID)
  useEffect(() => {
    if (chatRoomId) setCurrentChatId(chatRoomId);
  }, [chatRoomId, setCurrentChatId]);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const welcomeText = useMemo(
    () => (isIncognito ? t('welcome.incognito') : t('welcome.normal')),
    [isIncognito, t],
  );

  // Decide the initial messages once auth has rehydrated (see resolveInitialMessages)
  useEffect(() => {
    if (isInitialized) return;

    const result = resolveInitialMessages({
      hydrated,
      isAnonymous,
      welcome: { id: 'welcome-1', role: 'assistant', content: welcomeText, timestamp: new Date() },
      apiData: chatMessagesData,
      pending: pendingMessages,
    });
    if (result.status === 'wait') return;

    setMessages(result.messages);
    if (result.status === 'preview') return;
    if (result.clearPending) clearPendingMessages();
    setIsInitialized(true);
  }, [
    isInitialized,
    hydrated,
    isAnonymous,
    welcomeText,
    chatMessagesData,
    pendingMessages,
    clearPendingMessages,
  ]);

  // cleanup object URLs (for memory leak prevention)
  useEffect(() => {
    return () => {
      messages.forEach((message) => {
        message.attachments?.forEach((attachment) => {
          if (attachment.url.startsWith('blob:')) {
            URL.revokeObjectURL(attachment.url);
          }
        });
      });
    };
  }, [messages]);

  const handleSend = useCallback(
    async (message: string, options: { webSearch: boolean; file: File | null }) => {
      // TODO: Implement webSearch

      // Validate message input
      const trimmed = message.trim();
      if (!trimmed) {
        toast.error(t('validation.emptyMessage'));
        return;
      }
      if (trimmed.length > 5000) {
        toast.error(t('validation.messageTooLong'));
        return;
      }

      // Validate file size
      if (options.file && options.file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(t('validation.fileTooLarge'));
        return;
      }

      const attachments = options.file
        ? [
            {
              type: 'file' as const,
              url: URL.createObjectURL(options.file),
              name: options.file.name,
              size: options.file.size,
            },
          ]
        : undefined;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
        attachments,
      };

      lastSentIdRef.current = userMessage.id;
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      if (isAnonymous) {
        sendAnonymousMessageMutation.mutate(trimmed);
      } else {
        sendMessageMutation.mutate(trimmed);
      }
    },
    [isAnonymous, sendAnonymousMessageMutation, sendMessageMutation, t],
  );

  const handleRetry = useCallback(
    (failed: Message) => {
      if (isLoading) return;
      setMessages((prev) => prev.filter((message) => message.id !== failed.id));
      void handleSend(failed.content, { webSearch: false, file: null });
    },
    [handleSend, isLoading],
  );

  // Register handleSend and isLoading with the layout
  useEffect(() => {
    setLayoutActions({ handleSend, isLoading });
  }, [handleSend, isLoading, setLayoutActions]);

  return (
    <div className={styles.messageListWrapper}>
      <MessageList
        messages={messages}
        isLoading={isLoading}
        locale={locale as SupportedLocale}
        onRetry={isLoading ? undefined : handleRetry}
      />
    </div>
  );
}
