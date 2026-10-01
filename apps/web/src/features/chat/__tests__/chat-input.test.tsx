import { fireEvent, render, screen } from '@testing-library/react';

import { ChatInput } from '../components/chat-input/chat-input';

jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

const setup = () => {
  const onSend = jest.fn();
  render(<ChatInput onSend={onSend} />);
  const textarea = screen.getByRole('textbox');
  fireEvent.change(textarea, { target: { value: '안녕' } });
  return { onSend, textarea };
};

describe('ChatInput Enter 처리', () => {
  it('한글 조합 중 Enter는 전송하지 않는다', () => {
    const { onSend, textarea } = setup();
    fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('Safari 조합 Enter(keyCode 229)도 전송하지 않는다', () => {
    const { onSend, textarea } = setup();
    fireEvent.keyDown(textarea, { key: 'Enter', keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('조합이 끝난 Enter는 한 번 전송한다', () => {
    const { onSend, textarea } = setup();
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('안녕', { webSearch: false, file: null });
  });

  it('Shift+Enter는 전송하지 않는다', () => {
    const { onSend, textarea } = setup();
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('ChatInput 접근성', () => {
  it('입력창과 전송 버튼에 접근 가능한 이름이 있다', () => {
    render(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByRole('textbox', { name: 'inputLabel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'send' })).toBeInTheDocument();
  });
});
