/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverWordHighlightStyleSettings(dependencies) {
  const Cn = dependencies.Cn;
  const Gi = dependencies.Gi;
  const Ki = dependencies.Ki;
  const React = dependencies.React;
  const Sn = dependencies.Sn;
  const Ta = dependencies.Ta;
  const Zi = dependencies.Zi;
  const _x = dependencies._x;
  const classNames = dependencies.classNames;
  const dx = dependencies.dx;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const px = dependencies.px;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const WordHighlightStyleSettings = () => {
    const {
        edreader: e,
        user: t,
        setting: n,
      } = useAppSelector((e) => ({
        edreader: e.edreader,
        user: e.user,
        setting: e.setting,
      })),
      { navigate: r } = useSliderNavigation(),
      { locale: i } = useLocale(),
      { dispatch: a } = useDispatchBridge(),
      o = dx(
        dx(
          dx(
            {},
            "underline" === e.highlight.mode
              ? {
                  borderBottom: `1px dashed ${e.highlight.color}`,
                }
              : {},
          ),
          "blend" === e.highlight.mode
            ? {
                opacity: 0.5,
              }
            : {},
        ),
        "highlight" === e.highlight.mode
          ? {
              color: e.highlight.color,
            }
          : {},
      );
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
                children: i("rd_words_highlight"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "tips",
              children: i("highlight_tips"),
            }),
            (0, jsxRuntime.jsxs)(React.Fragment, {
              children: [
                (0, jsxRuntime.jsxs)("div", {
                  className: classNames()(
                    "item-slider-preview",
                    e.highlight.mode,
                  ),
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "preview-title",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-18 anchor",
                          children: (0, jsxRuntime.jsx)(Zi, {}),
                        }),
                        (0, jsxRuntime.jsx)("span", {
                          children: i("rd_preview_title"),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsxs)("div", {
                      className: "preview-content",
                      children: [
                        "People work better when they know what the goal is and why. It is",
                        (0, jsxRuntime.jsx)("span", {
                          style: o,
                          className: classNames()(e.highlight.mode),
                          children: "important",
                        }),
                        (0, jsxRuntime.jsxs)("span", {
                          className: "anno-content",
                          children: ["adj.", i("annotation_content")],
                        }),
                        "that people look forward to coming to work in the morning and enjoy working.",
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)("div", {
                  className: "item-slider-group",
                  children: px.map((t) =>
                    (0, jsxRuntime.jsxs)("div", {
                      className: classNames()("item-slider pointer", {
                        selected: t === e.highlight.mode,
                      }),
                      onClick: () => {
                        extensionClient.track({
                          name: "wordlist_highlight_mode_change",
                          event_value: t,
                        }),
                          ((e) => {
                            _x(null, null, function* () {
                              yield a(Cn(e)), extensionClient.rehighlight();
                            });
                          })(t);
                      },
                      children: [
                        (0, jsxRuntime.jsxs)("div", {
                          className: "item-slider-content",
                          children: [
                            (0, jsxRuntime.jsxs)("div", {
                              className: "item-left",
                              children: [
                                (0, jsxRuntime.jsx)("span", {
                                  children: i(`rd_words_highlight_${t}`),
                                }),
                                "anotation" === t &&
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "new-tag",
                                    children: "NEW",
                                  }),
                              ],
                            }),
                            (0, jsxRuntime.jsx)("div", {
                              className: "item-right",
                              children: (0, jsxRuntime.jsx)("div", {
                                className: "right-check",
                                children: (0, jsxRuntime.jsx)("div", {
                                  className: classNames()("t-icon icon-18", {
                                    solid: t === e.highlight.mode,
                                  }),
                                  children:
                                    t === e.highlight.mode
                                      ? (0, jsxRuntime.jsx)(Ki, {})
                                      : (0, jsxRuntime.jsx)(Gi, {}),
                                }),
                              }),
                            }),
                          ],
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-slider-des",
                          children: i(`rd_words_highlight_des_${t}`),
                        }),
                      ],
                    }),
                  ),
                }),
                ["highlight", "underline"].includes(e.highlight.mode) &&
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider-group",
                    children: (0, jsxRuntime.jsx)("div", {
                      className: "item-slider",
                      children: (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: i("rd_words_highlight_label"),
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-right",
                            children: (0, jsxRuntime.jsx)("input", {
                              className: "rd-input-color",
                              type: "color",
                              value: e.highlight.color,
                              onChange: (e) => {
                                extensionClient.track({
                                  name: "wordlist_highlight_color_change",
                                  event_value: e.target.value,
                                }),
                                  ((e) => {
                                    _x(null, null, function* () {
                                      yield a(Sn(e)),
                                        extensionClient.rehighlight();
                                    });
                                  })(e.target.value);
                              },
                            }),
                          }),
                        ],
                      }),
                    }),
                  }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  return WordHighlightStyleSettings;
}
