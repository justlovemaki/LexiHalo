/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverTranslationEngineSettings(dependencies) {
  const Gi = dependencies.Gi;
  const Jd = dependencies.Jd;
  const Ki = dependencies.Ki;
  const Or = dependencies.Or;
  const Ra = dependencies.Ra;
  const React = dependencies.React;
  const classNames = dependencies.classNames;
  const da = dependencies.da;
  const extensionClient = dependencies.extensionClient;
  const ga = dependencies.ga;
  const immersiveTranslator = dependencies.immersiveTranslator;
  const jsxRuntime = dependencies.jsxRuntime;
  const ma = dependencies.ma;
  const qr = dependencies.qr;
  const ua = dependencies.ua;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useToast = dependencies.useToast;

  const TranslationEngineSettings = () => {
    const { translatorService: e, user: t } = useAppSelector((e) => ({
        translatorService: e.translatorService,
        user: e.user,
      })),
      { navigate: n, ArrowIcon: r, router: i } = useSliderNavigation(),
      { locale: a } = useLocale(),
      { toast: o, Toast: s } = useToast(),
      l = useApiClient(!0),
      c = new URLSearchParams(i.state.location.search),
      u = ["sentence", "fulltext", "subtitle"].includes(c.get("activeTab"))
        ? c.get("activeTab")
        : "sentence",
      [d, _] = (0, React.useState)(u),
      { dispatch: p } = useDispatchBridge(),
      h = () => {
        return (
          (t = null),
          (n = null),
          (r = function* () {
            const { message: t, data: n } = yield l.getTranslatorEngines();
            if ("ok" === t && n.engines.length) {
              p(
                qr({
                  engines: n.engines,
                  quota: n.quota,
                }),
              );
              const t = n.engines.find((t) => {
                  var n;
                  return t._id === (null == (n = e.subtitle) ? void 0 : n._id);
                }),
                r = n.engines.find((t) => {
                  var n;
                  return t._id === (null == (n = e.fulltext) ? void 0 : n._id);
                }),
                i = n.engines.find((t) => {
                  var n;
                  return t._id === (null == (n = e.sentence) ? void 0 : n._id);
                });
              (t || r || i) &&
                p(
                  Or({
                    subtitle: t,
                    fulltext: r,
                    sentence: i,
                  }),
                );
            }
          }),
          new Promise((e, i) => {
            var a = (e) => {
                try {
                  s(r.next(e));
                } catch (e) {
                  i(e);
                }
              },
              o = (e) => {
                try {
                  s(r.throw(e));
                } catch (e) {
                  i(e);
                }
              },
              s = (t) =>
                t.done ? e(t.value) : Promise.resolve(t.value).then(a, o);
            s((r = r.apply(t, n)).next());
          })
        );
        var t, n, r;
      };
    (0, React.useEffect)(() => {
      h();
    }, []);
    const m = (n) => {
      const r = e[d];
      return (0, jsxRuntime.jsxs)("div", {
        className: classNames()("items item-engine", {
          selected: (null == r ? void 0 : r._id) === n._id,
        }),
        onClick: (e) => {
          if (
            (extensionClient.track({
              name: `${d}_engine_change`,
              event_value: n.name,
            }),
            e.stopPropagation(),
            n.setupProvider)
          )
            return extensionClient.open(
              `byok.html?provider=${encodeURIComponent(n.setupProvider)}`,
              !1,
            );
          if ("GLM" === n.provider && 1 === n.role && !t)
            return extensionClient.toggleSlider("/setting/signup");
          const r = "subtitle" === d;
          p(
            Or({
              [d]: n,
            }),
            r,
          ),
            "fulltext" === d &&
              ((immersiveTranslator.engine = n),
              extensionClient.emit("forward", ["background"], {
                name: "fulltext-translation-reload",
                body: {},
              })),
            extensionClient.track({
              name: `${d}_engine_change`,
              event_value: n.name,
            });
        },
        children: [
          (0, jsxRuntime.jsx)(Jd, {
            name: n.icon || n.provider,
          }),
          (0, jsxRuntime.jsx)("div", {
            className: "item-engine-name",
            children: n.name,
          }),
          !n.available &&
            "trancy" === n.type &&
            (0, jsxRuntime.jsx)("div", {
              className: "advance-ai-tag",
              children: "AI",
            }),
          (0, jsxRuntime.jsx)("div", {
            className: classNames()("icon-check", {
              active: (null == r ? void 0 : r._id) === n._id,
            }),
            children:
              (null == r ? void 0 : r._id) === n._id
                ? (0, jsxRuntime.jsx)(Ki, {})
                : (0, jsxRuntime.jsx)(Gi, {}),
          }),
        ],
      });
    };
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsx)(s, {}),
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
                    children: (0, jsxRuntime.jsx)(r, {}),
                  }),
                }),
                (0, jsxRuntime.jsx)("span", {
                  children: a("rd_trasnlate_engine"),
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "nav-right",
              onClick: () => {
                extensionClient.track({
                  name: "setting_engine_manage",
                }),
                  extensionClient.open("byok.html", !1);
              },
              children: [
                (0, jsxRuntime.jsxs)("div", {
                  className: "btn-slider-link",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "t-icon icon-16 anchor",
                      children: (0, jsxRuntime.jsx)(ua, {}),
                    }),
                    (0, jsxRuntime.jsx)("span", {
                      children: a("engine_manage"),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: classNames()("engine-select-card-gradient", d),
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "engine-tab",
              children: [
                {
                  key: "sentence",
                  title: a("engine_type_sentence"),
                  icon: (0, jsxRuntime.jsx)(ma, {}),
                },
                {
                  key: "fulltext",
                  title: a("engine_type_immersive"),
                  icon: (0, jsxRuntime.jsx)(ga, {}),
                },
                {
                  key: "subtitle",
                  title: a("engine_type_subtitle"),
                  icon: (0, jsxRuntime.jsx)(da, {}),
                },
              ].map((e) =>
                (0, jsxRuntime.jsxs)("div", {
                  className: classNames()("engine-tab-item", {
                    active: d === e.key,
                  }),
                  onClick: () => _(e.key),
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "engine-tab-item-icon",
                      children: e.icon,
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "engine-tab-item-name",
                      children: e.title,
                    }),
                  ],
                }),
              ),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "engine-tab-item-content",
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "engine-title-desc",
                  children: {
                    sentence: a("engine_type_sentence_tips"),
                    fulltext: a("engine_type_immersive_tips"),
                    subtitle: a("engine_type_subtitle_tips"),
                  }[d],
                }),
                (0, jsxRuntime.jsx)("div", {
                  className: "engine-select-card ",
                  children: (0, jsxRuntime.jsxs)("div", {
                    className: "engine-selector-list",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "label",
                        children: a("engine_free"),
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "selector-list-wrapper",
                        children: e.engines
                          .filter((e) => e.enabled && 1 === e.role)
                          .map((e) => m(e)),
                      }),
                      e.engines.filter((e) => e.enabled && "user" === e.type)
                        .length > 0 &&
                        (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                          children: [
                            (0, jsxRuntime.jsx)("div", {
                              className: "label",
                              children: a("engine_custom"),
                            }),
                            (0, jsxRuntime.jsx)("div", {
                              className: "selector-list-wrapper",
                              children: e.engines
                                .filter((e) => e.enabled && "user" === e.type)
                                .map((e) => m(e)),
                            }),
                          ],
                        }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "engine-add-more-btn",
                        onClick: () => {
                          extensionClient.open("byok.html", !1);
                        },
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "svg-icon",
                            children: (0, jsxRuntime.jsx)(Ra, {}),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "engine-add-more",
                            children: a("engine_add_more"),
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  return TranslationEngineSettings;
}
