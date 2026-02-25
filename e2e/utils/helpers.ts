import { Page, expect } from '@playwright/test';

export const VALID_CARD = '4242424242424242';
export const INVALID_CARD = '4000000000000002';

export async function handleDialog(page: Page, action: 'accept' | 'dismiss', callback: () => Promise<void>): Promise<void> {
  let dialogResolved = false;
  
  const dialogHandler = async (dialog: any) => {
    if (dialogResolved) return;
    dialogResolved = true;
    if (action === 'accept') {
      dialog.accept();
    } else {
      dialog.dismiss();
    }
  };
  
  page.on('dialog', dialogHandler);
  
  try {
    await callback();
  } finally {
    page.off('dialog', dialogHandler);
  }
}

export async function buySubscription(page: Page, months: 1 | 3): Promise<void> {
  await page.getByRole('button', { name: 'Buy subscription' }).click();
  
  if (months === 1) {
    await page.getByLabel('1 month subscription').check();
  } else {
    await page.getByLabel('3 month subscription').check();
  }
  
  await page.getByPlaceholder('4242424242424242').fill(VALID_CARD);
  await page.getByRole('button', { name: 'Buy', exact: true }).click();
  
  await expect(page.getByText('Subscription purchased')).toBeVisible();
  await expect(page.getByText('active', { exact: true })).toBeVisible();
}

export async function cancelSubscription(page: Page): Promise<void> {
  const cancelButton = page.getByRole('button', { name: 'Cancel subscription' });
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
    await expect(page.getByText('Subscription canceled')).toBeVisible({ timeout: 10000 });
    await expect(cancelButton).not.toBeVisible({ timeout: 10000 });
  }
}

export async function ensureNoSubscription(page: Page): Promise<void> {
  const noSubscription = page.getByText('No subscriptions yet');
  if (await noSubscription.isVisible()) {
    return;
  }
  
  await cancelSubscription(page);
}

export async function ensureActiveSubscription(page: Page, months: 1 | 3 = 1): Promise<void> {
  await page.waitForLoadState('networkidle');
  const noSubscription = page.getByText('No subscriptions yet');
  const hasNoSubscription = await noSubscription.count() > 0 && await noSubscription.isVisible();
  
  if (hasNoSubscription) {
    await buySubscription(page, months);
  }
}
