/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverHighlightSiteRulesSettings(dependencies) {
  const Ca = dependencies.Ca;
  const Ci = dependencies.Ci;
  const En = dependencies.En;
  const Fi = dependencies.Fi;
  const Gi = dependencies.Gi;
  const Ki = dependencies.Ki;
  const React = dependencies.React;
  const _a = dependencies._a;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const fn = dependencies.fn;
  const fx = dependencies.fx;
  const gn = dependencies.gn;
  const gx = dependencies.gx;
  const hn = dependencies.hn;
  const jsxRuntime = dependencies.jsxRuntime;
  const ki = dependencies.ki;
  const mn = dependencies.mn;
  const mx = dependencies.mx;
  const pa = dependencies.pa;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const vn = dependencies.vn;

  const HighlightSiteRulesSettings = () => {
    var e;
    const { setting: t, edreader: n } = useAppSelector((e) => e),
      { navigate: r, ArrowIcon: i } = useSliderNavigation(),
      { locale: a } = useLocale(),
      { dispatch: o } = useDispatchBridge(),
      s = null != (e = t.wordHighlightMode) ? e : "blacklist",
      l = n.wordHighlight,
      c = (0, React.useMemo)(() => {
        var e;
        return null != (e = t.blacklist) ? e : [];
      }, [t.blacklist]),
      u = (0, React.useMemo)(() => {
        var e;
        return null != (e = t.wordHighlightWhitelist) ? e : [];
      }, [t.wordHighlightWhitelist]),
      d = "whitelist" === s ? u : c,
      [_, p] = (0, React.useState)(""),
      [h, m] = (0, React.useState)(""),
      g = (e) =>
        mx(null, null, function* () {
          e !== s &&
            (extensionClient.track({
              name: "highlight_sitelist_mode",
              event_value: e,
            }),
            yield o(gn(e)),
            p(""),
            m(""),
            extensionClient.rehighlight());
        }),
      f = () =>
        mx(null, null, function* () {
          const e = fx(_);
          e
            ? gx.test(e)
              ? d.some((t) => fx(t.host) === e)
                ? m(a("highlight_sitelist_error_exists"))
                : ("whitelist" === s
                    ? yield o(
                        fn({
                          host: e,
                        }),
                      )
                    : yield o(
                        hn({
                          host: e,
                        }),
                      ),
                  extensionClient.track({
                    name: "highlight_sitelist_add",
                    event_value: `${s}:${e}`,
                  }),
                  p(""),
                  m(""),
                  extensionClient.rehighlight())
              : m(a("highlight_sitelist_error_invalid"))
            : m(a("highlight_sitelist_error_empty"));
        });
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside rd-slider-my",
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
                  children: (0, jsxRuntime.jsx)(i, {}),
                }),
              }),
              (0, jsxRuntime.jsx)("span", {
                children: a("my_highlight_title"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content highlight-sitelist-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "tips",
              children: a("highlight_sitelist_intro"),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "item-slider-group",
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "item-slider",
                  onClick: () =>
                    mx(null, null, function* () {
                      extensionClient.track({
                        name: "highlight_master_toggle",
                        event_value: l ? "off" : "on",
                      }),
                        yield o(En(!l)),
                        extensionClient.rehighlight();
                    }),
                  children: (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-content",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-left",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "t-icon icon-20",
                            children: (0, jsxRuntime.jsx)(pa, {}),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: a("highlight_enable"),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "right-action",
                        children: (0, jsxRuntime.jsx)("input", {
                          type: "checkbox",
                          className: "rd-switch",
                          checked: l,
                          readOnly: !0,
                        }),
                      }),
                    ],
                  }),
                }),
                (0, jsxRuntime.jsx)("div", {
                  className: "item-slider pointer",
                  onClick: () => r("/setting/highlight-mode"),
                  children: (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-content",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-left",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "t-icon icon-20",
                            children: (0, jsxRuntime.jsx)(_a, {}),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: a("rd_words_highlight"),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-right",
                        children: [
                          (0, jsxRuntime.jsx)("span", {
                            children: a(
                              `rd_words_highlight_${n.highlight.mode}`,
                            ),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "t-icon icon-16",
                            children: (0, jsxRuntime.jsx)(Ca, {}),
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
            l &&
              (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "slider-label lg-label",
                    children: a("highlight_rule_entry"),
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "immersive-mode-selector",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()(
                          "immersive-mode-selector-item",
                          {
                            selected: "blacklist" === s,
                          },
                        ),
                        onClick: () => g("blacklist"),
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "immersive-mode-selector-item-content",
                            children: [
                              (0, jsxRuntime.jsxs)("div", {
                                className: "immersive-mode-selector-item-title",
                                children: [
                                  a("highlight_mode_blacklist"),
                                  " (",
                                  c.length,
                                  ")",
                                ],
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "t-icon icon-16",
                                children: [
                                  (0, jsxRuntime.jsx)(Ci, {}),
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "item-slider-tips",
                                    children: a(
                                      "highlight_mode_blacklist_tips",
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "immersive-mode-selector-item-check",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: classNames()("t-icon icon-18", {
                                selected: "blacklist" === s,
                              }),
                              children:
                                "blacklist" === s
                                  ? (0, jsxRuntime.jsx)(Ki, {})
                                  : (0, jsxRuntime.jsx)(Gi, {}),
                            }),
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()(
                          "immersive-mode-selector-item",
                          {
                            selected: "whitelist" === s,
                          },
                        ),
                        onClick: () => g("whitelist"),
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "immersive-mode-selector-item-content",
                            children: [
                              (0, jsxRuntime.jsxs)("div", {
                                className: "immersive-mode-selector-item-title",
                                children: [
                                  a("highlight_mode_whitelist"),
                                  " (",
                                  u.length,
                                  ")",
                                ],
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "t-icon icon-16",
                                children: [
                                  (0, jsxRuntime.jsx)(Ci, {}),
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "item-slider-tips",
                                    children: a(
                                      "highlight_mode_whitelist_tips",
                                    ),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "immersive-mode-selector-item-check",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: classNames()("t-icon icon-18", {
                                selected: "whitelist" === s,
                              }),
                              children:
                                "whitelist" === s
                                  ? (0, jsxRuntime.jsx)(Ki, {})
                                  : (0, jsxRuntime.jsx)(Gi, {}),
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-input-group",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-input",
                        children: [
                          (0, jsxRuntime.jsx)("input", {
                            type: "text",
                            className: "rd-input",
                            placeholder: a(
                              "highlight_sitelist_input_placeholder",
                            ),
                            value: _,
                            onChange: (e) => {
                              p(e.target.value), m("");
                            },
                            onKeyDown: (e) => {
                              ("Enter" !== e.key && "Enter" !== e.code) || f();
                            },
                          }),
                          (0, jsxRuntime.jsx)("button", {
                            className: "rd-button",
                            onClick: f,
                            children: a("highlight_sitelist_add_button"),
                          }),
                        ],
                      }),
                      h &&
                        (0, jsxRuntime.jsx)("div", {
                          className: "input-error-message",
                          children: h,
                        }),
                    ],
                  }),
                  0 === d.length &&
                    (0, jsxRuntime.jsxs)("div", {
                      className: "no-float-data",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-20",
                          children: (0, jsxRuntime.jsx)(ki, {}),
                        }),
                        (0, jsxRuntime.jsx)("span", {
                          children: a("highlight_sitelist_empty"),
                        }),
                      ],
                    }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider-group",
                    children: d.map((e) =>
                      (0, jsxRuntime.jsx)(
                        "div",
                        {
                          className: "item-slider",
                          children: (0, jsxRuntime.jsxs)("div", {
                            className: "item-slider-content",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-left",
                                children: (0, jsxRuntime.jsx)("span", {
                                  children: e.host,
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-right black-list-action",
                                onClick: () => {
                                  return (
                                    (t = e.host),
                                    mx(null, null, function* () {
                                      "whitelist" === s
                                        ? yield o(
                                            vn({
                                              host: t,
                                            }),
                                          )
                                        : yield o(
                                            mn({
                                              host: t,
                                            }),
                                          ),
                                        extensionClient.track({
                                          name: "highlight_sitelist_remove",
                                          event_value: `${s}:${t}`,
                                        }),
                                        extensionClient.rehighlight();
                                    })
                                  );
                                  var t;
                                },
                                children: (0, jsxRuntime.jsx)("div", {
                                  className: "t-icon icon-16",
                                  children: (0, jsxRuntime.jsx)(Fi, {}),
                                }),
                              }),
                            ],
                          }),
                        },
                        e.host,
                      ),
                    ),
                  }),
                ],
              }),
          ],
        }),
      ],
    });
  };

  return HighlightSiteRulesSettings;
}
