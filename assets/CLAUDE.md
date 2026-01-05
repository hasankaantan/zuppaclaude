# Claude Code - Enhanced System Instructions

## General Behavior
- Be proactive: After analysis ask "Should I implement?" or "Let's start?"
- Provide summary report when done (commit hash, changes, line count)
- Don't ask open-ended questions, suggest the best option

## SuperClaude Framework (Active)
SuperClaude slash commands are loaded. Use them proactively:

### Planning & Design
- `/sc:brainstorm` - Idea development and brainstorming
- `/sc:design` - Architectural design
- `/sc:estimate` - Time/resource estimation
- `/sc:spec-panel` - Specification panel

### Development
- `/sc:implement` - Code implementation
- `/sc:build` - Build and compile
- `/sc:improve` - Code improvement
- `/sc:explain` - Code explanation

### Testing & Quality
- `/sc:test` - Test creation
- `/sc:analyze` - Code analysis
- `/sc:troubleshoot` - Debugging
- `/sc:reflect` - Retrospective

### Documentation & Help
- `/sc:document` - Documentation creation
- `/sc:help` - Command help

### Research
- `/sc:research` - Deep web research
- `/sc:business-panel` - Business analysis

### Project Management
- `/sc:task` - Task management
- `/sc:workflow` - Workflow management
- `/sc:pm` - Project management

### Other
- `/sc:agent` - Agent management
- `/sc:spawn` - Sub-agent creation
- `/sc:index-repo` - Repository indexing
- `/sc:git` - Git operations

## Spec Kit (Active)
Spec-driven development with `specify` CLI:

```bash
specify init         # Initialize project
specify constitution # Project rules
specify spec         # Functional requirements
specify plan         # Technical implementation plan
specify tasks        # Task breakdown
```

For large features, recommend this workflow:
1. `specify constitution` - Base rules
2. `specify spec` - What to do
3. `specify plan` - How to do it
4. `specify tasks` - Step-by-step tasks
5. Implementation

## Task Completion (Critical)
- ALWAYS provide summary report when done
- Don't finish with just "Tasks: 6/6" - that's NOT a summary
- Show commit hash, change list, line count

## Response Format
- Short and concise answers
- Use Markdown formatting
- Specify language for code blocks
- Status: OK = success, ERR = error, WARN = warning

## Git Commit Message Guidelines

Follow Conventional Commits specification.

### Format
```
<type>: <description>

[optional body]

[optional footer]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Rules
1. Use simple present tense: "adds" not "add" or "added"
2. Use lowercase: "feat: adds feature" not "Feat: Adds Feature"
3. Limit first line to 72 characters or less
4. Use bullet points in body with hyphens (-)
5. Be specific and descriptive

### Examples

#### Good
```
feat: adds user authentication system

- adds login and registration endpoints
- adds JWT token generation
- adds password hashing with bcrypt
```

```
fix: resolves login validation issue

- fixes email format validation
- adds proper error messages
```
