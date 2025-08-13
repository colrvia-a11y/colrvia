export const copy = {
  intake: {
    title: "Describe your space",
    roomHelp: "Pick the space you’re redesigning.",
    styleHelp: "We’ll tailor layouts, textures, and finishes.",
    promptHelp: "Add constraints and preferences.",
    cta: "Generate (≈12s)",
    trust: "Private to you · You can edit inputs later",
  },
  reveal: {
    generatingTitle: "Generating your designs…",
    generatingSub: "This takes about 8–15 seconds. You can keep browsing.",
    readyTitle: "Your designs",
    errorTitle: "Something went wrong",
    errorSub: "Please try again.",
    actions: { downloadAll: "⬇️ Download all", share: "🔗 Share", retry: "🔁 Try another set", moreLike: "✨ More like this", compare: "🌓 Compare" }
  },
  empty: {
    title: "No designs yet",
    desc: "Start with a template or describe your space.",
    cta: "Create a design",
  }
} as const;
