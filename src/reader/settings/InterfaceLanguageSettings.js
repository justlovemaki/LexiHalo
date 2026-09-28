/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverInterfaceLanguageSettings(dependencies) {
  const Gi = dependencies.Gi;
  const Ki = dependencies.Ki;
  const Ta = dependencies.Ta;
  const an = dependencies.an;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const so = dependencies.so;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const InterfaceLanguageSettings = (props) => {
    const {
        setting: { language: t },
        config: n,
      } = useAppSelector((e) => e),
      { navigate: r } = useSliderNavigation(),
      { locale: i } = useLocale(),
      { dispatch: a } = useDispatchBridge(),
      o = (e) => {
        return (
          (n = null),
          (r = null),
          (i = function* () {
            if (t.interface !== e) {
              const t = an({
                key: "interface",
                value: e,
              });
              a(t, !0);
            }
            extensionClient.rebuildContextMenus();
          }),
          new Promise((e, t) => {
            var a = (e) => {
                try {
                  s(i.next(e));
                } catch (e) {
                  t(e);
                }
              },
              o = (e) => {
                try {
                  s(i.throw(e));
                } catch (e) {
                  t(e);
                }
              },
              s = (t) =>
                t.done ? e(t.value) : Promise.resolve(t.value).then(a, o);
            s((i = i.apply(n, r)).next());
          })
        );
        var n, r, i;
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
                children: i("settingLanguageUI"),
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
                  selected: e.code === t.interface,
                }),
                onClick: () => o(e.code),
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
                            solid: e.code === t.interface,
                          }),
                          children:
                            e.code === t.interface
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

  return InterfaceLanguageSettings;
}
