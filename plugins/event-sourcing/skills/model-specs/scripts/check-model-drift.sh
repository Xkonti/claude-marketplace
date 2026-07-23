#!/usr/bin/env bash
#
# check-model-drift.sh — model↔code anchor drift gate (model-specs skill, verification tier E)
#
# Verifies the bidirectional contract between an event model (typed IDs: [fact:x], [cmd:x],
# [rm:x], [proc:x], [slice:x]) and code (anchor comments carrying the verbatim token).
# Convention: event-modeling/notation.md § Model↔code anchors.
#
# Checks:
#   1. MISSING-CODE          — element of an implementable type owned by an `implemented` slice
#                              has no code anchor. `implemented` is a claim; this proves it.
#   2. UNKNOWN-ANCHOR        — code anchor resolves to no defined model element (typo, or model
#                              element renamed/deleted without updating code).
#   3. MODELED-ONLY-IN-CODE  — element/slice marked `modeled-only` appears in code anyway
#                              (implement it for real — drop the marker — or the anchor is stray).
#
# Usage:
#   check-model-drift.sh --model-dir <dir> --code-root <dir> [--code-root <dir>...]
#                        [--ignore <dirname>]... [--code-ext <csv>] [-h|--help]
#   Env fallback: MODEL_DIR, CODE_ROOTS (space-separated).
#
# Exit codes: 0 = clean (or N/A) · 1 = drift found · 2 = usage/config error.
#
# LIMITATIONS (by design — zero-dep bash+grep, language-agnostic):
#   - Comment-blind: greps the bracketed token anywhere in a code file; cannot prove it sits in a
#     comment. A token in a string literal counts as present. Low risk — anchors are deliberate.
#   - Presence-only: proves the anchor token exists, not that the artifact implements the element
#     correctly. Semantic correctness is out of scope.
#   - Exact-match: ids are lowercase-kebab; a case/spelling mismatch reads as a different id and
#     surfaces as a MISSING-CODE + UNKNOWN-ANCHOR pair — which IS the drift, working as intended.
#   - screen:/xfact:/flow: are never gated (UI, external contracts, grouping — not backend code).
#   - Generated files carrying anchors may double-count an id — harmless (gate needs ≥1).
#   - Multi-context: ids are globally unique per type:id. Point --model-dir at one context for
#     scoped findings, or at the event-model root to gate all contexts at once.

set -u

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-2}"
}

MODEL_DIR="${MODEL_DIR:-}"
CODE_ROOTS_STR="${CODE_ROOTS:-}"
declare -a ROOTS=()
declare -a IGNORES=(node_modules bin obj dist build target vendor .git .idea .vs)
CODE_EXT=""

[ -n "$CODE_ROOTS_STR" ] && for r in $CODE_ROOTS_STR; do ROOTS+=("$r"); done

while [ $# -gt 0 ]; do
  case "$1" in
    --model-dir) MODEL_DIR="${2:-}"; shift 2 ;;
    --code-root) ROOTS+=("${2:-}"); shift 2 ;;
    --ignore)    IGNORES+=("${2:-}"); shift 2 ;;
    --code-ext)  CODE_EXT="${2:-}"; shift 2 ;;
    -h|--help)   usage 0 ;;
    *) echo "check-model-drift: unknown arg '$1'" >&2; usage 2 ;;
  esac
done

[ -n "$MODEL_DIR" ] || { echo "check-model-drift: --model-dir required" >&2; exit 2; }
[ -d "$MODEL_DIR" ] || { echo "check-model-drift: model dir not found: $MODEL_DIR" >&2; exit 2; }
[ "${#ROOTS[@]}" -gt 0 ] || { echo "check-model-drift: at least one --code-root required" >&2; exit 2; }
for r in "${ROOTS[@]}"; do
  [ -d "$r" ] || { echo "check-model-drift: code root not found: $r" >&2; exit 2; }
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

ANCHOR_RE='\[(fact|xfact|cmd|rm|screen|proc|slice|flow):[a-z0-9-]+\]'

