'use client';

// import { useChatStore } from '../../stores';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';

import { Button } from '@web/components/ui/button';

// import AttachmentIcon from '@mui/icons-material/Attachment';
// import LanguageIcon from '@mui/icons-material/Language';
// import CloseIcon from '@mui/icons-material/Close';
// import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
// import clsx from 'clsx';
import styles from './chat-input.module.scss';

interface ChatInputProps {
  onSend?: (message: string, options: { webSearch: boolean; file: File | null }) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const t = useTranslations('chat');

  const [message, setMessage] = useState('');
  // const [file, setFile] = useState<File | null>(null);

  // const { isWebSearchEnabled, toggleWebSearch } = useChatStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    // File send and web search are temporarily disabled
    // onSend?.(message, { webSearch: isWebSearchEnabled, file });
    onSend?.(message, { webSearch: false, file: null });

    setMessage('');
    // setFile(null);

    // reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // remove focus from send button
    if (sendButtonRef.current) {
      sendButtonRef.current.blur();
    }
  };

  // const handleFileAttach = () => {
  //   fileInputRef.current?.click();
  // };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selectedFile = e.target.files?.[0];
  //   if (selectedFile) {
  //     setFile(selectedFile);
  //   }
  // };

  // const handleRemoveFile = () => {
  //   setFile(null);
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };

  // const handleToggleWebSearch = () => {
  //   toggleWebSearch();
  // };

  // const formatFileSize = (bytes: number): string => {
  //   if (bytes < 1024) return bytes + ' B';
  //   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  //   return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  // };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // shift + enter: new line, enter: send (ignore Enter that confirms an IME composition)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.containerWrapper}>
      {/* File preview - temporarily disabled
      {file && (
        <div className={styles.filePreview}>
          <div className={styles.fileCard}>
            <InsertDriveFileIcon />
            <div className={styles.fileInfo}>
              <span className={styles.name}>{file.name}</span>
              <span className={styles.size}>{formatFileSize(file.size)}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              colorScheme="gray"
              onClick={handleRemoveFile}
              disabled={disabled}
              aria-label="Remove file"
            >
              <CloseIcon />
            </Button>
          </div>
        </div>
      )}
      */}

      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            autoComplete="off"
            maxLength={500}
            rows={1}
            disabled={disabled}
          />
        </div>

        <div className={styles.toolbar}>
          {/* Discard file and web search features for now */}
          {/* <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            colorScheme="white"
            className={clsx(styles.toolbarButton, styles.attachIcon, {
              [styles.active]: file,
            })}
            onClick={handleFileAttach}
            disabled={disabled}
          >
            <AttachmentIcon />
          </Button>
          <Button
            variant="ghost"
            colorScheme="white"
            className={clsx(styles.toolbarButton, {
              [styles.active]: isWebSearchEnabled,
            })}
            onClick={handleToggleWebSearch}
            disabled={disabled}
          >
            <LanguageIcon />
          </Button> */}
          <Button
            ref={sendButtonRef}
            variant="ghost"
            colorScheme="white"
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className={styles.toolbarButton}
          >
            <SendIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
