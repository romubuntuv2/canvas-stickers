# Contributing to Canvas Stickers

Thanks for your interest in improving Canvas Stickers!

## pull requests are not accepted

For now, this project does not accept pull requests. My main goal with this project was to learn about Obsidian modding. 

## but ideas are welcome

We welcome your ideas through feature suggestions.
Please feel free to report any bugs, which I will fix as soon as possible.



## building from source

The project is open source, so feel free to build it yourself or improve it. 

**Prerequisites:** [Node.js](https://nodejs.org) 20+ and npm.

```bash
npm install       # install dependencies
npm run dev       # esbuild in watch mode (rebuilds main.js on save)
npm run build     # type-check + production bundle
```

The plugin's source lives in `src/` and bundles to `main.js`. To try a build in a real
vault, work directly inside a test vault's `.obsidian/plugins/beautytasks/` folder (the
[Hot-Reload plugin](https://github.com/pjeby/hot-reload) picks up rebuilds automatically),
or copy `main.js`, `manifest.json` and `styles.css` into that folder and reload Obsidian.

## License

Canvas Sticker is released under the [GPL-3.0 LICENSE](LICENSE).