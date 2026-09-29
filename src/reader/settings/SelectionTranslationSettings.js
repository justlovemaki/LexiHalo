/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverSelectionTranslationSettings(dependencies) {
  const Bt = dependencies.Bt;
  const Gi = dependencies.Gi;
  const Ki = dependencies.Ki;
  const Pn = dependencies.Pn;
  const Rt = dependencies.Rt;
  const Ta = dependencies.Ta;
  const Ui = dependencies.Ui;
  const aa = dependencies.aa;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const ix = dependencies.ix;
  const jsxRuntime = dependencies.jsxRuntime;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const wn = dependencies.wn;
  const yn = dependencies.yn;
  const zt = dependencies.zt;

  const SelectionTranslationSettings = () => {
    const { edreader: e, user: t } = useAppSelector((e) => ({
        edreader: e.edreader,
        user: e.user,
      })),
      { navigate: n } = useSliderNavigation(),
      { locale: r } = useLocale(),
      { dispatch: i } = useDispatchBridge();
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-nav",
          children: [
            (0, jsxRuntime.jsxs)("div", {
              className: "nav-left",
              onClick: () => n(-1),
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "btn-slider-back",
                  children: (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-18",
                    children: (0, jsxRuntime.jsx)(Ta, {}),
                  }),
                }),
                (0, jsxRuntime.jsx)("span", {
                  children: r("rd_translate_word"),
                }),
              ],
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "nav-right",
              children: (0, jsxRuntime.jsxs)("a", {
                href: "https://www.trancy.org/user-guide",
                target: "_blank",
                className: "btn-slider-link",
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-16",
                    children: (0, jsxRuntime.jsx)(aa, {}),
                  }),
                  (0, jsxRuntime.jsx)("span", {
                    children: r("rd_manual"),
                  }),
                ],
              }),
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "tips",
              children: r("rd_translate_word_tips"),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "item-slider-group",
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "item-slider",
                  children: (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-content",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-left",
                        children: (0, jsxRuntime.jsx)("span", {
                          children: r("rd_translate_word_toggle"),
                        }),
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-right",
                        onClick: () => {
                          i(Pn(!e.selectTranslate)),
                            extensionClient.track({
                              name: "setting_select_translate",
                              event_value: !e.selectTranslate,
                            });
                        },
                        children: (0, jsxRuntime.jsx)("input", {
                          type: "checkbox",
                          className: "rd-switch",
                          checked: e.selectTranslate,
                        }),
                      }),
                    ],
                  }),
                }),
                (0, jsxRuntime.jsx)("div", {
                  className: "item-slider",
                  children: (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-content",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-left",
                        children: (0, jsxRuntime.jsx)("span", {
                          children: r("selectAutoSpeech"),
                        }),
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-right",
                        onClick: () => {
                          i(wn(!e.selectAutoSpeech)),
                            extensionClient.track({
                              name: "setting_select_auto_speech",
                              event_value: !e.selectAutoSpeech,
                            });
                        },
                        children: (0, jsxRuntime.jsx)("input", {
                          type: "checkbox",
                          className: "rd-switch",
                          checked: e.selectAutoSpeech,
                        }),
                      }),
                    ],
                  }),
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: r("clickHighlight"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          onClick: () => {
                            i(Bt(!e.hoverHighlight)),
                              extensionClient.track({
                                name: "setting_select_hover_highlight",
                                event_value: !e.hoverHighlight,
                              });
                          },
                          children: (0, jsxRuntime.jsx)("input", {
                            type: "checkbox",
                            className: "rd-switch",
                            checked: e.hoverHighlight,
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: r("clickHighlightTips"),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: r("selectAutoStar"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          onClick: () => {
                            i(zt(!e.selectAutoStar)),
                              extensionClient.track({
                                name: "setting_select_auto_star",
                                event_value: !e.selectAutoStar,
                              });
                          },
                          children: (0, jsxRuntime.jsx)("input", {
                            type: "checkbox",
                            className: "rd-switch",
                            checked: e.selectAutoStar,
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: r("selectAutoStarTips"),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsxs)("div", {
                          className: "item-left",
                          children: [
                            (0, jsxRuntime.jsxs)("span", {
                              children: ["AI ", r("ai_def")],
                            }),
                            (0, jsxRuntime.jsx)("div", {
                              className: "new-tag",
                              children: "NEW",
                            }),
                          ],
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          onClick: () => {
                            extensionClient.track({
                              name: "setting_select_auto_explain",
                              event_value: !e.selectAutoExplain,
                            }),
                              i(Rt(!e.selectAutoExplain));
                          },
                          children: (0, jsxRuntime.jsx)("input", {
                            type: "checkbox",
                            className: "rd-switch",
                            checked: e.selectAutoExplain,
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: r("ai_def_desc"),
                    }),
                  ],
                }),
              ],
            }),
            e.selectTranslate &&
              (0, jsxRuntime.jsx)("div", {
                className: "item-slider-group",
                children: ix.map((t) =>
                  (0, jsxRuntime.jsxs)("div", {
                    className: classNames()("item-slider pointer", {
                      selected: t === e.selectionMode,
                    }),
                    onClick: () => {
                      extensionClient.track({
                        name: "setting_selection_mode_select",
                        event_value: t,
                      }),
                        ((e) => {
                          const t = yn(e);
                          i(t);
                        })(t);
                    },
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: r(`rd_translate_word_${t}`),
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-right",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: "right-check",
                              children: (0, jsxRuntime.jsx)("div", {
                                className: classNames()("t-icon icon-18", {
                                  solid: t === e.selectionMode,
                                }),
                                children:
                                  t === e.selectionMode
                                    ? (0, jsxRuntime.jsx)(Ki, {})
                                    : (0, jsxRuntime.jsx)(Gi, {}),
                              }),
                            }),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-des",
                        children: [" ", r(`rd_translate_word_des_${t}`)],
                      }),
                    ],
                  }),
                ),
              }),
            null,
            (0, jsxRuntime.jsxs)("div", {
              className: "bottom-tips",
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-18 anchor",
                  children: (0, jsxRuntime.jsx)(Ui, {}),
                }),
                (0, jsxRuntime.jsxs)("p", {
                  children: ["1. ", r("hightlight_disable_tips1")],
                }),
                (0, jsxRuntime.jsxs)("p", {
                  children: ["2. ", r("hightlight_disable_tips2")],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  return SelectionTranslationSettings;
}
