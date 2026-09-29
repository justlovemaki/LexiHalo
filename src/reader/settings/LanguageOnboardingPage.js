/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverLanguageOnboardingPage(dependencies) {
  const Bw = dependencies.Bw;
  const Ca = dependencies.Ca;
  const Gn = dependencies.Gn;
  const I_ = dependencies.I_;
  const Ki = dependencies.Ki;
  const React = dependencies.React;
  const Rw = dependencies.Rw;
  const an = dependencies.an;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const ka = dependencies.ka;
  const so = dependencies.so;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useToast = dependencies.useToast;
  const ya = dependencies.ya;
  const yi = dependencies.yi;
  const zw = dependencies.zw;

  const LanguageOnboardingPage = (props) => {
    var t;
    const {
        setting: { language: n },
        user: r,
      } = useAppSelector((e) => e),
      { navigate: i } = useSliderNavigation(),
      { locale: a } = useLocale(),
      o = useApiClient(!0),
      [s, l] = (0, React.useState)(!1),
      [c, u] = (0, React.useState)(!1),
      { dispatch: d } = useDispatchBridge(),
      { Toast: _, toast: p } = useToast();
    return (
      (0, React.useEffect)(() => {
        Bw(null, null, function* () {
          const { message: e, data: t } = yield o.getMeta();
          "ok" === e && d(Gn(t));
        });
      }, []),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside rd-slider-setting",
        id: "trancy-slider",
        onClick: () => l(!1),
        children: [
          (0, jsxRuntime.jsx)(_, {}),
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-setting-nav",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "brand",
                children: [
                  (0, jsxRuntime.jsx)(yi, {}),
                  (0, jsxRuntime.jsx)("span", {
                    children: "LexiHalo",
                  }),
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)("div", {
            className: "rd-setting-wrapper",
            children: (0, jsxRuntime.jsx)("div", {
              className: "rd-setting-container",
              children: (0, jsxRuntime.jsxs)("div", {
                className: "rd-slider-content",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "language-selector-native-content",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "language-selector-title",
                        children: [
                          (0, jsxRuntime.jsx)("h3", {
                            className: "title",
                            children: a("setting_guide_mother_language"),
                          }),
                          (0, jsxRuntime.jsx)("p", {
                            className: "desc",
                            children: a("setting_guide_mother_language_tips"),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: classNames()("language-selector-native", {
                          errorshake: c && "und" === n.translation,
                        }),
                        onClick: (e) => {
                          e.stopPropagation(), l("native");
                        },
                        children: (0, jsxRuntime.jsxs)("div", {
                          className: classNames()(
                            "language-selector-native-value",
                            {
                              error: c && "und" === n.translation,
                            },
                          ),
                          children: [
                            (0, jsxRuntime.jsx)("span", {
                              children:
                                (null ==
                                (t = so.find((e) => e.code === n.translation))
                                  ? void 0
                                  : t.nativeName) || a("WelcomeSelectLanguage"),
                            }),
                            (0, jsxRuntime.jsx)("div", {
                              className: "t-icon icon-20",
                              children: (0, jsxRuntime.jsx)(ka, {}),
                            }),
                            "native" === s &&
                              (0, jsxRuntime.jsx)("div", {
                                className: "dropdown-menu top",
                                children: so.map((e) =>
                                  (0, jsxRuntime.jsxs)("div", {
                                    className: classNames()("items", {
                                      selected: e.code === n.translation,
                                    }),
                                    onClick: (t) => {
                                      d(
                                        an({
                                          key: "translation",
                                          value: e.code,
                                        }),
                                        !0,
                                      ),
                                        d(
                                          an({
                                            key: "interface",
                                            value: e.code,
                                          }),
                                          !0,
                                        ),
                                        t.stopPropagation(),
                                        l(!1);
                                    },
                                    children: [
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "t-icon icon-16 anchor",
                                        children: (0, jsxRuntime.jsx)(Ki, {}),
                                      }),
                                      (0, jsxRuntime.jsx)("span", {
                                        children: e.nativeName,
                                      }),
                                    ],
                                  }),
                                ),
                              }),
                          ],
                        }),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "language-selector-target",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "language-selector-title",
                        children: [
                          (0, jsxRuntime.jsx)("h3", {
                            className: "title",
                            children: a("setting_guide_learning_language"),
                          }),
                          (0, jsxRuntime.jsx)("p", {
                            className: "desc",
                            children: a("setting_guide_learning_language_tips"),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()("target-group"),
                        children: [
                          (0, jsxRuntime.jsx)("svg", {
                            viewBox: "25 25 50 50",
                            children: (0, jsxRuntime.jsx)("circle", {
                              r: "20",
                              cy: "50",
                              cx: "50",
                            }),
                          }),
                          so
                            .filter((e) => e.tokenize)
                            .map((t) =>
                              (0, jsxRuntime.jsxs)("div", {
                                className: classNames()("item-target", {
                                  selected: t.code === n.subtitle,
                                }),
                                onClick: (e) => {
                                  d(
                                    an({
                                      key: "subtitle",
                                      value: t.code,
                                    }),
                                    !0,
                                  ),
                                    e.stopPropagation(),
                                    l(!1);
                                },
                                children: [
                                  (0, jsxRuntime.jsx)(
                                    I_,
                                    Rw(zw({}, props), {
                                      name: t.flag,
                                    }),
                                  ),
                                  (0, jsxRuntime.jsx)("span", {
                                    children: t.nativeName,
                                  }),
                                ],
                              }),
                            ),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "rd-setting-footer",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-btn-group",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "trancy-btn outline",
                            onClick: () => extensionClient.toggleSlider(),
                            children: (0, jsxRuntime.jsx)("span", {
                              children: a("setting_guide_close"),
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "trancy-btn solid",
                            onClick: () =>
                              Bw(null, null, function* () {
                                if (
                                  (u(!0),
                                  "und" === n.subtitle ||
                                    "und" === n.translation)
                                )
                                  return p.error(
                                    a("toast_language_both"),
                                    2500,
                                  );
                                r &&
                                  o.setAttributes({
                                    target: n.subtitle,
                                    native: n.translation,
                                  }),
                                  window.dispatchEvent(
                                    new CustomEvent("edvideo:caption.reload", {
                                      detail: {
                                        body: {
                                          status: "on",
                                        },
                                      },
                                    }),
                                  ),
                                  extensionClient.toggleSlider();
                              }),
                            children: [
                              (0, jsxRuntime.jsx)("span", {
                                children: a("modalConfirm"),
                              }),
                              (0, jsxRuntime.jsx)(Ca, {}),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("a", {
                        href: "https://tally.so/r/nrbVNM",
                        target: "_blank",
                        className: "no-language-support",
                        children: a("language_not_list"),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
        ],
      })
    );
  };

  return LanguageOnboardingPage;
}
