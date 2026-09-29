/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverImmersiveTranslationSettings(dependencies) {
  const Bn = dependencies.Bn;
  const Ca = dependencies.Ca;
  const Ci = dependencies.Ci;
  const Dn = dependencies.Dn;
  const Gi = dependencies.Gi;
  const In = dependencies.In;
  const Ki = dependencies.Ki;
  const Ln = dependencies.Ln;
  const Mn = dependencies.Mn;
  const React = dependencies.React;
  const Rn = dependencies.Rn;
  const _a = dependencies._a;
  const aa = dependencies.aa;
  const bx = dependencies.bx;
  const classNames = dependencies.classNames;
  const detectBrowser = dependencies.detectBrowser;
  const extensionClient = dependencies.extensionClient;
  const fa = dependencies.fa;
  const ga = dependencies.ga;
  const jsxRuntime = dependencies.jsxRuntime;
  const ka = dependencies.ka;
  const kn = dependencies.kn;
  const matchesUrlRule = dependencies.matchesUrlRule;
  const qi = dependencies.qi;
  const qn = dependencies.qn;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const yT = dependencies.yT;
  const zn = dependencies.zn;

  const ImmersiveTranslationSettings = () => {
    var e;
    const {
        edreader: t,
        translatorService: n,
        lastRulesUpdateAt: r,
      } = useAppSelector((e) => e),
      { navigate: i, ArrowIcon: a } = useSliderNavigation(),
      { locale: o } = useLocale(),
      [s, l] = (0, React.useState)(!1),
      { dispatch: c } = useDispatchBridge(),
      u = useApiClient(!0),
      [d, _] = (0, React.useState)(!1),
      [p, h] = (0, React.useState)(!1),
      [m, g] = (0, React.useState)(0),
      f = t.fulltext.styles[t.fulltext.styleMode],
      v = window.location.href,
      b =
        "file:" === window.location.protocol
          ? `file://${window.location.pathname.replace(/\/[^/]*$/, "")}/*`
          : window.location.hostname,
      y = ((e, t) => {
        if (t && 0 !== t.length) return t.find((t) => matchesUrlRule(e, t));
      })(v, (null == (e = t.fulltext) ? void 0 : e.whitelist) || []),
      x = !!y,
      w = (e) =>
        bx(null, null, function* () {
          t.fulltext.mode !== e &&
            (yield c(kn(e)),
            extensionClient.emit("forward", ["background"], {
              name: "fulltext-translation-reload",
              body: {
                mode: e,
              },
            }),
            extensionClient.track({
              name: `fulltext_setting_mode_change_${e}`,
            }));
        }),
      [k, T] = (0, React.useState)({});
    return (
      (0, React.useEffect)(() => {
        const e = {};
        switch (!0) {
          case "alpha" === t.fulltext.styleMode:
            f.fontOpacity && (e.opacity = (f.fontOpacity / 100).toFixed(2));
          case "underline" === t.fulltext.styleMode:
            f.borderStyle &&
              (e.textDecoration = `underline ${f.borderStyle}${f.borderColor ? " " + f.borderColor : ""}`),
              (e.textUnderlineOffset = "2px");
          case "background" === t.fulltext.styleMode:
            f.backgroundColor && (e.backgroundColor = f.backgroundColor);
          case "quote" === t.fulltext.styleMode:
            f.quoteBorderWidth && (e.borderWidth = `${f.quoteBorderWidth}px`),
              f.quoteBorderColor && (e.borderColor = f.quoteBorderColor);
          default:
            f.fontColor && (e.color = f.fontColor),
              f.fontSize &&
                (e.fontSize = Math.round((14 * f.fontSize) / 100) + "px"),
              f.italic && (e.fontStyle = "italic"),
              f.bold && (e.fontWeight = "bold");
        }
        T(e);
      }, [t.fulltext]),
      (0, React.useEffect)(() => {
        ((e = !1) => {
          bx(null, null, function* () {
            if (!e) {
              const e = r || 0;
              if (Date.now() - e < 864e5) return;
            }
            const { message: t, data: n } = yield u.getRules();
            "ok" === t && c(In(n));
          });
        })(!0);
      }, []),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside",
        id: "trancy-slider",
        onClick: () => {
          l(!1), h(!1), g(m + 1);
        },
        children: [
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-nav",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "nav-left",
                onClick: () => i(-1),
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "btn-slider-back",
                    children: (0, jsxRuntime.jsx)("div", {
                      className: "t-icon icon-18",
                      children: (0, jsxRuntime.jsx)(a, {}),
                    }),
                  }),
                  (0, jsxRuntime.jsx)("span", {
                    children: o("rd_immersive_translate"),
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
                      children: o("rd_manual"),
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
                children: o("rd_immersive_translate_tips"),
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "slider-label lg-label",
                children: o("rd_immersive_translate_label_start"),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "item-slider-group",
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider pointer",
                    onClick: () => {
                      extensionClient.track({
                        name: "setting_immersive_translate_start_shortcut",
                      });
                      const e = detectBrowser();
                      i(
                        "Safari" === e
                          ? "/setting/shortcuts-safari"
                          : "/setting/shortcuts",
                      );
                    },
                    children: (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: o("rd_immersive_start_method_1"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("div", {
                            className: "right-link",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: "t-icon icon-14",
                              children: (0, jsxRuntime.jsx)(Ca, {}),
                            }),
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
                        (0, jsxRuntime.jsxs)("div", {
                          className: "item-left",
                          children: [
                            (0, jsxRuntime.jsx)("span", {
                              children: o("rd_immersive_start_method_2"),
                            }),
                            (0, jsxRuntime.jsxs)("div", {
                              className: "t-icon icon-16",
                              children: [
                                (0, jsxRuntime.jsx)(Ci, {}),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-slider-tips",
                                  children: o(
                                    "rd_immersive_translate_start_2_des",
                                  ),
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "right-action",
                          onClick: () => {
                            c(Rn(!t.fulltext.rightkey)),
                              extensionClient.rebuildContextMenus(!0),
                              extensionClient.track({
                                name: "setting_immersive_translate_start_rightkey",
                              });
                          },
                          children: (0, jsxRuntime.jsx)("input", {
                            type: "checkbox",
                            className: "rd-switch",
                            checked: t.fulltext.rightkey,
                          }),
                        }),
                      ],
                    }),
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider",
                    onClick: (e) => {
                      e.stopPropagation(), l(!s);
                    },
                    children: (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsxs)("div", {
                          className: "item-left",
                          children: [
                            (0, jsxRuntime.jsx)("span", {
                              children: o("rd_immersive_start_method_3"),
                            }),
                            (0, jsxRuntime.jsxs)("div", {
                              className: "t-icon icon-16",
                              children: [
                                (0, jsxRuntime.jsx)(Ci, {}),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-slider-tips",
                                  children: o("rd_hover_immersive_des"),
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, jsxRuntime.jsxs)("div", {
                          className: "item-right",
                          children: [
                            (0, jsxRuntime.jsxs)("div", {
                              className: "value-select",
                              children: [
                                (0, jsxRuntime.jsx)("span", {
                                  children: o(
                                    `rd_hover_${t.fulltext.hotkey || "shift"}`,
                                  ),
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "t-icon icon-14",
                                  children: (0, jsxRuntime.jsx)(ka, {}),
                                }),
                              ],
                            }),
                            s &&
                              (0, jsxRuntime.jsx)("div", {
                                className: "dropdown-menu",
                                children: ["shift", "ctrl", "alt", "none"].map(
                                  (e) =>
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "items",
                                      onClick: (t) => {
                                        t.stopPropagation(),
                                          c(zn(e)),
                                          l(!1),
                                          extensionClient.track({
                                            name: "immersive_style_hotkey_change",
                                            event_value: e,
                                          });
                                      },
                                      children: o(`rd_hover_${e}`),
                                    }),
                                ),
                              }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "slider-label lg-label",
                children: o("fulltext_whitelist_title"),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "item-slider-group",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: o("fulltext_whitelist_current_site"),
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "right-action",
                            onClick: () => {
                              x && y
                                ? (c(Dn(y)),
                                  extensionClient.track({
                                    name: "fulltext_setting_whitelist_remove",
                                    event_value: y,
                                  }))
                                : (c(Bn(b)),
                                  extensionClient.track({
                                    name: "fulltext_setting_whitelist_add",
                                    event_value: b,
                                  }));
                            },
                            children: (0, jsxRuntime.jsx)("input", {
                              type: "checkbox",
                              className: "rd-switch",
                              checked: x,
                            }),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-des",
                        children: b,
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider pointer",
                    onClick: () => {
                      extensionClient.track({
                        name: "setting_immersive_translate_whitelist",
                      }),
                        i("/setting/fulltext-whitelist");
                    },
                    children: (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsxs)("div", {
                          className: "item-left",
                          children: [
                            (0, jsxRuntime.jsx)("span", {
                              children: o("fulltext_whitelist_manage"),
                            }),
                            (0, jsxRuntime.jsxs)("div", {
                              className: "t-icon icon-16",
                              children: [
                                (0, jsxRuntime.jsx)(Ci, {}),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-slider-tips",
                                  children: o("fulltext_whitelist_manage_tips"),
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("div", {
                            className: "right-link",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: "t-icon icon-14",
                              children: (0, jsxRuntime.jsx)(Ca, {}),
                            }),
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "slider-label lg-label",
                children: o("rd_immersive_translate_mode"),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "immersive-mode-selector",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: classNames()("immersive-mode-selector-item", {
                      selected: "dual" === t.fulltext.mode,
                    }),
                    onClick: () => w("dual"),
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "immersive-mode-selector-item-icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-20",
                          children: (0, jsxRuntime.jsx)(ga, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "immersive-mode-selector-item-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "immersive-mode-selector-item-title",
                            children: o("immersive_toolbar_dual"),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "t-icon icon-16",
                            children: [
                              (0, jsxRuntime.jsx)(Ci, {}),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-slider-tips",
                                children: o("immersive_mode_dual_desc"),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "immersive-mode-selector-item-check",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: classNames()("t-icon icon-18", {
                            selected: "dual" === t.fulltext.mode,
                          }),
                          children:
                            "dual" === t.fulltext.mode
                              ? (0, jsxRuntime.jsx)(Ki, {})
                              : (0, jsxRuntime.jsx)(Gi, {}),
                        }),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: classNames()("immersive-mode-selector-item", {
                      selected: "translation" === t.fulltext.mode,
                    }),
                    onClick: () => w("translation"),
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "immersive-mode-selector-item-icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-20",
                          children: (0, jsxRuntime.jsx)(fa, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "immersive-mode-selector-item-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "immersive-mode-selector-item-title",
                            children: o("immersive_toolbar_translation"),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "t-icon icon-16",
                            children: [
                              (0, jsxRuntime.jsx)(Ci, {}),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-slider-tips",
                                children: o("immersive_mode_translation_desc"),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "immersive-mode-selector-item-check",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: classNames()("t-icon icon-18", {
                            selected: "translation" === t.fulltext.mode,
                          }),
                          children:
                            "translation" === t.fulltext.mode
                              ? (0, jsxRuntime.jsx)(Ki, {})
                              : (0, jsxRuntime.jsx)(Gi, {}),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "slider-label lg-label",
                children: o("rd_immersive_label_style"),
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "immersive-style-selector",
                children: ["alpha", "underline", "quote", "background"].map(
                  (e) =>
                    (0, jsxRuntime.jsxs)("div", {
                      className: classNames()("immersive-style-selector-item", {
                        selected: t.fulltext.styleMode === e,
                      }),
                      onClick: () => {
                        c(Ln(e)),
                          extensionClient.track({
                            name: "immersive_style_change",
                            event_value: e,
                          });
                      },
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "immersive-style-selector-item-value",
                          children: o(`immersive_style_${e}`),
                        }),
                        t.fulltext.styleMode === e
                          ? (0, jsxRuntime.jsx)(Ki, {})
                          : (0, jsxRuntime.jsx)(Gi, {}),
                      ],
                    }),
                ),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "item-slider-preview highlight",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "preview-title",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "t-icon icon-18 anchor",
                        children: (0, jsxRuntime.jsx)(_a, {}),
                      }),
                      (0, jsxRuntime.jsx)("span", {
                        children: o("rd_preview_title"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "origin",
                    children:
                      "Do you want to spend the rest of your life selling sugared water or do you want a chance to change the world\uff1f",
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: classNames()(
                      "translation",
                      t.fulltext.styleMode,
                    ),
                    style: k,
                    children: o("rd_preview_translation"),
                  }),
                ],
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "btn-show-more",
                onClick: () => {
                  extensionClient.track({
                    name: "immersive_style_expand",
                    event_value: d ? "close" : "open",
                  }),
                    _(!d);
                },
                children: [
                  (0, jsxRuntime.jsx)("span", {
                    children: o("immersive_style_expand_btn"),
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-16",
                    style: {
                      transform: d ? "rotate(180deg)" : "rotate(0deg)",
                    },
                    children: (0, jsxRuntime.jsx)(ka, {}),
                  }),
                ],
              }),
              d &&
                (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                  children: [
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
                                  children: o("immersive_style_font_size"),
                                }),
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "item-right",
                                children: [
                                  (0, jsxRuntime.jsx)("label", {
                                    className: "slider-range-value",
                                    children: f.fontSize,
                                  }),
                                  (0, jsxRuntime.jsxs)("div", {
                                    className: "slider-range",
                                    children: [
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "slider-range-track",
                                        style: {
                                          width: (f.fontSize || 100) - 50 + "%",
                                        },
                                      }),
                                      (0, jsxRuntime.jsx)("input", {
                                        className: "slider-range-thumb",
                                        type: "range",
                                        step: 10,
                                        min: 50,
                                        max: 150,
                                        onChange: (e) => {
                                          c(
                                            qn({
                                              styleMode: t.fulltext.styleMode,
                                              styles: {
                                                fontSize: parseInt(
                                                  e.target.value,
                                                ),
                                              },
                                            }),
                                          ),
                                            extensionClient.track({
                                              name: "setting_immersive_translate_style_font_size",
                                            });
                                        },
                                        value: f.fontSize,
                                      }),
                                    ],
                                  }),
                                ],
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
                                  children: o("immersive_style_italic"),
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-right",
                                onClick: () => {
                                  c(
                                    qn({
                                      styleMode: t.fulltext.styleMode,
                                      styles: {
                                        italic: !f.italic,
                                      },
                                    }),
                                  ),
                                    extensionClient.track({
                                      name: "setting_immersive_translate_style_italic",
                                      event_value: !f.italic,
                                    });
                                },
                                children: (0, jsxRuntime.jsx)("input", {
                                  type: "checkbox",
                                  className: "rd-switch",
                                  checked: f.italic,
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
                                  children: o("immersive_style_bold"),
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-right",
                                onClick: () => {
                                  c(
                                    qn({
                                      styleMode: t.fulltext.styleMode,
                                      styles: {
                                        bold: !f.bold,
                                      },
                                    }),
                                  ),
                                    extensionClient.track({
                                      name: "setting_immersive_translate_style_bold",
                                      event_value: !f.bold,
                                    });
                                },
                                children: (0, jsxRuntime.jsx)("input", {
                                  type: "checkbox",
                                  className: "rd-switch",
                                  checked: f.bold,
                                }),
                              }),
                            ],
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-slider fix-height",
                          children: (0, jsxRuntime.jsxs)("div", {
                            className: "item-slider-content",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-left",
                                children: (0, jsxRuntime.jsx)("span", {
                                  children: o("immersive_style_font_color"),
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-right",
                                onClick: (e) => {
                                  e.stopPropagation();
                                },
                                children: (0, jsxRuntime.jsx)(yT, {
                                  closeState: m,
                                  value: f.fontColor,
                                  onChangeComplete: (e) => {
                                    c(
                                      qn({
                                        styleMode: t.fulltext.styleMode,
                                        styles: {
                                          fontColor: e,
                                        },
                                      }),
                                    ),
                                      extensionClient.track({
                                        name: "setting_immersive_translate_style_font_color",
                                      });
                                  },
                                }),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    "alpha" === t.fulltext.styleMode &&
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
                                  children: o("immersive_style_alpha_opactity"),
                                }),
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "item-right",
                                children: [
                                  (0, jsxRuntime.jsx)("label", {
                                    className: "slider-range-value",
                                    children: f.fontOpacity,
                                  }),
                                  (0, jsxRuntime.jsxs)("div", {
                                    className: "slider-range",
                                    children: [
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "slider-range-track",
                                        style: {
                                          width: `${f.fontOpacity}%`,
                                        },
                                      }),
                                      (0, jsxRuntime.jsx)("input", {
                                        className: "slider-range-thumb",
                                        type: "range",
                                        step: 10,
                                        min: 10,
                                        max: 100,
                                        onChange: (e) => {
                                          c(
                                            qn({
                                              styleMode: t.fulltext.styleMode,
                                              styles: {
                                                fontOpacity: parseInt(
                                                  e.target.value,
                                                ),
                                              },
                                            }),
                                          ),
                                            extensionClient.track({
                                              name: "setting_immersive_translate_style_font_opacity",
                                            });
                                        },
                                        value: f.fontOpacity,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      }),
                    "underline" === t.fulltext.styleMode &&
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
                                    children: o(
                                      "immersive_style_underline_style",
                                    ),
                                  }),
                                }),
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "item-right",
                                  children: [
                                    (0, jsxRuntime.jsxs)("div", {
                                      className: "value-select",
                                      onClick: (e) => {
                                        e.stopPropagation(), h(!p);
                                      },
                                      children: [
                                        (0, jsxRuntime.jsx)("span", {
                                          children: o(
                                            `immersive_style_underline_${f.borderStyle}`,
                                          ),
                                        }),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "t-icon icon-14",
                                          children: (0, jsxRuntime.jsx)(ka, {}),
                                        }),
                                      ],
                                    }),
                                    p &&
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "dropdown-menu",
                                        children: [
                                          "solid",
                                          "dashed",
                                          "dotted",
                                          "wavy",
                                        ].map((e) =>
                                          (0, jsxRuntime.jsx)("div", {
                                            className: "items",
                                            onClick: (n) => {
                                              n.stopPropagation(),
                                                c(
                                                  qn({
                                                    styleMode:
                                                      t.fulltext.styleMode,
                                                    styles: {
                                                      borderStyle: e,
                                                    },
                                                  }),
                                                ),
                                                extensionClient.track({
                                                  name: "setting_immersive_translate_style_underline_style",
                                                  event_value: e,
                                                }),
                                                h(!1);
                                            },
                                            children: o(
                                              `immersive_style_underline_${e}`,
                                            ),
                                          }),
                                        ),
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-slider fix-height",
                            children: (0, jsxRuntime.jsxs)("div", {
                              className: "item-slider-content",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-left",
                                  children: (0, jsxRuntime.jsx)("span", {
                                    children: o(
                                      "immersive_style_underline_color",
                                    ),
                                  }),
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-right",
                                  onClick: (e) => {
                                    e.stopPropagation();
                                  },
                                  children: (0, jsxRuntime.jsx)(yT, {
                                    closeState: m,
                                    value: f.borderColor,
                                    onChangeComplete: (e) => {
                                      c(
                                        qn({
                                          styleMode: t.fulltext.styleMode,
                                          styles: {
                                            borderColor: e,
                                          },
                                        }),
                                      ),
                                        extensionClient.track({
                                          name: "setting_immersive_translate_style_underline_color",
                                        });
                                    },
                                  }),
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                    "quote" === t.fulltext.styleMode &&
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-group",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-slider fix-height",
                            children: (0, jsxRuntime.jsxs)("div", {
                              className: "item-slider-content",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-left",
                                  children: (0, jsxRuntime.jsx)("span", {
                                    children: o("immersive_style_quote_width"),
                                  }),
                                }),
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "item-right",
                                  children: [
                                    (0, jsxRuntime.jsx)("label", {
                                      className: "slider-range-value",
                                      children: f.quoteBorderWidth,
                                    }),
                                    (0, jsxRuntime.jsxs)("div", {
                                      className: "slider-range",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "slider-range-track",
                                          style: {
                                            width:
                                              10 * (f.quoteBorderWidth || 1) +
                                              "%",
                                          },
                                        }),
                                        (0, jsxRuntime.jsx)("input", {
                                          className: "slider-range-thumb",
                                          type: "range",
                                          step: 1,
                                          min: 1,
                                          max: 10,
                                          onChange: (e) => {
                                            c(
                                              qn({
                                                styleMode: t.fulltext.styleMode,
                                                styles: {
                                                  quoteBorderWidth: parseInt(
                                                    e.target.value,
                                                  ),
                                                },
                                              }),
                                            ),
                                              extensionClient.track({
                                                name: "setting_immersive_translate_style_quote_width",
                                              });
                                          },
                                          value: f.quoteBorderWidth,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-slider fix-height",
                            children: (0, jsxRuntime.jsxs)("div", {
                              className: "item-slider-content",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-left",
                                  children: (0, jsxRuntime.jsx)("span", {
                                    children: o("immersive_style_quote_color"),
                                  }),
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "item-right",
                                  onClick: (e) => {
                                    e.stopPropagation();
                                  },
                                  children: (0, jsxRuntime.jsx)(yT, {
                                    closeState: m,
                                    value: f.quoteBorderColor,
                                    onChangeComplete: (e) => {
                                      c(
                                        qn({
                                          styleMode: t.fulltext.styleMode,
                                          styles: {
                                            quoteBorderColor: e,
                                          },
                                        }),
                                      ),
                                        extensionClient.track({
                                          name: "setting_immersive_translate_style_quote_color",
                                        });
                                    },
                                  }),
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                    "background" === t.fulltext.styleMode &&
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-group",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "item-slider fix-height",
                          children: (0, jsxRuntime.jsxs)("div", {
                            className: "item-slider-content",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-left",
                                children: (0, jsxRuntime.jsx)("span", {
                                  children: o(
                                    "immersive_style_background_color",
                                  ),
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-right",
                                onClick: (e) => {
                                  e.stopPropagation();
                                },
                                children: (0, jsxRuntime.jsx)(yT, {
                                  closeState: m,
                                  value: f.backgroundColor,
                                  onChangeComplete: (e) => {
                                    c(
                                      qn({
                                        styleMode: t.fulltext.styleMode,
                                        styles: {
                                          backgroundColor: e,
                                        },
                                      }),
                                    ),
                                      extensionClient.track({
                                        name: "setting_immersive_translate_style_background_color",
                                      });
                                  },
                                }),
                              }),
                            ],
                          }),
                        }),
                      }),
                    (0, jsxRuntime.jsxs)("div", {
                      className: "btn-reset-style",
                      onClick: () => {
                        c(Mn(t.fulltext.styleMode)),
                          extensionClient.track({
                            name: "setting_immersive_translate_style_reset",
                          });
                      },
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-14",
                          children: (0, jsxRuntime.jsx)(qi, {}),
                        }),
                        (0, jsxRuntime.jsx)("span", {
                          children: o("rd_reset_immersive_style"),
                        }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
        ],
      })
    );
  };

  return ImmersiveTranslationSettings;
}
