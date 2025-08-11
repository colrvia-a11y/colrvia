import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import React from 'react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' }
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Light: Story = {
  args: { children: 'Click me' }
};

export const Dark: Story = {
  args: { children: 'Click me' },
  decorators: [
    (Story) => (
      <div className="dark bg-neutral-900 p-4">
        <Story />
      </div>
    ),
  ],
};

export const Interactive: Story = {
  render: () => {
    const InteractiveButton = () => {
      const [count, setCount] = React.useState(0);
      return <Button onClick={() => setCount(count + 1)}>Clicked {count}</Button>;
    };
    return <InteractiveButton />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