# --- 1. MODEL PARSE ------------------------------------------------------------------------------
# One awk pass over every model .md. Emits TSV:
#   DEF   <id>                          element definition (or slice/flow heading)
#   OWN   <id> <slice-status> <mo>      element + owning slice's status + element-level modeled-only
# Slice status: first token of the Status: line ("modeled-only" when the line starts with it).
find "$MODEL_DIR" -name '*.md' -print0 | xargs -0 awk '
  function kebab(s) { gsub(/^[ \t]+|[ \t]+$/, "", s); gsub(/[ \t]+/, "-", s); return tolower(s) }
  /^#### Slice:/ {
    name = $0
    sub(/^#### Slice:[ \t]*/, "", name)
    sub(/[ \t]*\[.*$/, "", name)
    cur_slice = "slice:" kebab(name)
    cur_status = "modeled"
    pending_slice = 1
    next
  }
  /^Status:/ {
    if (pending_slice) {
      status = $2
      # "Status: modeled-only — reason" → first token is modeled-only
      cur_status = status
      print "DEF\t" cur_slice
      print "OWN\t" cur_slice "\t" cur_status "\t-"
      pending_slice = 0
    }
    next
  }
  /^## Flow:/ {
    name = $0
    sub(/^## Flow:[ \t]*/, "", name)
    print "DEF\tflow:" kebab(name)
    next
  }
  /^\*\*(Business fact|Command|Read model|External fact|Processor|Screen)\*\*[ \t]*\[/ {
    if (match($0, /\[[a-z]+:[a-z0-9-]+\]/)) {
      id = substr($0, RSTART + 1, RLENGTH - 2)
      mo = ($0 ~ /—[ \t]*modeled-only/ || $0 ~ /--[ \t]*modeled-only/) ? "MO" : "-"
      print "DEF\t" id
      print "OWN\t" id "\t" cur_status "\t" mo
    }
    next
  }
' > "$TMP/model" 2>/dev/null || true

# DEFINED: every valid anchor target (any status).
grep '^DEF' "$TMP/model" | cut -f2 | sort -u > "$TMP/defined"

# MUST_CODE: implementable-type ids owned by an implemented slice, minus modeled-only elements.
awk -F'\t' '
  $1 == "OWN" && $3 == "implemented" && $4 != "MO" {
    split($2, a, ":")
    if (a[1] == "fact" || a[1] == "cmd" || a[1] == "rm" || a[1] == "proc" || a[1] == "slice")
      print $2
  }
' "$TMP/model" | sort -u > "$TMP/must_code"

# MODELED_ONLY: ids explicitly marked, or owned by a modeled-only slice.
awk -F'\t' '
  $1 == "OWN" && ($4 == "MO" || $3 == "modeled-only") { print $2 }
' "$TMP/model" | sort -u > "$TMP/modeled_only"

# For findings context: id → "slice-status" map (first occurrence).
awk -F'\t' '$1 == "OWN" && !($2 in seen) { seen[$2] = 1; print $2 "\t" $3 }' "$TMP/model" \
  > "$TMP/own_status"

# --- 2. CODE SCAN --------------------------------------------------------------------------------
EXCLUDES=()
for d in "${IGNORES[@]}"; do EXCLUDES+=("--exclude-dir=$d"); done
INCLUDES=()
if [ -n "$CODE_EXT" ]; then
  IFS=',' read -ra exts <<< "$CODE_EXT"
  for e in "${exts[@]}"; do INCLUDES+=("--include=*.${e#.}"); done
fi

: > "$TMP/code_raw"
for root in "${ROOTS[@]}"; do
  grep -rInoE "${EXCLUDES[@]}" ${INCLUDES[@]+"${INCLUDES[@]}"} "$ANCHOR_RE" "$root" \
    >> "$TMP/code_raw" 2>/dev/null || true
done

# code_raw lines: path:line:[type:id] → ids + first-location map
sed -E 's/^(.*):([0-9]+):\[([a-z]+:[a-z0-9-]+)\]$/\3\t\1:\2/' "$TMP/code_raw" | sort -u > "$TMP/code_pairs"
cut -f1 "$TMP/code_pairs" | sort -u > "$TMP/code_ids"
awk -F'\t' '!($1 in seen) { seen[$1] = 1; print }' "$TMP/code_pairs" > "$TMP/code_loc"

loc_of() { awk -F'\t' -v id="$1" '$1 == id { print $2; exit }' "$TMP/code_loc"; }
status_of() { awk -F'\t' -v id="$1" '$1 == id { print $2; exit }' "$TMP/own_status"; }

# --- N/A short-circuit ---------------------------------------------------------------------------
if [ ! -s "$TMP/must_code" ] && [ ! -s "$TMP/modeled_only" ]; then
  echo "check-model-drift: N/A (no implemented slices, no modeled-only elements) → OK"
  exit 0
fi

# --- 3. CHECKS -----------------------------------------------------------------------------------
comm -23 "$TMP/must_code" "$TMP/code_ids" > "$TMP/f1" || true
comm -23 "$TMP/code_ids" "$TMP/defined" > "$TMP/f2" || true
comm -12 "$TMP/modeled_only" "$TMP/code_ids" > "$TMP/f3" || true

while IFS= read -r id; do
  printf 'MISSING-CODE          [%s]  slice status: %s  no code anchor found\n' \
    "$id" "$(status_of "$id")"
done < "$TMP/f1"

while IFS= read -r id; do
  printf 'UNKNOWN-ANCHOR        [%s]  %s  not a defined model element\n' \
    "$id" "$(loc_of "$id")"
done < "$TMP/f2"

while IFS= read -r id; do
  printf 'MODELED-ONLY-IN-CODE  [%s]  %s  marked modeled-only in the model\n' \
    "$id" "$(loc_of "$id")"
done < "$TMP/f3"

n1=$(wc -l < "$TMP/f1"); n2=$(wc -l < "$TMP/f2"); n3=$(wc -l < "$TMP/f3")
total=$((n1 + n2 + n3))

if [ "$total" -gt 0 ]; then
  echo "check-model-drift: $n1 MISSING-CODE, $n2 UNKNOWN-ANCHOR, $n3 MODELED-ONLY-IN-CODE → DRIFT"
  exit 1
fi

matched=$(wc -l < "$TMP/must_code")
code_n=$(wc -l < "$TMP/code_ids")
echo "check-model-drift: clean ($matched implemented anchors, $code_n code anchors matched) → OK"
exit 0
