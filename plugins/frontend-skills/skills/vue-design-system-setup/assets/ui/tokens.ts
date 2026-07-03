/*
 * Token → utility-class maps for the layout primitives (Box/Stack/Grid/Inline) and other
 * base components.
 *
 * WHY explicit literal maps (not `\`p-${size}\``): Tailwind v4 generates utilities by STATICALLY
 * scanning source for class strings. A template-interpolated class name is invisible to the
 * scanner and the utility never gets emitted. Every class a primitive can produce must therefore
 * appear here as a literal. These maps ARE the typed token surface — the prop types derive from
 * their keys, so a bad value (`gap="huge"`) is a compile error.
 *
 * Lives in `components/ui` (the only tier allowed raw skin); imported by the base primitives.
 *
 * SOURCE OF TRUTH is `styles/tokens.css`: these maps expose its SEMANTIC tokens as a typed
 * prop surface — never its `--raw-*` primitives (those are private to that file), and never a
 * class outside the token set. New token there → new map entry / union member here.
 */

export type Space = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export const gapClass: Record<Space, string> = {
  none: 'gap-0',
  xs: 'gap-xs',
  sm: 'gap-sm',
  md: 'gap-md',
  lg: 'gap-lg',
  xl: 'gap-xl',
  '2xl': 'gap-2xl',
}

export const pClass: Record<Space, string> = {
  none: 'p-0',
  xs: 'p-xs',
  sm: 'p-sm',
  md: 'p-md',
  lg: 'p-lg',
  xl: 'p-xl',
  '2xl': 'p-2xl',
}

export const pxClass: Record<Space, string> = {
  none: 'px-0',
  xs: 'px-xs',
  sm: 'px-sm',
  md: 'px-md',
  lg: 'px-lg',
  xl: 'px-xl',
  '2xl': 'px-2xl',
}

export const pyClass: Record<Space, string> = {
  none: 'py-0',
  xs: 'py-xs',
  sm: 'py-sm',
  md: 'py-md',
  lg: 'py-lg',
  xl: 'py-xl',
  '2xl': 'py-2xl',
}

export type Surface = 'none' | 'base' | 'card' | 'raised' | 'sunken'

export const surfaceClass: Record<Surface, string> = {
  none: '',
  base: 'bg-surface-base',
  card: 'bg-surface-card',
  raised: 'bg-surface-raised',
  sunken: 'bg-surface-sunken',
}

export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full'

export const radiusClass: Record<Radius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export type Shadow = 'none' | 'sm' | 'md' | 'lg'

export const shadowClass: Record<Shadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

export type Border = 'none' | 'subtle' | 'default' | 'strong'

export const borderClass: Record<Border, string> = {
  none: '',
  subtle: 'border border-border-subtle',
  default: 'border border-border',
  strong: 'border border-border-strong',
}

export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

export const alignClass: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export const justifyClass: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

export type Cols = 1 | 2 | 3 | 4 | 5 | 6 | 12

export const colsClass: Record<Cols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
}

/** Semantic elements the polymorphic `Box`/layout primitives may render via `as` (incl. landmarks). */
export type BoxElement =
  | 'div'
  | 'span'
  | 'section'
  | 'article'
  | 'main'
  | 'nav'
  | 'header'
  | 'footer'
  | 'aside'

/** Joins truthy class fragments — the base components' tiny local class composer. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
