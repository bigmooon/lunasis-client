import { fireEvent, render, screen } from '@testing-library/react';

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
    fireEvent.click(buttons[0]);
    expect(mockPush).toHaveBeenCalledWith('/ko/chat');
  });

  it('열려 있을 때 Escape를 누르면 닫힌다', () => {
    mockUseChatRoomsQuery.mockReturnValue(queryResult([]));
    render(<Sidebar />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(useChatStore.getState().isSidebarOpen).toBe(false);
  });

  it('닫혀 있을 때 Escape는 아무 일도 하지 않는다', () => {
    useChatStore.setState({ isSidebarOpen: false });
    mockUseChatRoomsQuery.mockReturnValue(queryResult([]));
    render(<Sidebar />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(useChatStore.getState().isSidebarOpen).toBe(false);
  });

  it('열리면 다이얼로그 안의 버튼으로 포커스가 이동한다', () => {
    mockUseChatRoomsQuery.mockReturnValue(queryResult([]));
    render(<Sidebar />);

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(document.activeElement?.tagName).toBe('BUTTON');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
