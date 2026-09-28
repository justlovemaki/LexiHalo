/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverFulltextWhitelistPage(dependencies) {
  const Bn = dependencies.Bn;
  const Dn = dependencies.Dn;
  const Fi = dependencies.Fi;
  const React = dependencies.React;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const ki = dependencies.ki;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const FulltextWhitelistPage = () => {
    var e, t, n, r, i, a;
    const { edreader: o } = useAppSelector((e) => e),
      { navigate: s, ArrowIcon: l } = useSliderNavigation(),
      { locale: c } = useLocale(),
      { dispatch: u } = useDispatchBridge(),
      [d, _] = (0, React.useState)(""),
      [p, h] = (0, React.useState)(""),
      m = () => {
        var e, t;
        const n = d.trim();
        if (!n) return void h(c("fulltext_whitelist_error_empty"));
        const r =
          /^(\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})?(\/[^\s]*)?$/;
        let i = !1;
        if (/^(https?|file):\/\//.test(n))
          try {
            new URL(n), (i = !0);
          } catch (e) {
            i = !1;
          }
        else i = r.test(n);
        i
          ? (
              null == (t = null == (e = o.fulltext) ? void 0 : e.whitelist)
                ? void 0
                : t.includes(n)
            )
            ? h(c("fulltext_whitelist_error_exists"))
            : (u(Bn(n)),
              _(""),
              h(""),
              extensionClient.track({
                name: "fulltext_whitelist_add",
                event_value: n,
              }))
          : h(c("fulltext_whitelist_error_invalid"));
      };
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside fulltext-whitelist-page",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-nav",
          children: (0, jsxRuntime.jsxs)("div", {
            className: "nav-left",
            onClick: () => s(-1),
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "btn-slider-back",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-18",
                  children: (0, jsxRuntime.jsx)(l, {}),
                }),
              }),
              (0, jsxRuntime.jsx)("span", {
                children: c("fulltext_whitelist_manage_label"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "tips",
              children: c("fulltext_whitelist_manage_tips"),
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
                      placeholder: c("fulltext_whitelist_input_placeholder"),
                      value: d,
                      onChange: (e) => {
                        _(e.target.value), h("");
                      },
                      onKeyDown: (e) => {
                        ("Enter" !== e.key && "Enter" !== e.code) || m();
                      },
                    }),
                    (0, jsxRuntime.jsx)("button", {
                      className: "rd-button",
                      onClick: m,
                      children: c("fulltext_whitelist_add_button"),
                    }),
                  ],
                }),
                p &&
                  (0, jsxRuntime.jsx)("div", {
                    className: "input-error-message",
                    children: p,
                  }),
              ],
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "slider-label lg-label",
              children: [
                c("fulltext_whitelist_list_label"),
                " (",
                (null == (t = null == (e = o.fulltext) ? void 0 : e.whitelist)
                  ? void 0
                  : t.length) || 0,
                ")",
              ],
            }),
            0 ===
              (null == (r = null == (n = o.fulltext) ? void 0 : n.whitelist)
                ? void 0
                : r.length) &&
              (0, jsxRuntime.jsxs)("div", {
                className: "no-float-data",
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-20",
                    children: (0, jsxRuntime.jsx)(ki, {}),
                  }),
                  (0, jsxRuntime.jsx)("span", {
                    children: c("fulltext_whitelist_empty"),
                  }),
                ],
              }),
            (0, jsxRuntime.jsx)("div", {
              className: "item-slider-group",
              children:
                null == (a = null == (i = o.fulltext) ? void 0 : i.whitelist)
                  ? void 0
                  : a.map((e) =>
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
                                  children: e,
                                }),
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "item-right black-list-action",
                                onClick: () =>
                                  ((e) => {
                                    u(Dn(e)),
                                      extensionClient.track({
                                        name: "fulltext_whitelist_remove",
                                        event_value: e,
                                      });
                                  })(e),
                                children: (0, jsxRuntime.jsx)("div", {
                                  className: "t-icon icon-16",
                                  children: (0, jsxRuntime.jsx)(Fi, {}),
                                }),
                              }),
                            ],
                          }),
                        },
                        e,
                      ),
                    ),
            }),
          ],
        }),
      ],
    });
  };

  return FulltextWhitelistPage;
}
