import { fireEvent, render, screen } from '@testing-library/react';

import { MessageList, type Message } from '../components/message-list/message-list';

jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <span data-alt={alt} />,
}));
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <p>{children}</p>,
}));
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => undefined }));
jest.mock('remark-breaks', () => ({ __esModule: true, default: () => undefined }));
jest.mock('rehype-sanitize', () => ({ __esModule: true, default: () => undefined }));

const failed: Message = {
  id: 'u1',
  role: 'user',
  content: '보낸 질문',
  timestamp: new Date(0),
  status: 'failed',
};

describe('MessageList', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('메시지 목록은 log 영역이고 로딩 중에는 상태를 알린다', () => {
    render(<MessageList messages={[]} locale="ko" isLoading />);
    expect(screen.getByRole('log')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('message.loading');
  });

  it('실패한 메시지에 실패 안내와 다시 보내기 버튼을 보여준다', () => {
    const onRetry = jest.fn();
    render(<MessageList messages={[failed]} locale="ko" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('message.failed');
    fireEvent.click(screen.getByRole('button', { name: 'message.retry' }));
    expect(onRetry).toHaveBeenCalledWith(failed);
  });

  it('정상 메시지에는 다시 보내기 버튼이 없다', () => {
    render(<MessageList messages={[{ ...failed, status: undefined }]} locale="ko" />);

    expect(screen.queryByRole('button', { name: 'message.retry' })).not.toBeInTheDocument();
  });
});
