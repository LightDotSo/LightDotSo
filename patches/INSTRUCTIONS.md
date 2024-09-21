# Patching Fumadocs

## Fumadocs UI

### Card

Replace `Link` with `a` in `fumadocs-ui`, to be compatible with next zones.

Ref: https://github.com/fuma-nama/fumadocs/blob/8608780f293a362abb024179d9ac5b3acf340e26/packages/ui/src/components/card.tsx#L33

Search: `props.href && 'hover:bg-fd-accent/80'`
Also: `"fumadocs-core/link"` & `"next/link"`
