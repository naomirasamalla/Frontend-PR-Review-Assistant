# PR Sentinel

AI-assisted frontend PR reviewer for React and TypeScript code.

## Features

* React and TSX code review
* Infinite render loop detection
* Stale closure analysis
* Accessibility-aware feedback
* Maintainability suggestions
* Structured PR-style review output

## Tech Stack

* React
* TypeScript
* Vite
* Gemini / Gemma API
* Render

## Run Locally

```bash
npm install
npm run dev
```

Create a local environment file and add your API key before running the application.

## About

PR Sentinel analyzes frontend code snippets and generates engineering-focused review feedback for common React and frontend anti-patterns.

The project includes built-in diagnostic scenarios to simulate frontend pull request review workflows.

## Future Improvements

* GitHub PR integration
* File diff support
* Backend proxy for API security
* Custom review rules
* CI/CD integration
