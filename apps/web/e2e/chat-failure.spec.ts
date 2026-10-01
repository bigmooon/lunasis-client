import { expect, test } from '@playwright/test';

import { loginAs, mockAnswer, mockApi, ROOM_ID } from './fixtures/mock-api';

test('AI가 실패하면 질문에 실패 표시가 남고 다시 보내면 답변을 받는다', async ({ page }) => {
  const api = await mockApi(page, { ai: 'fail' });
  await page.goto('/ko/chat');

  const input = page.locator('textarea');
  await input.fill('실패할 질문');
  await input.press('Enter');

  await expect(page.getByText('서버에 문제가 발생했어요', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('[API]')).toHaveCount(0);
  const retry = page.getByRole('button', { name: '다시 보내기' });
  await expect(retry).toBeVisible();

  api.setAi('ok');
  await retry.click();

  await expect(page.getByText(mockAnswer('실패할 질문'))).toBeVisible();
  await expect(page.getByRole('button', { name: '다시 보내기' })).toHaveCount(0);
});

test('로그인했지만 채팅방이 없는 사용자도 실패 표시와 다시 보내기를 본다', async ({ page }) => {
  await loginAs(page);
  const api = await mockApi(page, { ai: 'fail' });
  await page.goto('/ko/chat');

  const question = '첫 방문 질문';
  const input = page.locator('textarea');
  await input.fill(question);
  await input.press('Enter');

  const retry = page.getByRole('button', { name: '다시 보내기' });
  await expect(retry).toBeVisible();
  await expect(page.getByText(question)).toBeVisible();

  api.setAi('ok');
  await retry.click();

  // the mocked room GET returns a fixed log, so assert the retry reached the room instead of the answer text
  await expect(page).toHaveURL(new RegExp(`/ko/chat/${ROOM_ID}$`));
  await expect(page.getByRole('button', { name: '다시 보내기' })).toHaveCount(0);
});
