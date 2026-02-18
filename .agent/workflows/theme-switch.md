---
description: How to implement and toggle dark/light theme
---

1. Create a `ThemeContext.jsx` in `src/context/` to manage the theme state ('light', 'dark').
2. Use `localStorage` to persist the user's theme preference.
3. In the `useEffect` of the provider, add or remove the `dark` class from `document.documentElement`.
4. Create a `ThemeToggle.jsx` component that consumes the context and allows the user to switch.
5. Wrap the main `App` (or the routing layer) with the `ThemeProvider`.
6. Add the `ThemeToggle` to the primary navigation headers or profile sections.
7. Use Tailwind's `dark:` utility classes or CSS variables to define styles for each mode.
