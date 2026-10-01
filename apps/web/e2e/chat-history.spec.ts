import { expect, test } from '@playwright/test';

import { loginAs, mockApi, ROOM_ID, SAVED_ANSWER } from './fixtures/mock-api';

test('로그인 사용자가 대화방 링크로 들어오거나 새로고침해도 기록이 보인다', async ({ page }) => {
  await loginAs(page);
  await mockApi(page);

  await page.goto(`/ko/chat/${ROOM_ID}`);
  await expect(page.getByText(SAVED_ANSWER)).toBeVisible();

  await page.reload();
  await expect(page.getByText(SAVED_ANSWER)).toBeVisible();
});
