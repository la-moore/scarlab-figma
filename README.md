# Scarlab Icons — Figma Plugin

A [Figma plugin](https://www.figma.com/community/plugin/1053846082213772972/Scarlab-Icons) for inserting [Scarlab Icons](https://scarlab-icons.la-moore.ru/) into your designs. Browse 1400+ icons in four styles — Base, Outline, Solid and Ghost — and add them to the canvas as editable vectors.

## Features

- **Search** across all styles, with match counts per style
- **Click** to insert at the viewport center, or into the centre of the selected frame, group or section
- **Drag & drop** an icon anywhere on the canvas
- **Size, stroke width and color** applied on insert
- Follows the **Figma light/dark theme**
- **Resizable** window; settings and size are remembered between sessions

## Development

```shell
npm install
npm run build   # type-check and build to dist/
npm run watch   # rebuild on change
npm run dev     # preview the UI in a browser
npm run lint
```

In Figma desktop, go to **Plugins → Development → Import plugin from manifest…** and select `dist/manifest.json`.

## License

[MIT](LICENSE)
