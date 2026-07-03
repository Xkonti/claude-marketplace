// TEXT-BEARING component registry — consumed by the no-raw-text-nodes ESLint rule.
// Outside `components/ui`, a raw text node / mustache may appear ONLY as slot content of a
// component listed here — i.e. a component that renders that slot inside a typographically
// styled element it owns. Everything else must wrap text in a text base component
// (<Text>, <Heading>, <Label>, …).
//
// Entry semantics:
//   ComponentName: true            → plain text OK in ANY of its slots (incl. default)
//   ComponentName: ['a', 'b']      → plain text OK only in slots 'a'/'b' ('default' = default slot)
//
// REGISTERING a component is a design decision: verify the slot lands inside a styled text
// element in the component's own template (never a bare <div><slot/></div>) before adding it.
// Common trap: components whose title/description are PROPS and whose default slot is a plain
// content container (toasts, alert dialogs) are NOT text-bearing — composers put <Text> inside.
// Fail-safe posture: unlisted → error (same as the raw-element allowlist).
module.exports = {
  TEXT_BEARING: {
    /* ---- base text/typography (components/ui) ---- */
    Text: true,
    Heading: true,
    Paragraph: true,
    Label: true,
    Caption: true,
    Link: true,
    Button: true,

    /* Grow this list as the base catalog grows, e.g.:
     *   Badge: true,
     *   Dialog: ['title', 'description'],   // named slots that land in styled text
     *   DropdownMenuItem: true,
     */
  },
}
