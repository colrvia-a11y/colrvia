import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    await checkA11y(page, context);
  },
};

export default config;
