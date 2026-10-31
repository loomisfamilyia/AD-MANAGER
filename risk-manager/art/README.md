# Art for the Personal Risk Manager

The illustrator (working in Canva Pro) draws every picture in the game. This folder is how her work gets
specified, returned and approved.

## The manifest is the source of truth

[`assets.ts`](assets.ts) lists every image: file name, round (1 to 3), what to draw, canvas size, variants
(colors, skin tones, numbered copies), the catalog kinds it represents, and the emoji placeholder the app uses today.
The app loads art **by these file names**, so renaming something there is a code change too. Use `expandFiles()`
to get the real file names (a variant becomes its own file, for example `vehicle-sedan-red.png`).

## Folders

| Folder | What goes in it |
| --- | --- |
| `incoming/` | Files as they arrive from the illustrator, untouched. |
| `final/` | Files that have been checked (name, size, transparent background) and approved for the app. |
| `reference/` | Prototype screenshots used on the "Where your art goes" page of the brief. |

## The brief PDF

```
cd risk-manager
npm run art:brief
```

Regenerates `Loomis-Risk-Manager-Art-Brief.pdf` (via an intermediate `brief.html`, which is not committed) from the manifest, so never edit either by hand. The
script fails (and writes nothing) if a file name is not lowercase-kebab `.png`, a size is malformed, a file name is
used twice, or any kind in `src/catalog/kinds.ts` or any life event in `src/catalog/lifeEvents.ts` has no art listed.
Add the new kind to some asset's `kinds` (or add an `event-<id>.png` entry) and run it again.
