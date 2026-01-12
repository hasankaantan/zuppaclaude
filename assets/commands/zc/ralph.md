# /zc:ralph - PRD-Driven Autonomous Development

Autonomous AI agent loop that implements PRD (Product Requirements Document) user stories iteratively.

## Overview

Ralph runs Claude Code in a loop, implementing one user story per iteration until all stories pass. Each iteration starts with clean context but maintains memory through `progress.txt` and git history.

## Usage

```bash
# Initialize Ralph in current project
zuppaclaude ralph init

# Run Ralph loop (default: 10 iterations)
zuppaclaude ralph run

# Run with custom iterations
zuppaclaude ralph run --iterations 20

# Check status
zuppaclaude ralph status
```

## Workflow

1. **Create PRD**: Define user stories in `prd.json`
2. **Run Ralph**: Execute `zuppaclaude ralph run`
3. **Watch**: Ralph implements stories one by one
4. **Done**: All stories marked as `passes: true`

## Files

| File | Purpose |
|------|---------|
| `prd.json` | User stories with pass/fail status |
| `progress.txt` | Learnings and context for future iterations |
| `ralph-prompt.md` | Instructions for each Claude iteration |
| `AGENTS.md` | Code patterns and conventions |

## PRD Format

```json
{
  "name": "feature-name",
  "stories": [
    {
      "id": "US-001",
      "title": "Story title",
      "description": "What needs to be done",
      "acceptance": ["Criteria 1", "Criteria 2"],
      "passes": false
    }
  ]
}
```

## Credits

Inspired by [snarktank/ralph](https://github.com/snarktank/ralph) - Autonomous AI agent loop for Amp CLI.
