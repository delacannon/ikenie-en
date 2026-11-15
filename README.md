# Ikenie EN

3D box viewer for **Ikenie - Kyouraku no Shinden** (いけにえ ～享楽の神殿～, Cat's Pro, 1994, PC-98) with the English translation patch.

**[Open the site](https://delacannon.github.io/ikenie-en/)** (18+)

- 3D box: drag to orbit, wheel to zoom, `Space` to turn it, `L` to switch lighting
- English patch: drop your own hard-disk image (`.hdi` / `.nhd`, with the `IKENIE` folder) on the page, a patched copy is saved. Nothing is uploaded and your original is not changed

The patch contains no game data: you need your own copy of the game.

Front cover from a 256×368 scan (Lanczos upscale); back and spine in `public/covers/` are text placeholders.

## Run it

```sh
pnpm install --ignore-workspace
pnpm dev
```

The built site lives on the `gh-pages` branch.

## Rebuild the patch

From the last Kizuato Studio build of `~/kizuato-re/project-ikenie`, verified against the original disk:

```sh
pnpm patch:export
```

## Support

If you enjoy these PC-98 translations: [ko-fi.com/alammo](https://ko-fi.com/alammo)
