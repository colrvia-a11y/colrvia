import type { Preview } from "@storybook/react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
};

export default preview;
