import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { mockApi } from './fixtures/mock-api';

for (const path of ['/ko', '/ko/chat', '/ko/community', '/ko/login']) {
  test(`${path}: critical·serious 접근성 위반이 없다`, async ({ page }) => {
    await mockApi(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const blocking = violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);

    expect(blocking).toEqual([]);
  });
}
