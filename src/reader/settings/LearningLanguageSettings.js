/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverLearningLanguageSettings(dependencies) {
  const Gi = dependencies.Gi;
  const I_ = dependencies.I_;
  const Jy = dependencies.Jy;
  const Ki = dependencies.Ki;
  const Ta = dependencies.Ta;
  const Xy = dependencies.Xy;
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

  const LearningLanguageSettings = (props) => {
    const {
        setting: { language: t },
        user: n,
      } = useAppSelector((e) => e),
      { navigate: r } = useSliderNavigation(),
      { locale: i } = useLocale(),
      a = useApiClient(!0),
      { syncAllWords: o } = useWordSync(),
      { dispatch: s } = useDispatchBridge(),
      l = (e) => {
        return (
          (r = null),
          (i = null),
          (l = function* () {
            const r = an({
              key: "subtitle",
              value: e,
            });
            yield s(r, !0),
              o(),
              n &&
                a.setAttributes({
                  native: t.translation,
                  target: e,
                });
          }),
          new Promise((e, t) => {
            var n = (e) => {
                try {
                  o(l.next(e));
                } catch (e) {
                  t(e);
                }
              },
              a = (e) => {
                try {
                  o(l.throw(e));
                } catch (e) {
                  t(e);
                }
              },
              o = (t) =>
                t.done ? e(t.value) : Promise.resolve(t.value).then(n, a);
            o((l = l.apply(r, i)).next());
          })
        );
        var r, i, l;
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
                children: i("rd_learning_language"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-content",
          children: (0, jsxRuntime.jsx)("div", {
            className: "item-slider-group md-0",
            children: so
              .filter((e) => e.tokenize)
              .map((n) =>
                (0, jsxRuntime.jsx)("div", {
                  className: classNames()("item-slider pointer", {
                    selected: n.code === t.subtitle,
                  }),
                  onClick: () => l(n.code),
                  children: (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-content",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-left",
                        children: [
                          (0, jsxRuntime.jsx)(
                            I_,
                            Xy(Jy({}, props), {
                              name: n.flag,
                            }),
                          ),
                          (0, jsxRuntime.jsx)("span", {
                            children: n.nativeName,
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-right",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "right-check",
                          children: (0, jsxRuntime.jsx)("div", {
                            className: classNames()("t-icon icon-18", {
                              solid: n.code === t.subtitle,
                            }),
                            children:
                              n.code === t.subtitle
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

  return LearningLanguageSettings;
}
