# UI Components

All base UI components are exported from the `components/ui` barrel. Import them as named exports:

```tsx
import { Button, Card, Chip, Dialog, DialogContent, DialogHeader, DialogTitle, GradientOverlay, Input, Textarea, Label, Progress, Section, ThemeToggle } from '@/components/ui'
```

## Available components

- **Button** – primary and secondary buttons.
- **Card** – simple content wrapper with rounded corners.
- **Chip** – selectable pill button, supports `active` and size props.
- **Dialog** – modal primitives `Dialog`, `DialogContent`, `DialogHeader`, and `DialogTitle`.
- **GradientOverlay** – decorative overlay for images.
- **Input**, **Textarea**, **Label** – form elements with consistent styling.
- **Progress** – progress bar component.
- **Section** – layout section with optional header/eyebrow/actions.
- **ThemeToggle** – light/dark mode toggle.

These components can be combined to build interface elements across the app.
