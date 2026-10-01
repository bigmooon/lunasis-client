import { render, screen } from '@testing-library/react';

import { Sidebar } from '../components/sidebar/sidebar';
import { useChatStore } from '../stores/use-chat-store';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'ko',
}));
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
const mockUseChatRoomsQuery = jest.fn();
jest.mock('../hooks', () => ({
  useChatRoomsQuery: (...args: unknown[]) => mockUseChatRoomsQuery(...args),
}));

const queryResult = (data: unknown) => ({
  data,
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});

describe('Sidebar', () => {
  beforeEach(() => {
    useChatStore.setState({ isSidebarOpen: true, isIncognito: false });
    mockPush.mockClear();
  });

  it('채팅방 데이터가 없으면 더미 목록 대신 빈 상태를 보여준다', () => {
    mockUseChatRoomsQuery.mockReturnValue(queryResult(undefined));
    render(<Sidebar />);

    expect(screen.getByText('blank')).toBeInTheDocument();
    expect(screen.queryByText('오늘 점심 메뉴 추천해줘')).not.toBeInTheDocument();
  });

  it('새 채팅 버튼은 하나이고 누르면 새 채팅으로 이동한다', () => {
    mockUseChatRoomsQuery.mockReturnValue(queryResult([]));
    render(<Sidebar />);

    const buttons = screen.getAllByRole('button', { name: 'newChat' });
    expect(buttons).toHaveLength(1);
    buttons[0].click();
    expect(mockPush).toHaveBeenCalledWith('/ko/chat');
  });
});
