# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Installs

Do not install anything — no npm/yarn/pnpm packages, no global tools, no browsers
(e.g. Playwright/Chromium), no system packages — without asking first.

If an install genuinely seems needed to complete a task, stop and ask the user
first. The ask must include:
- what you want to install (exact package/tool and version if relevant)
- why it's needed for the task at hand
- what happens if it's skipped (e.g. "can't verify visually, but code changes are done")

Only proceed once the user explicitly approves.
