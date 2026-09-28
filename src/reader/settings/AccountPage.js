/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverAccountPage(dependencies) {
  const Ca = dependencies.Ca;
  const React = dependencies.React;
  const Ta = dependencies.Ta;
  const Vn = dependencies.Vn;
  const Wn = dependencies.Wn;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const xw = dependencies.xw;
  const yw = dependencies.yw;

  const AccountPage = () => {
    var e, t;
    const { user: n } = useAppSelector((e) => ({
        edreader: e.edreader,
        user: e.user,
      })),
      { navigate: r } = useSliderNavigation(),
      { locale: i } = useLocale(),
      a = useApiClient(!0),
      { dispatch: o } = useDispatchBridge(),
      [s, l] = (0, React.useState)(!1);
    return (
      (0, React.useEffect)(() => {
        xw(null, null, function* () {
          const { message: e, data: t } = yield a.getProfile();
          "ok" === e && (null == t ? void 0 : t.token) && o(Vn(t));
        });
      }, []),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside",
        id: "trancy-slider",
        children: [
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-nav",
            children: [
              (0, jsxRuntime.jsxs)("div", {
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
                    children: i("accountTitle"),
                  }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "nav-right",
                children: (0, jsxRuntime.jsxs)("div", {
                  onClick: () => {},
                  className: "vip-tag premium",
                  children: [
                    "Free Access",
                    (null == n ? void 0 : n.AIEngineExpired) &&
                    (null == n ? void 0 : n.AIEngineExpired) > Date.now()
                      ? (0, jsxRuntime.jsx)("span", {
                          children: " + AI",
                        })
                      : "",
                  ],
                }),
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-content",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "item-slider-group md-0",
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider",
                    children: (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("accountEmail"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: null == n ? void 0 : n.email,
                          }),
                        }),
                      ],
                    }),
                  }),
                  (!(null == (e = null == n ? void 0 : n.subscription)
                    ? void 0
                    : e.stripeSubStatus) ||
                    n.subscription.canceled_at) &&
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider",
                      children: (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: i("account_membership"),
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-right",
                            children:
                              (null == (t = null == n ? void 0 : n.subscription)
                                ? void 0
                                : t.expired) &&
                              n.subscription.expired > Date.now()
                                ? (0, jsxRuntime.jsxs)("span", {
                                    children: [
                                      yw()(n.subscription.expired).format(
                                        "YYYY/MM/DD",
                                      ),
                                      " ",
                                      i("account_premium_expired"),
                                    ],
                                  })
                                : (0, jsxRuntime.jsx)("div", {
                                    className: "account-premium-upgrade",
                                    children: "Free Access",
                                  }),
                          }),
                        ],
                      }),
                    }),
                  (null == n ? void 0 : n.AIEngineExpired) &&
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider",
                      children: (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: i("advanced_ai"),
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-right",
                            children:
                              (null == n ? void 0 : n.AIEngineExpired) &&
                              (null == n ? void 0 : n.AIEngineExpired) >
                                Date.now()
                                ? (0, jsxRuntime.jsxs)("span", {
                                    children: [
                                      yw()(
                                        null == n ? void 0 : n.AIEngineExpired,
                                      ).format("YYYY/MM/DD"),
                                      " ",
                                      i("account_premium_expired"),
                                    ],
                                  })
                                : (0, jsxRuntime.jsx)("div", {
                                    className: "account-premium-upgrade",
                                    children: "Free Access",
                                  }),
                          }),
                        ],
                      }),
                    }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider pointer",
                    onClick: () => {
                      extensionClient.openDashboard(
                        "https://learn.trancy.org/settings",
                      );
                    },
                    children: (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("account_detail"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("div", {
                            className: "t-icon icon-16",
                            children: (0, jsxRuntime.jsx)(Ca, {}),
                          }),
                        }),
                      ],
                    }),
                  }),
                  !s &&
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider pointer",
                      onClick: () => l(!s),
                      children: (0, jsxRuntime.jsxs)("div", {
                        className: "item-slider-content",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-left",
                            children: (0, jsxRuntime.jsx)("span", {
                              children: i("account_delete_label"),
                            }),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "item-right",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: "t-icon icon-16",
                              children: (0, jsxRuntime.jsx)(Ca, {}),
                            }),
                          }),
                        ],
                      }),
                    }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "btn-logout",
                onClick: () =>
                  xw(null, null, function* () {
                    return (
                      yield o(Wn()),
                      extensionClient.toggleSlider("/setting/login")
                    );
                  }),
                children: i("accountLogout"),
              }),
              s &&
                (0, jsxRuntime.jsxs)("div", {
                  className: "rd-modal",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "rd-modal-mask",
                    }),
                    (0, jsxRuntime.jsxs)("div", {
                      className: "rd-modal-container",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "rd-modal-title",
                          children: i("account_delete_title"),
                        }),
                        (0, jsxRuntime.jsx)("p", {
                          children: i("account_delete_des"),
                        }),
                        (0, jsxRuntime.jsxs)("div", {
                          className: "rd-modal-btn-group",
                          children: [
                            (0, jsxRuntime.jsx)("div", {
                              className: "rd-modal-btn",
                              onClick: () =>
                                xw(null, null, function* () {
                                  if (!s) return;
                                  const { message: e } = yield a.deleteUser();
                                  "ok" === e &&
                                    (yield o(Wn()), r("/setting/login"));
                                }),
                              children: i("account_delete_btn"),
                            }),
                            (0, jsxRuntime.jsx)("div", {
                              className: "rd-modal-btn",
                              onClick: () => l(!s),
                              children: i("account_delete_cancel"),
                            }),
                          ],
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

  return AccountPage;
}
