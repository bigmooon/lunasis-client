import type { Message } from '../components/message-list';
import type { GetChatLogRes } from '../types/api.type';
import { resolveInitialMessages } from '../utils/initial-messages';

const welcome: Message = {
  id: 'welcome-1',
  role: 'assistant',
  content: 'hi',
  timestamp: new Date(0),
};
const apiData: GetChatLogRes = [{ chatId: 'c1', question: 'q1', answer: 'a1', image: null }];
const pending = { question: 'pq', answer: 'pa', timestamp: new Date(0) };

describe('resolveInitialMessages', () => {
  it('인증 스토어 복원 전에는 초기화하지 않는다', () => {
    expect(
      resolveInitialMessages({
        hydrated: false,
        isAnonymous: true,
        welcome,
        apiData: undefined,
        pending: null,
      }),
    ).toEqual({ status: 'wait' });
  });

  it('로그인 사용자는 서버 기록을 사용하고 대기 메시지를 비운다', () => {
    const result = resolveInitialMessages({
      hydrated: true,
      isAnonymous: false,
      welcome,
      apiData,
      pending,
    });
    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;
    expect(result.messages.map((m) => m.content)).toEqual(['hi', 'q1', 'a1']);
    expect(result.clearPending).toBe(true);
  });

  it('로그인 사용자의 서버 기록이 아직 없으면 대기 메시지를 미리보기로 보여주고 초기화를 확정하지 않는다', () => {
    const result = resolveInitialMessages({
      hydrated: true,
      isAnonymous: false,
      welcome,
      apiData: undefined,
      pending,
    });
    expect(result.status).toBe('preview');
    if (result.status !== 'preview') return;
    expect(result.messages.map((m) => m.content)).toEqual(['hi', 'pq', 'pa']);
  });

  it('로그인 사용자가 서버 기록도 대기 메시지도 없으면 기다린다', () => {
    expect(
      resolveInitialMessages({
        hydrated: true,
        isAnonymous: false,
        welcome,
        apiData: undefined,
        pending: null,
      }),
    ).toEqual({ status: 'wait' });
  });

  it('익명 사용자는 대기 메시지를 보여주고 바로 비운다', () => {
    expect(
      resolveInitialMessages({
        hydrated: true,
        isAnonymous: true,
        welcome,
        apiData: undefined,
        pending,
      }),
    ).toMatchObject({ status: 'ready', clearPending: true });
  });

  it('익명 사용자가 대기 메시지도 없으면 환영 메시지만 보여준다', () => {
    const result = resolveInitialMessages({
      hydrated: true,
      isAnonymous: true,
      welcome,
      apiData: undefined,
      pending: null,
    });
    expect(result).toEqual({ status: 'ready', messages: [welcome], clearPending: false });
  });
});
