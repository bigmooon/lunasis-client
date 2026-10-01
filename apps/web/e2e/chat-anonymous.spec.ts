import { expect, test } from '@playwright/test';

import { mockAnswer, mockApi } from './fixtures/mock-api';

test('비로그인 사용자가 질문하면 대화방으로 이동하고 답변이 보인다', async ({ page }) => {
  await mockApi(page);
  await page.goto('/ko/chat');

  const input = page.locator('textarea');
  await input.fill('생리통 완화 방법');
  await input.press('Enter');

  await expect(page).toHaveURL(/\/ko\/chat\/[0-9a-f-]{36}$/);
  await expect(page.getByText(mockAnswer('생리통 완화 방법'))).toBeVisible();
});
