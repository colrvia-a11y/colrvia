# Chat Components

This folder hosts the mobile-first chat UI used for the Text Interview flow.

## Components

- `ChatScreen` – top-level container that orchestrates the conversation.
- `MessageBubble` – styled chat bubbles for assistant/user/system messages.
- `QuickReplies` – horizontal chip list for suggested replies and options.
- `TypingIndicator` – animated three-dot indicator while waiting for responses.

## Tokens

Chat-specific design tokens are defined in `styles/chat.css` and leverage the
global design system variables. These tokens control bubble colors, composer
backgrounds, and focus rings. Import the stylesheet when rendering `ChatScreen`.

