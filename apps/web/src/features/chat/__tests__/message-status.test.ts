import type { Message } from '../components/message-list';
import { markMessageFailed } from '../utils/message-status';

const msg = (id: string): Message => ({ id, role: 'user', content: id, timestamp: new Date(0) });

describe('markMessageFailed', () => {
  it('해당 메시지만 failed로 표시하고 원본은 바꾸지 않는다', () => {
    const messages = [msg('a'), msg('b')];
    const result = markMessageFailed(messages, 'b');

    expect(result[1].status).toBe('failed');
    expect(result[0].status).toBeUndefined();
    expect(messages[1].status).toBeUndefined();
  });
});
