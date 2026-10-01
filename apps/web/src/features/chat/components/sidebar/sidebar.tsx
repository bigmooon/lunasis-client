'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import CreateIcon from '@mui/icons-material/Create';
import { MessageSquareIcon } from 'lucide-react';

import { getErrorMessage } from '@repo/shared/utils';
import { Button } from '@web/components/ui/button';

import { useChatRoomsQuery } from '../../hooks';
import { useChatStore } from '../../stores/use-chat-store';
import type { ChatRoom } from '../../types/api.type';

import clsx from 'clsx';
import styles from './sidebar.module.scss';

export const Sidebar = () => {
  const t = useTranslations('chat.sidebar');
  const router = useRouter();
  const locale = useLocale();

  const isSidebarOpen = useChatStore((state) => state.isSidebarOpen);
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const isIncognito = useChatStore((state) => state.isIncognito);

  const { data, isLoading, isError, error, refetch } = useChatRoomsQuery(!isIncognito);

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleCreateChat = () => {
    setCurrentChatId(null);
    router.push(`/${locale}/chat`);
    handleToggleSidebar();
  };

  const handleClickChatRoom = (chatRoomId: string) => {
    setCurrentChatId(chatRoomId);
    router.push(`/${locale}/chat/${chatRoomId}`);
    handleToggleSidebar();
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleToggleSidebar();
  };

  const chatRooms: ChatRoom[] = data ?? [];

  return (
    <div
      className={clsx(styles.overlay, { [styles.overlayVisible]: isSidebarOpen })}
      onClick={isSidebarOpen ? handleToggleSidebar : undefined}
      onKeyDown={isSidebarOpen ? handleOverlayKeyDown : undefined}
      role="button"
      tabIndex={isSidebarOpen ? 0 : -1}
      aria-label="Close sidebar overlay"
      aria-hidden={!isSidebarOpen}
      inert={!isSidebarOpen}
    >
      <aside
        className={clsx(styles.sidebar, { [styles.sidebarOpen]: isSidebarOpen })}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.header}>
          <Button
            variant="ghost"
            colorScheme="orange"
            onClick={handleCreateChat}
            aria-label="Create chat"
            disabled={isLoading}
            isLoading={isLoading}
            className={styles.createButton}
          >
            <CreateIcon />
          </Button>
        </header>

        <div className={styles.content}>
          <Button
            variant="outline"
            colorScheme="gray"
            className={styles.createChat}
            onClick={handleCreateChat}
          >
            {t('newChat')}
          </Button>

          {isLoading && (
            <div className={styles.loading}>
              <p>{t('loading')}</p>
            </div>
          )}

          {isError && (
            <div className={styles.error}>
              <p>{getErrorMessage(error)}</p>
              <Button variant="outline" colorScheme="white" onClick={() => refetch()}>
                {t('retry')}
              </Button>
            </div>
          )}

          {/* Chat list - only show when not in incognito mode */}
          {!isLoading &&
            !isError &&
            !isIncognito &&
            (chatRooms.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{t('blank')}</p>
                <span>{t('blankDescription')}</span>
              </div>
            ) : (
              <ul className={styles.chatList}>
                {chatRooms.map((room) => (
                  <li key={room.chatRoomId}>
                    <button
                      className={clsx(styles.chatItem, {
                        [styles.chatItemActive]: currentChatId === room.chatRoomId,
                      })}
                      onClick={() => handleClickChatRoom(room.chatRoomId)}
                      type="button"
                    >
                      <MessageSquareIcon className={styles.chatItemIcon} />
                      <span className={styles.chatItemTitle}>{room.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}

          {/* Incognito mode message */}
          {!isLoading && !isError && isIncognito && (
            <div className={styles.emptyState}>
              <p>{t('incognito')}</p>
              <span>{t('incognitoDescription')}</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
