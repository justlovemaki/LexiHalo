# Reader settings source

This directory is the maintained source for Reader settings UI.

`tools/build-readable-bundles.mjs` parses every `.js` source factory here, resolves its declared dependencies against the recovered Reader bundle, and replaces the corresponding bundled component. Components are installed lazily so dependencies declared later in the legacy scope are not accessed during bundle initialization.

The build fails when:

- a source file does not export one `recover*` factory;
- its factory does not return a component;
- a declared dependency cannot be resolved;
- the corresponding bundled component cannot be replaced;
- fewer than the required settings components are installed.

`DualSubtitleSettings.js` owns the two subtitle-cache controls. Cache behavior itself lives in `src/shared/clearScopedCache.js`.

Do not edit the generated implementations in `assets/edreader-main.js`; run `npm run build` after changing these files.
