import { randomUUID } from 'node:crypto';
import type { Page, Route } from '@playwright/test';

export const ROOM_ID = '0b9a4f0e-5a3c-4c1e-9d2a-1f2e3d4c5b6a';
export const SAVED_QUESTION = '저장된 질문';
export const SAVED_ANSWER = '저장된 답변';
export const mockAnswer = (question: string) => `[mock] ${question}에 대한 답변`;

export interface ChatRoomFixture {
  chatRoomId: string;
  title: string;
}

type AiMode = 'ok' | 'fail';

const CHAT_LOG = [
  {
    chatId: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
    question: SAVED_QUESTION,
    answer: SAVED_ANSWER,
    image: null,
  },
];

const json = (body: unknown) => ({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify(body),
});
const ok = (data: unknown) => json({ success: true, code: 200, message: null, data });
// lunasis-server returns AI failures as HTTP 200 + success:false, with an internal URL in message
const aiFailure = () =>
  json({
    success: false,
    code: 500,
    message: 'FastAPI 요청 실패: 500 from POST http://internal-ai:8001',
    data: null,
  });

export async function mockApi(
  page: Page,
  options: { ai?: AiMode; rooms?: ChatRoomFixture[] } = {},
) {
  let ai: AiMode = options.ai ?? 'ok';
  const rooms = options.rooms ?? [];

  await page.route('**/api/**', async (route: Route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const method = request.method();
    const body = method === 'POST' ? (request.postDataJSON() ?? {}) : {};
    const question = String(body.question ?? '');
    const answerOrFail = (data: unknown) => (ai === 'fail' ? aiFailure() : ok(data));

    if (method === 'GET' && pathname === '/api/chats') return route.fulfill(ok(rooms));
    if (method === 'POST' && pathname === '/api/chats/anonymous') {
      return route.fulfill(answerOrFail({ answer: mockAnswer(question) }));
    }
    if (method === 'POST' && pathname === '/api/chats') {
      return route.fulfill(
        answerOrFail({
          chatRoomId: ROOM_ID,
          title: question.slice(0, 20),
          answer: mockAnswer(question),
        }),
      );
    }
    const roomMatch = pathname.match(/^\/api\/chats\/([0-9a-f-]{36})$/);
    if (roomMatch && method === 'GET') return route.fulfill(ok(CHAT_LOG));
    if (roomMatch && method === 'POST') {
      return route.fulfill(
        answerOrFail([
          ...CHAT_LOG,
          { chatId: randomUUID(), question, answer: mockAnswer(question), image: null },
        ]),
      );
    }
    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: '{"success":false,"code":404}',
    });
  });

  return {
    setAi: (mode: AiMode) => {
      ai = mode;
    },
  };
}

export async function loginAs(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          accessToken: 'e2e-access',
          refreshToken: 'e2e-refresh',
          nickname: 'e2e-user',
          firstLogin: false,
          privateChat: false,
          isLoggedIn: true,
        },
        version: 1,
      }),
    );
  });
}
