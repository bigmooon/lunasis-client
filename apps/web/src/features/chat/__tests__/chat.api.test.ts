import { ErrorCode } from '@repo/shared/types';
import { getErrorMessage } from '@repo/shared/utils';

import { anonymousChatAPI, sendMessageAPI } from '../api/chat.api';

jest.mock('@web/api/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));
jest.mock('../utils/anonymous-user', () => ({ getAnonymousUserId: () => 'anon-id' }));

const { api } = jest.requireMock('@web/api/api');

// Shape returned by lunasis-server when the AI server fails (local verification B2)
const aiFailure = {
  success: false,
  code: 500,
  message:
    'FastAPI 익명 채팅 요청 실패: 500 from POST http://internal-ai:8001/api/chat/x/anonymous',
  data: null,
};

describe('chat API failures', () => {
  it('AI 실패 응답을 서버 오류 코드로 바꾼다', async () => {
    api.post.mockResolvedValue(aiFailure);

    await expect(anonymousChatAPI({ question: 'q' })).rejects.toMatchObject({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      statusCode: 500,
    });
  });

  it('사용자 메시지에 개발용 문자열이나 서버 주소를 노출하지 않는다', async () => {
    api.post.mockResolvedValue(aiFailure);

    const error = await sendMessageAPI('room-id', { question: 'q' }).catch((e: unknown) => e);
    const message = getErrorMessage(error);

    expect(message).toBe('서버에 문제가 발생했어요. 잠시 후 다시 시도해 주세요.');
    expect(message).not.toMatch(/\[API\]|http/);
  });
});
