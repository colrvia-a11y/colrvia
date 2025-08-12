# Translation Workflow

This project uses [`next-intl`](https://next-intl.dev/) for internationalization.

## Adding or updating translations

1. Edit `messages/en.json` with any new keys.
2. Copy the same keys into other locale files such as `messages/es.json` and translate the values.
3. If adding a new locale, create a new JSON file in `messages/` (e.g. `fr.json`) and add the locale code to `locales` in [`lib/i18n.ts`](../lib/i18n.ts).
4. Run the development server to verify your translations:

```bash
npm run dev
```

The application detects the visitor's preferred language via the `Accept-Language` header and loads the appropriate messages at runtime.

## Example

Spanish translations live in [`messages/es.json`](../messages/es.json). Update these files when translators deliver new strings.
