# Image Upload Procedure

When user pasted/attached images. Pasted image in Claude Code = local file path (e.g. `~/.claude/image-cache/...`) — readable + uploadable.

## Per File — STRICTLY Sequential

Signed URL expires 60s. Finish one file completely before preparing next.

1. `stat -c%s <path>` → exact byte size. MIME from extension or `file --mime-type <path>`.
2. `prepare_attachment_upload(issue, filename, contentType, size)`.
3. IMMEDIATELY `curl -X PUT --data-binary @<path>` to `uploadRequest.url` w/ EVERY header from `uploadRequest.headers` verbatim — casing included, none added, none dropped. Never base64, never transform bytes.
4. `create_attachment_from_upload(issue, assetUrl)`.
5. Inline embed (optional but preferred): update issue description, add `![](assetUrl)` where relevant — Linear auto-signs on render.

## Failure

PUT 403 or expired → re-run prepare, retry once. Still failing → ship ticket w/o image, tell user, include local path in report.
