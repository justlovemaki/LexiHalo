/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverWordDetailPanel(dependencies) {
  const Gw = dependencies.Gw;
  const Ii = dependencies.Ii;
  const Kw = dependencies.Kw;
  const Ma = dependencies.Ma;
  const Mi = dependencies.Mi;
  const React = dependencies.React;
  const Ta = dependencies.Ta;
  const WordActionButtons = dependencies.WordActionButtons;
  const classNames = dependencies.classNames;
  const gv = dependencies.gv;
  const ja = dependencies.ja;
  const jsxRuntime = dependencies.jsxRuntime;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDictionary = dependencies.useDictionary;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useSpeech = dependencies.useSpeech;
  const useWordSync = dependencies.useWordSync;
  const za = dependencies.za;

  const WordDetailPanel = (props) => {
    const {
        words: t,
        edreader: n,
        updatedWordbookAt: r,
      } = useAppSelector((e) => e),
      { navigate: i } = useSliderNavigation(),
      { locale: a } = useLocale(),
      { mapExplains: o, mapPhonetic: s } =
        (useApiClient(!0), useDictionary(!0)),
      { speechWord: l, speechStatus: c } = useSpeech(),
      { dispatch: u } = useDispatchBridge(),
      [d, _] = (0, React.useState)(!1),
      [p, h] = (0, React.useState)([]),
      [m, g] = (0, React.useState)([]),
      [f, v] = (0, React.useState)(!1),
      { syncAllWords: b } = useWordSync(),
      [y, x] = (0, React.useState)(!1),
      w = (0, React.useMemo)(() => t.filter((e) => e.star).length, [t]),
      k = (0, React.useMemo)(
        () => t.filter((e) => e.star && e.master).length,
        [t],
      ),
      T = (0, React.useMemo)(
        () => t.filter((e) => e.star && !e.master).length,
        [t],
      );
    return (
      (0, React.useEffect)(() => {
        Gw(null, null, function* () {
          const e = t
            .filter((e) => e.star && (y ? e.master : !e.master))
            .sort(
              (e, t) =>
                (t.updatedAt || 0) - ((null == e ? void 0 : e.updatedAt) || 0),
            );
          h(e), _(!0);
        });
      }, [t, y]),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside",
        id: "trancy-slider",
        children: [
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-nav",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "nav-left",
                onClick: () => i("/page-wordlist"),
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "btn-slider-back",
                    children: (0, jsxRuntime.jsx)("div", {
                      className: "t-icon icon-18",
                      children: (0, jsxRuntime.jsx)(Ta, {}),
                    }),
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "title",
                    children: [
                      (0, jsxRuntime.jsx)("strong", {
                        children: a("my_vocabulary"),
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "num",
                        children: w,
                      }),
                    ],
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "nav-right",
                children: (0, jsxRuntime.jsxs)("div", {
                  className: classNames()(
                    "btn-slider-link",
                    f ? "loading" : "",
                  ),
                  onClick: () =>
                    Gw(null, null, function* () {
                      v(!0), yield b(), v(!1);
                    }),
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "t-icon icon-16",
                      children: f
                        ? (0, jsxRuntime.jsx)(Mi, {})
                        : (0, jsxRuntime.jsx)(Ii, {}),
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: a(f ? "syncing_wordbook" : "sync_wordbook"),
                    }),
                  ],
                }),
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-content pd-top-0",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "rd-slider-tab",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    onClick: () => x(!1),
                    className: classNames()("tab-item", {
                      active: !y,
                    }),
                    children: [
                      a("wordbook_tab_learning"),
                      " ",
                      (0, jsxRuntime.jsxs)("span", {
                        children: ["(", T, ")"],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    onClick: () => x(!0),
                    className: classNames()("tab-item", {
                      active: y,
                    }),
                    children: [
                      a("wordbook_tab_master"),
                      " ",
                      (0, jsxRuntime.jsxs)("span", {
                        children: ["(", k, ")"],
                      }),
                    ],
                  }),
                ],
              }),
              d && 0 === p.length && (0, jsxRuntime.jsx)(gv, Kw({}, props)),
              (0, jsxRuntime.jsx)("div", {
                className: "rd-word-item-card no-padding",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "word-item-group",
                  children: p.map((e) =>
                    (0, jsxRuntime.jsxs)("div", {
                      className: classNames()("word-item", {
                        active: m.includes(e.text),
                      }),
                      onClick: () => {
                        return (
                          (t = e.text),
                          Gw(null, null, function* () {
                            m.includes(t)
                              ? g(m.filter((e) => e !== t))
                              : (g([...m, t]), n.selectAutoSpeech && l(t));
                          })
                        );
                        var t;
                      },
                      children: [
                        (0, jsxRuntime.jsxs)("div", {
                          className: "word-top",
                          children: [
                            (0, jsxRuntime.jsx)("div", {
                              className: "wordbook-name",
                              children: e.text,
                            }),
                            (0, jsxRuntime.jsxs)("div", {
                              className: "right-action",
                              children: [
                                (0, jsxRuntime.jsx)(WordActionButtons, {
                                  text: e.text,
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-action expand",
                                  children: (0, jsxRuntime.jsx)("div", {
                                    className: "t-icon icon-20",
                                    children: (0, jsxRuntime.jsx)(ja, {}),
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        m.includes(e.text) &&
                          (0, jsxRuntime.jsxs)("div", {
                            className: "word-detail",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: classNames()("rd-words-phonetic"),
                                children: (0, jsxRuntime.jsxs)("div", {
                                  className: "phonetic",
                                  onClick: (t) => {
                                    t.preventDefault(),
                                      t.stopPropagation(),
                                      l(e.text);
                                  },
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: classNames()("icon-voice", c),
                                      children: (0, jsxRuntime.jsx)("div", {
                                        className: "t-icon icon-16",
                                        children: (0, jsxRuntime.jsx)(Ma, {}),
                                      }),
                                    }),
                                    (0, jsxRuntime.jsxs)("span", {
                                      children: [" ", s(e.text, e)],
                                    }),
                                  ],
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "rd-words-translation",
                                children: o(e).map((e) =>
                                  (0, jsxRuntime.jsxs)("p", {
                                    className: classNames()(
                                      "rd-words-translation-item",
                                    ),
                                    children: [
                                      e.pos &&
                                        (0, jsxRuntime.jsx)("span", {
                                          className: "pos",
                                          children: e.pos,
                                        }),
                                      (0, jsxRuntime.jsx)("span", {
                                        children: e.terms.join(" "),
                                      }),
                                    ],
                                  }),
                                ),
                              }),
                              e.times &&
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "rd-words-times",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "t-icon icon-12",
                                      children: (0, jsxRuntime.jsx)(za, {}),
                                    }),
                                    (0, jsxRuntime.jsx)("span", {
                                      className: "mg-1",
                                      children: e.times,
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "tips",
                                      children: a("rd_words_times"),
                                    }),
                                  ],
                                }),
                            ],
                          }),
                      ],
                    }),
                  ),
                }),
              }),
            ],
          }),
        ],
      })
    );
  };

  return WordDetailPanel;
}
