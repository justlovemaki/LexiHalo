/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverPremiumVoiceSettings(dependencies) {
  const La = dependencies.La;
  const Na = dependencies.Na;
  const Pa = dependencies.Pa;
  const React = dependencies.React;
  const Sa = dependencies.Sa;
  const Ta = dependencies.Ta;
  const Vn = dependencies.Vn;
  const _a = dependencies._a;
  const ca = dependencies.ca;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const ma = dependencies.ma;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const PremiumVoiceSettings = () => {
    const { user: e } = useAppSelector((e) => ({
        user: e.user,
      })),
      { navigate: t } = useSliderNavigation(),
      { locale: n } = useLocale(),
      r = useApiClient(!0),
      [i, a] = (0, React.useState)(!1),
      { dispatch: o } = useDispatchBridge(),
      s = () => {
        return (
          (e = null),
          (t = null),
          (n = function* () {
            const { message: e, data: t } = yield r.getProfile();
            "ok" === e && (null == t ? void 0 : t.token) && o(Vn(t));
          }),
          new Promise((r, i) => {
            var a = (e) => {
                try {
                  s(n.next(e));
                } catch (e) {
                  i(e);
                }
              },
              o = (e) => {
                try {
                  s(n.throw(e));
                } catch (e) {
                  i(e);
                }
              },
              s = (e) =>
                e.done ? r(e.value) : Promise.resolve(e.value).then(a, o);
            s((n = n.apply(e, t)).next());
          })
        );
        var e, t, n;
      };
    (0, React.useEffect)(() => {
      s();
    }, []);
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-nav",
          children: (0, jsxRuntime.jsxs)("div", {
            className: "nav-left",
            onClick: () => t(-1),
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "btn-slider-back",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-18",
                  children:
                    extensionClient.history < 1
                      ? (0, jsxRuntime.jsx)(Sa, {})
                      : (0, jsxRuntime.jsx)(Ta, {}),
                }),
              }),
              (0, jsxRuntime.jsx)("span", {
                children: n("premiumTitle"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-content",
          children: (0, jsxRuntime.jsxs)("div", {
            className: "premium-wrapper",
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "icon-premium-wrapper",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "logo",
                }),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "premium-des-wrapper",
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "title",
                    children: n("premiumTitle"),
                  }),
                  (0, jsxRuntime.jsx)("p", {
                    className: "des",
                    children: n("premiumSubtitle"),
                  }),
                ],
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "bottom-tips",
                children: [
                  (0, jsxRuntime.jsx)("p", {
                    children: n("premiumSincerity"),
                  }),
                  !e &&
                    (0, jsxRuntime.jsx)("div", {
                      onClick: () => t("/setting/login"),
                      className: "trancy-gift-btn",
                      children: n("premiumLoginGiftBtn"),
                    }),
                  !1,
                  i &&
                    (0, jsxRuntime.jsx)("a", {
                      className: "trancy-btn-already-paid",
                      onClick: () => {
                        t("/setting/account-detail");
                      },
                      children: n("alreadyPaid"),
                    }),
                ],
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "premium-feature-wrapper xor",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-premium-feature",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-22 anchor",
                          children: (0, jsxRuntime.jsx)(ma, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "feature-des",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "title",
                            children: n("premiumFeature1"),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: n("premiumFeature1Des"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-premium-feature",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-22 anchor",
                          children: (0, jsxRuntime.jsx)(Pa, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "feature-des",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "title",
                            children: n("premiumFeature6"),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: n("premiumFeature6Des"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-premium-feature",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-22 anchor",
                          children: (0, jsxRuntime.jsx)(ca, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "feature-des",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "title",
                            children: n("premiumFeatureVoiceTitle"),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: n("premiumFeatureVoice"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-premium-feature",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-22 anchor",
                          children: (0, jsxRuntime.jsx)(Na, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "feature-des",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "title",
                            children: n("premiumFeature2"),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: n("premiumFeature2Des"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-premium-feature",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-22 anchor",
                          children: (0, jsxRuntime.jsx)(_a, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "feature-des",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "title",
                            children: n("premiumFeature3"),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: n("premiumFeature3Des"),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-premium-feature",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-22 anchor",
                          children: (0, jsxRuntime.jsx)(La, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "feature-des",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "title",
                            children: n("premiumFeature5"),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: n("premiumFeature5Des"),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  };

  return PremiumVoiceSettings;
}
