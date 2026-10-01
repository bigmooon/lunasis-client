import { expect, test } from '@playwright/test';

import { mockApi } from './fixtures/mock-api';

test('한국어 메인은 한국어로 보이고 미구현 병원 카드는 없다', async ({ page }) => {
  await mockApi(page);
  await page.goto('/ko');

  await expect(page.getByRole('link', { name: /토크룸/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /채팅하기/ })).toBeVisible();
  await expect(page.getByText('Talk Room')).toHaveCount(0);
  await expect(page.getByText('병원 찾기')).toHaveCount(0);
});

test('영어 메인은 영어로 보인다', async ({ page }) => {
  await mockApi(page);
  await page.goto('/en');

  await expect(page.getByRole('link', { name: /Talk Room/ })).toBeVisible();
});

test('미구현 병원 페이지는 not-found 화면으로 처리된다', async ({ page }) => {
  await mockApi(page);
  await page.goto('/ko/hospital');

  // [locale]/loading.tsx 때문에 응답이 스트리밍되어 HTTP 상태는 200으로 나가므로
  // not-found 화면과 noindex 메타로 검증한다 (앱 전체 404 공통 동작)
  await expect(page.getByRole('img', { name: '404 Not Found' })).toBeVisible();
  await expect(page.getByText('HospitalPage')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
});
