'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { getErrorMessage } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';
import { MessageList, type Message } from '@web/features/chat/components/message-list';
import { WelcomeScreen } from '@web/features/chat/components/welcome-screen';
import { useChatLayout } from '@web/features/chat/contexts';
import {
  useChatRoomsQuery,
  useCreateAnonymousChatMutation,
  useCreateChatMutation,
} from '@web/features/chat/hooks';
import { useChatStore } from '@web/features/chat/stores';
import { getAnonymousUserId, markMessageFailed } from '@web/features/chat/utils';

import styles from './chat.module.scss';

export default function ChatPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const { locale } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setLayoutActions } = useChatLayout();
  const isMountedRef = useRef(true);
  const lastSentIdRef = useRef<string | null>(null);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const nickname = useAuthStore((s) => s.nickname);
  const { isIncognito, setCurrentChatId, setPendingMessages } = useChatStore();
  const isAnonymous = isIncognito || !hydrated || !isLoggedIn;

  const { data: chatRooms } = useChatRoomsQuery(!isAnonymous);
  const isFirstTime = !isAnonymous && hydrated && chatRooms !== undefined && chatRooms.length === 0;

  // React Query mutations
  const createChatMutation = useCreateChatMutation({
    onSuccess: (data, question) => {
      if (!isMountedRef.current) return;
      const timestamp = new Date();
      setCurrentChatId(data.chatRoomId);
      setPendingMessages({ question, answer: data.answer, timestamp });
      setIsLoading(false);
      router.push(`/${locale}/chat/${data.chatRoomId}`);
    },
    onError: (error) => {
      if (!isMountedRef.current) return;
      toast.error(getErrorMessage(error));
      const failedId = lastSentIdRef.current;
      if (failedId) setMessages((prev) => markMessageFailed(prev, failedId));
      setIsLoading(false);
    },
  });

  const createAnonymousChatMutation = useCreateAnonymousChatMutation({
    onSuccess: (data, question) => {
      if (!isMountedRef.current) return;
      const anonymousId = getAnonymousUserId();
      setCurrentChatId(anonymousId);
      setPendingMessages({ question, answer: data.answer, timestamp: new Date() });
      setIsLoading(false);
      router.push(`/${locale}/chat/${anonymousId}`);
    },
    onError: (error) => {
      if (!isMountedRef.current) return;
      toast.error(getErrorMessage(error));
      const failedId = lastSentIdRef.current;
      if (failedId) setMessages((prev) => markMessageFailed(prev, failedId));
      setIsLoading(false);
    },
  });

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

  useEffect(() => {
    if (!isFirstTime) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isFirstTime, welcomeText]);

  // cleanup object URLs(for memory leak prevention)
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
    async (
      message: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _options: { webSearch: boolean; file: File | null },
    ) => {
      // TODO: Implement webSearch and file attachment

      // Validate input
      const trimmed = message.trim();
      if (!trimmed) {
        toast.error(t('validation.emptyMessage'));
        return;
      }
      if (trimmed.length > 5000) {
        toast.error(t('validation.messageTooLong'));
        return;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      lastSentIdRef.current = userMessage.id;
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      if (isAnonymous) {
        createAnonymousChatMutation.mutate(trimmed);
      } else {
        createChatMutation.mutate(trimmed);
      }
    },
    [isAnonymous, createAnonymousChatMutation, createChatMutation, t],
  );

  const handleRetry = useCallback(
    (failed: Message) => {
      setMessages((prev) => prev.filter((message) => message.id !== failed.id));
      void handleSend(failed.content, { webSearch: false, file: null });
    },
    [handleSend],
  );

  // Register handleSend and isLoading with the layout
  useEffect(() => {
    setLayoutActions({ handleSend, isLoading });
  }, [handleSend, isLoading, setLayoutActions]);

  return (
    <div className={styles.messageListWrapper}>
      {isFirstTime ? (
        <WelcomeScreen mode="firstTime" nickname={nickname} />
      ) : (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          locale={locale as SupportedLocale}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
