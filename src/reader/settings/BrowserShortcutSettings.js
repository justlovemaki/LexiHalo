/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverBrowserShortcutSettings(dependencies) {
  const Ca = dependencies.Ca;
  const React = dependencies.React;
  const Ta = dependencies.Ta;
  const Tw = dependencies.Tw;
  const detectBrowser = dependencies.detectBrowser;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useToast = dependencies.useToast;

  const BrowserShortcutSettings = () => {
    const { navigate: e } = useSliderNavigation(),
      { locale: t } = useLocale(),
      { toast: n, Toast: r } = useToast(),
      [i, a] = (0, React.useState)([]),
      [o, s] = (0, React.useState)([]),
      [l, c] = (0, React.useState)([]),
      [u, d] = (0, React.useState)([]),
      [_, p] = (0, React.useState)([]),
      h = () =>
        Tw(null, null, function* () {
          var e, t, n, r, i, o, u, _, h, m;
          const { message: g, data: f } = yield extensionClient.getCommands();
          if ("ok" !== g) return;
          const v =
            navigator.userAgent.indexOf("Win") >= 0 ||
            navigator.userAgent.indexOf("Firefox") >= 0;
          {
            const n = f.find((e) => "toggle" === e.name);
            if (n) {
              const r = v
                ? null == (e = n.shortcut)
                  ? void 0
                  : e.split("+")
                : null == (t = n.shortcut)
                  ? void 0
                  : t.split("");
              a(r || []);
            }
          }
          {
            const e = f.find((e) => "fulltext-translate" === e.name);
            if (e) {
              const t = v
                ? null == (n = e.shortcut)
                  ? void 0
                  : n.split("+")
                : null == (r = e.shortcut)
                  ? void 0
                  : r.split("");
              (null == t ? void 0 : t.join("")) !== l.join("") &&
                extensionClient.rebuildContextMenus(!1),
                c(t || []);
            }
          }
          {
            const e = f.find((e) => "quick-translator" === e.name);
            if (e) {
              const t = v
                ? null == (i = e.shortcut)
                  ? void 0
                  : i.split("+")
                : null == (o = e.shortcut)
                  ? void 0
                  : o.split("");
              s(t || []);
            }
          }
          {
            const e = f.find((e) => "ai-transcribe" === e.name);
            if (e) {
              const t = v
                ? null == (u = e.shortcut)
                  ? void 0
                  : u.split("+")
                : null == (_ = e.shortcut)
                  ? void 0
                  : _.split("");
              d(t || []);
            }
          }
          {
            const e = f.find((e) => "caption-toggle" === e.name);
            if (e) {
              const t = v
                ? null == (h = e.shortcut)
                  ? void 0
                  : h.split("+")
                : null == (m = e.shortcut)
                  ? void 0
                  : m.split("");
              p(t || []);
            }
          }
        }),
      m = (0, React.useRef)(0),
      g = () => {
        let e;
        switch (detectBrowser()) {
          case "Chrome":
          case "Edge":
            e = "chrome://extensions/shortcuts";
            break;
          case "Firefox":
            e = "https://r.trancy.org/u/firefox-shortcuts";
            break;
          default:
            return void n.warning(t("shortcuts_unsupport_browser"));
        }
        e &&
          (extensionClient.emit("open", ["background"], {
            url: e,
          }),
          (() => {
            window.clearInterval(m.current);
            let e = 30;
            m.current = window.setInterval(
              () =>
                Tw(null, null, function* () {
                  yield h(), (e -= 1), e < 1 && clearInterval(m.current);
                }),
              2e3,
            );
          })());
      };
    return (
      (0, React.useEffect)(() => {
        h();
      }, []),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside",
        id: "trancy-slider",
        children: [
          (0, jsxRuntime.jsx)(r, {}),
          (0, jsxRuntime.jsx)("div", {
            className: "rd-slider-nav",
            children: (0, jsxRuntime.jsxs)("div", {
              className: "nav-left",
              onClick: () => e(-1),
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "btn-slider-back",
                  children: (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-18",
                    children: (0, jsxRuntime.jsx)(Ta, {}),
                  }),
                }),
                (0, jsxRuntime.jsx)("span", {
                  children: t("rd_shortcut_config_title"),
                }),
              ],
            }),
          }),
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-content",
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "tips",
                children: t("rd_shortcut_config_tips"),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "item-slider-group",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider pointer",
                    onClick: g,
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: t("shortcut_outside-caption"),
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "item-right",
                            children: [
                              (0, jsxRuntime.jsx)("span", {
                                children: _,
                              }),
                              _.length < 1 &&
                                (0, jsxRuntime.jsx)("span", {
                                  children: t("rd_shortcut_config_btn"),
                                }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(Ca, {}),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-des",
                        children: t("shortcut_outside-caption_des"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider pointer",
                    onClick: g,
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: t("shortcut_turnon_ai_sub"),
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "item-right",
                            children: [
                              (0, jsxRuntime.jsx)("span", {
                                children: u,
                              }),
                              u.length < 1 &&
                                (0, jsxRuntime.jsx)("span", {
                                  children: t("rd_shortcut_config_btn"),
                                }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(Ca, {}),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-des",
                        children: t("shortcut_turnon_ai_sub_des"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider pointer",
                    onClick: g,
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: t("shortcut_learning_mode"),
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "item-right",
                            children: [
                              (0, jsxRuntime.jsx)("span", {
                                children: i,
                              }),
                              i.length < 1 &&
                                (0, jsxRuntime.jsx)("span", {
                                  children: t("rd_shortcut_config_btn"),
                                }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(Ca, {}),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-des",
                        children: t("shortcut_learning_mode_des"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider pointer",
                    onClick: g,
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: t("shortcut_fulltext_translate"),
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "item-right",
                            children: [
                              (0, jsxRuntime.jsx)("span", {
                                children: l,
                              }),
                              l.length < 1 &&
                                (0, jsxRuntime.jsx)("span", {
                                  children: t("rd_shortcut_config_btn"),
                                }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(Ca, {}),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-des",
                        children: t("shortcut_fulltext_translate_des"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider pointer",
                    onClick: g,
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: t("shortcut_quick_translate"),
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "item-right",
                            children: [
                              (0, jsxRuntime.jsx)("span", {
                                children: o,
                              }),
                              o.length < 1 &&
                                (0, jsxRuntime.jsx)("span", {
                                  children: t("rd_shortcut_config_btn"),
                                }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(Ca, {}),
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-slider-des",
                        children: t("shortcut_quick_translate_des"),
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

  return BrowserShortcutSettings;
}
