# PR Sentinel

**AI-assisted frontend PR reviewer for React and TypeScript.**  
Catches UI quality issues, accessibility violations, and React anti-patterns before they reach production.

Live demo → [frontend-pr-review-assistant.vercel.app](https://frontend-pr-review-assistant.onrender.com/)  
DEV article → [AI-Assisted Frontend Reviews Using Gemma 4](https://dev.to/naomir/ai-assisted-frontend-reviews-using-gemma-4-567c)  
Demo video → [Watch on YouTube](https://youtu.be/BL2Cib5c-bU)

---

## Why this exists

Accessibility and UI quality issues introduced at the component level are expensive to fix at QA.
PR Sentinel embeds structured engineering feedback directly into the review workflow — giving developers
actionable, WCAG-referenced guidance the moment they paste a snippet, not after it ships.

Built for the [Gemma 4 Challenge](https://dev.to/challenges/google-gemma-2026-05-06).
Inspired by real enterprise frontend review pain points across large React and TypeScript codebases.

---

## What it reviews

Paste any React or TypeScript snippet and get structured feedback across six dimensions:

| Category | What it catches |
|---|---|
| **Accessibility (WCAG)** | Missing `alt` text (1.1.1), unlabelled inputs (1.3.1), keyboard traps (2.1.2), missing focus indicators (2.4.7), colour contrast (1.4.3), heading hierarchy (1.3.1), name/role/value issues (4.1.2) |
| **React best practices** | Missing `key` props, incorrect `useEffect` dependencies, unsafe `setState` patterns |
| **Infinite render detection** | Stale closures in async logic, dependency array mistakes, object/array identity bugs |
| **UI/UX quality** | Loading state gaps, empty state handling, error boundary coverage |
| **Maintainability** | Overly coupled components, magic numbers, missing prop types |
| **Component architecture** | Single responsibility violations, reusability concerns, state management patterns |

---

## Demo

> The tool includes built-in diagnostic sandbox scenarios — pre-loaded code snippets that simulate
> common enterprise frontend issues so you can explore the review output without writing any code.

[Watch the demo on YouTube →](https://youtu.be/BL2Cib5c-bU)

---

## Tech stack

- React + TypeScript
- Vite
- Gemma 4 (via Gemini API)
- Render / Vercel

---

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

---

## Roadmap

- [ ] GitHub PR integration (webhook-triggered reviews)
- [ ] File diff support
- [ ] Custom WCAG conformance level targeting (A / AA / AAA)
- [ ] CI/CD pipeline integration
- [ ] Exportable audit reports

---

## About the author

Built by **Naomi Rasamalla** — Senior UI Developer specialising in accessible frontend engineering.

I work at the intersection of component architecture and inclusive design — building interfaces that
work correctly for everyone, including users of screen readers, keyboard navigation, and assistive technology.

**Writing on accessible frontend engineering:**
- [AI-Assisted Frontend Reviews Using Gemma 4](https://dev.to/naomir/ai-assisted-frontend-reviews-using-gemma-4-567c) — DEV Community
- [Accessibility Bugs That Were Actually Architecture Problems](https://dev.to/naomir/accessibility-bugs-that-were-actually-architecture-problems-1fmh) -DEV Community

**Tools & standards:** WCAG 2.2 AA · NVDA · VoiceOver · Axe DevTools · React · TypeScript

---

## Licence

MIT
