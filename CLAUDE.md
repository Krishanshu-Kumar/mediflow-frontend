# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Questions vs. changes (read first, every session)

Decide what the user wants before touching anything.

**If the user asks a question** (how/why/what/where, "explain", "does this...", "is there..."):
- Answer it. Reading files, searching, and explaining are fine.
- Do NOT modify anything: no edits, no new files, no deletions, no git commits,
  no running commands that change state (installs, formatters, migrations, etc.).
- If you spot a possible fix or improvement, mention it in the answer and let the
  user decide. Do not apply it.

**If the user asks for a change** (add, modify, update, remove, delete, fix, create,
rename, refactor, implement, etc.):
- Do only the intended action, scoped to what was asked. No extra refactors or
  unrelated cleanups.

**If it's unclear** whether the user wants an answer or a change, treat it as a
question and answer without modifying anything. Ask if a change seems implied.

## Installs

Do not install anything — no npm/yarn/pnpm packages, no global tools, no browsers
(e.g. Playwright/Chromium), no system packages — without asking first.

If an install genuinely seems needed to complete a task, stop and ask the user
first. The ask must include:
- what you want to install (exact package/tool and version if relevant)
- why it's needed for the task at hand
- what happens if it's skipped (e.g. "can't verify visually, but code changes are done")

Only proceed once the user explicitly approves.
