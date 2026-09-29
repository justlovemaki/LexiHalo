/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverDualSubtitleSettings(dependencies) {
  const Br = dependencies.Br;
  const Ta = dependencies.Ta;
  const aa = dependencies.aa;
  const jsxRuntime = dependencies.jsxRuntime;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const DualSubtitleSettings = (props) => {
    const { user: t, setting: n } = useAppSelector((e) => ({
        user: e.user,
        setting: e.setting,
      })),
      { navigate: r } = useSliderNavigation(),
      { dispatch: i } = useDispatchBridge(),
      a = (useApiClient(!0), !1 !== n.dualSubtitleEnabled),
      { locale: o } = useLocale();
    return (0, jsxRuntime.jsxs)("div", {
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
                  children: o("dual_subtitle_title"),
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
              children: o("dual_subtitle_tips"),
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "item-slider-group",
              children: (0, jsxRuntime.jsxs)("div", {
                className: "item-slider",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "item-slider-content",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-left",
                        children: (0, jsxRuntime.jsx)("span", {
                          children: o("dual_subtitle_enable"),
                        }),
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "item-right",
                        onClick: () => {
                          const e = !a;
                          i(Br(e)),
                            window.dispatchEvent(
                              new CustomEvent("edvideo:caption.reload", {
                                detail: {
                                  body: {
                                    status: e ? "on" : "off",
                                  },
                                },
                              }),
                            );
                        },
                        children: (0, jsxRuntime.jsx)("input", {
                          type: "checkbox",
                          className: "rd-switch",
                          checked: a,
                          readOnly: !0,
                        }),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-slider-des",
                    children: o("dual_subtitle_enable_des"),
                  }),
                ],
              }),
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "slider-label lg-label",
              children: o("dual_subtitle_support_platform"),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "support-platform",
              children: [
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.youtube.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "YouTube",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.netflix.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_netflix",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Netflix",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.max.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_hbo",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Max / HBO",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.disneyplus.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_disney",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Disney+",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.primevideo.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_prime",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Prime Video",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.coursera.org/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_coursera",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Coursera",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.udemy.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_udemy",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Udemy",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.edx.org/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_edx",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "edX",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.deeplearning.ai/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_deeplearning",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "DeepLearning",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.ted.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_ted",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "TED",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://www.bilibili.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_bilibili",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Bilibili",
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("a", {
                  className: "support-platform-item",
                  href: "https://vimeo.com/",
                  target: "_blank",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "platform-icon p_vimeo",
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: "Vimeo",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  return DualSubtitleSettings;
}
