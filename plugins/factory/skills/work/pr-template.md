# PR Template

Title: `ABC-123: <issue title>`. Always `gh pr create --draft`.

## Body (fill placeholders, keep headings exact)

```markdown
## Summary

<2-4 sentences: what changed + why. Plain language.>

Fixes ABC-123

## Review Guide

### What changed
- <area/file → change. One bullet per logical change.>

### How to review
1. <entry point / suggested reading order>
2. <key decision or tricky spot to check>

### Risk areas
- <what could break, blast radius. "None beyond changed files" only if true.>

### Test evidence
- <command → result, e.g. `npm test` → 42 passed, 0 failed>
- <manual checks done>
- Not tested: <honest gaps>
```

## Rules

- `Fixes ABC-123` magic word MANDATORY — auto-links + auto-closes Linear issue on merge.
- Issue ID in title + branch = auto-link fallback.
- Test evidence = facts only. No "should work". Gaps stated under "Not tested:".
