/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverTranslationLanguageSettings(dependencies) {
  const Gi = dependencies.Gi;
  const Ki = dependencies.Ki;
  const Ta = dependencies.Ta;
  const an = dependencies.an;
  const classNames = dependencies.classNames;
  const jsxRuntime = dependencies.jsxRuntime;
  const so = dependencies.so;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useWordSync = dependencies.useWordSync;

  const TranslationLanguageSettings = (props) => {
    const {
        setting: { language: t },
        user: n,
      } = useAppSelector((e) => e),
      { navigate: r } = useSliderNavigation(),
      i = useApiClient(!0),
      { syncAllWords: a } = useWordSync(),
      { dispatch: o } = useDispatchBridge(),
      { locale: s } = useLocale(),
      l = (e) => {
        return (
          (r = null),
          (s = null),
          (l = function* () {
            const r = an({
              key: "translation",
              value: e,
            });
            yield o(r, !0),
              a(),
              n &&
                i.setAttributes({
                  native: e,
                  target: t.subtitle,
                });
          }),
          new Promise((e, t) => {
            var n = (e) => {
                try {
                  a(l.next(e));
                } catch (e) {
                  t(e);
                }
              },
              i = (e) => {
                try {
                  a(l.throw(e));
                } catch (e) {
                  t(e);
                }
              },
              a = (t) =>
                t.done ? e(t.value) : Promise.resolve(t.value).then(n, i);
            a((l = l.apply(r, s)).next());
          })
        );
        var r, s, l;
      };
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-nav",
          children: (0, jsxRuntime.jsxs)("div", {
            className: "nav-left",
            onClick: () => r(-1),
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "btn-slider-back",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-18",
                  children: (0, jsxRuntime.jsx)(Ta, {}),
                }),
              }),
              (0, jsxRuntime.jsx)("span", {
                children: s("rd_translate_language"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-content",
          children: (0, jsxRuntime.jsx)("div", {
            className: "item-slider-group md-0",
            children: so.map((e) =>
              (0, jsxRuntime.jsx)("div", {
                className: classNames()("item-slider pointer", {
                  selected: e.code === t.translation,
                }),
                onClick: () => l(e.code),
                children: (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider-content",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-left",
                      children: (0, jsxRuntime.jsx)("span", {
                        children: e.nativeName,
                      }),
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-right",
                      children: (0, jsxRuntime.jsx)("div", {
                        className: "right-check",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: classNames()("t-icon icon-18", {
                            solid: e.code === t.translation,
                          }),
                          children:
                            e.code === t.translation
                              ? (0, jsxRuntime.jsx)(Ki, {})
                              : (0, jsxRuntime.jsx)(Gi, {}),
                        }),
                      }),
                    }),
                  ],
                }),
              }),
            ),
          }),
        }),
      ],
    });
  };

  return TranslationLanguageSettings;
}
