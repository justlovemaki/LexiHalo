/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverSentenceTranslationCard(dependencies) {
  const $T = dependencies.$T;
  const $i = dependencies.$i;
  const B_ = dependencies.B_;
  const Ei = dependencies.Ei;
  const IT = dependencies.IT;
  const Jd = dependencies.Jd;
  const Or = dependencies.Or;
  const R_ = dependencies.R_;
  const React = dependencies.React;
  const Sa = dependencies.Sa;
  const UT = dependencies.UT;
  const Va = dependencies.Va;
  const WT = dependencies.WT;
  const W_ = dependencies.W_;
  const Wa = dependencies.Wa;
  const Wi = dependencies.Wi;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const ip = dependencies.ip;
  const jsxRuntime = dependencies.jsxRuntime;
  const q_ = dependencies.q_;
  const qa = dependencies.qa;
  const qr = dependencies.qr;
  const ro = dependencies.ro;
  const ua = dependencies.ua;
  const uk = dependencies.uk;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSpeech = dependencies.useSpeech;
  const xn = dependencies.xn;
  const xp = dependencies.xp;
  const z_ = dependencies.z_;

  const SentenceTranslationCard = (props) => {
    const { box: t, onloaded: n } = props,
      {
        setting: r,
        edreader: i,
        user: a,
        translatorService: o,
      } = useAppSelector((e) => e),
      s = useApiClient(!0),
      l = (0, React.useMemo)(() => B_(props.text), [props.text]),
      { active: c, onHighlight: u, reset: d } = W_(),
      [_, p] = (0, React.useState)(""),
      [h, m] = (0, React.useState)([]),
      [g, f] = (0, React.useState)(!1),
      [v, b] = (0, React.useState)(!1),
      { dispatch: y } = useDispatchBridge(),
      [x, w] = (0, React.useState)({
        position: "fixed",
        opacity: 0,
        width: "560px",
      }),
      { locale: k } = useLocale(),
      T = (0, React.useRef)(!1),
      C = (0, React.useRef)(),
      { speechStatus: S, speechToggle: j, stop: A } = useSpeech(),
      N = (e) => {
        w(
          ro({
            width: 560,
            box: t,
            offsetY: 2,
            height: e,
            transform: C.current,
          }),
        );
      },
      [P, E] = (0, React.useState)(null),
      L = (0, React.useCallback)((e) => {
        e && (E(e), N(e.getBoundingClientRect().height));
      }, []);
    (0, React.useEffect)(() => {
      const e = new ResizeObserver((e) => {
        for (let t of e) N(t.contentRect.height);
      });
      return (
        P && e.observe(P),
        () => {
          P && e.unobserve(P), e.disconnect();
        }
      );
    }, [P]);
    const [q, M] = (0, React.useState)("loading"),
      O = (e, t = !0) =>
        UT(null, null, function* () {
          t && b(!0);
          const n = (yield extensionClient.translateWithEngine({
            texts: [e],
            from: r.language.subtitle,
            to: r.language.translation,
            engine: o.sentence,
            cacheScope: "selection",
            useCache: !0,
          }))
            .map((e) => e.translation)
            .join("");
          t && b(!1), p(n);
        }),
      I = (e, t = !0) =>
        UT(null, null, function* () {
          t && b(!0);
          const { message: n, data: i, code: a } = yield s.sentencizer(e);
          if ("ok" !== n) return;
          if (403 === a) return;
          const l = i.map((e) => ({
            tokens: e,
            text: e.map((e) => e.meta).join(""),
          }));
          m([...l]), M("sentences");
          const c = l.map((e) => e.text),
            u = yield extensionClient.translateWithEngine({
              texts: c,
              from: r.language.subtitle,
              to: r.language.translation,
              engine: o.sentence,
              cacheScope: "selection",
              useCache: !0,
            });
          l.forEach((e, t) => {
            e.translation = u[t].translation;
          }),
            t && b(!1),
            m([...l]),
            M("done");
        }),
      [z, R] = (0, React.useState)(!1);
    (0, React.useEffect)(() => {
      "stop" === S && d();
    }, [S, d]),
      (0, React.useEffect)(
        () => (
          extensionClient.track({
            name: "sentence_card_open",
          }),
          () => {
            A();
          }
        ),
        [],
      );
    const B = (0, React.useRef)(o.sentence._id);
    (0, React.useEffect)(() => {
      var t;
      (B.current = o.sentence._id),
        d(),
        (t = props.text),
        UT(null, null, function* () {
          (T.current = !1),
            n(),
            1 == ("sentence" === i.sentenceMode)
              ? yield I(t)
              : (M("sentences"), yield O(t), M("done")),
            (T.current = !0);
        });
    }, [props.text]);
    (0, React.useEffect)(() => {
      var t;
      B.current !== o.sentence._id &&
        ((B.current = o.sentence._id),
        (t = props.text),
        UT(null, null, function* () {
          if ((b(!0), "sentence" === i.sentenceMode && h.length > 0)) {
            const e = h.map((e) => e.text),
              t = yield extensionClient.translateWithEngine({
                texts: e,
                from: r.language.subtitle,
                to: r.language.translation,
                engine: o.sentence,
                cacheScope: "selection",
                useCache: !0,
              }),
              n = h.map((e, n) =>
                $T(WT({}, e), {
                  translation: t[n].translation,
                }),
              );
            m(n);
          } else {
            const e = yield extensionClient.translateWithEngine({
              texts: [t],
              from: r.language.subtitle,
              to: r.language.translation,
              engine: o.sentence,
              cacheScope: "selection",
              useCache: !0,
            });
            p(e.map((e) => e.translation).join(""));
          }
          b(!1);
        }));
    }, [o.sentence._id]);
    const [D, F] = (0, React.useState)(null),
      H = (e) => {
        if (!a) return extensionClient.toggleSlider("/setting/login");
        extensionClient.track({
          name: "edreader_sentence_grammar",
        }),
          F(e);
      },
      [V, W] = (0, React.useState)(!1),
      [$, U] = (0, React.useState)(extensionClient.cardPined),
      Z = (e) => {
        var t;
        return (0, jsxRuntime.jsxs)("div", {
          className: classNames()("items item-engine", {
            selected: (null == (t = o.sentence) ? void 0 : t._id) === e._id,
          }),
          onClick: (t) => {
            if ((t.stopPropagation(), e.setupProvider))
              return extensionClient.open(
                `byok.html?provider=${encodeURIComponent(e.setupProvider)}`,
                !1,
              );
            if ("GLM" === e.provider && 1 === e.role && !a)
              return extensionClient.toggleSlider("/setting/signup");
            ((e) => {
              UT(null, null, function* () {
                o.sentence._id !== e._id &&
                  (y(
                    Or({
                      sentence: e,
                    }),
                  ),
                  R(!1));
              });
            })(e);
          },
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "t-icon icon-18",
              children: (0, jsxRuntime.jsx)(Jd, {
                name: e.icon || e.provider,
              }),
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "engine-name",
              children: e.name,
            }),
            !e.available &&
              "trancy" === e.type &&
              (0, jsxRuntime.jsx)("div", {
                className: "advance-ai-tag",
                children: "AI",
              }),
          ],
        });
      };
    return (0, jsxRuntime.jsxs)(q_.div, {
      children: [
        (0, jsxRuntime.jsx)("link", {
          onLoad: () => W(!0),
          rel: "stylesheet",
          href: `${props.runtime.scheme}/assets/edreader.css`,
        }),
        "loading" !== q &&
          (0, jsxRuntime.jsx)(uk(), {
            handle: ".handle",
            bounds: "body",
            onStop: (e, t) => {
              C.current = t;
            },
            children: (0, jsxRuntime.jsxs)("div", {
              ref: L,
              onClick: (e) => {
                e.stopPropagation(), R(!1);
              },
              onMouseMove: (e) => e.stopPropagation(),
              className: classNames()(
                "rd-theme rd-sentence-card xor",
                i.theme,
                `lt-${r.language.translation}`,
              ),
              style: x,
              children: [
                V &&
                  null !== D &&
                  (0, jsxRuntime.jsx)(ip, {
                    text: D,
                    runtime: props.runtime,
                    exit: () => F(null),
                  }),
                V &&
                  null === D &&
                  (0, jsxRuntime.jsxs)(React.Fragment, {
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()("rd-sentence-header", "handle"),
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-brand",
                            children: [
                              (0, jsxRuntime.jsx)(z_, {
                                provider: "trancy",
                              }),
                              (0, jsxRuntime.jsx)("span", {
                                children: "LexiHalo",
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "icon-drag",
                            children: (0, jsxRuntime.jsx)(Va, {}),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "btn-action-group",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: classNames()("btn-sentence-action", {
                                  pined: $,
                                }),
                                onClick: () => {
                                  extensionClient.track({
                                    name: "sentence_pin_toggle",
                                  }),
                                    (extensionClient.cardPined = !$),
                                    U(!$);
                                },
                                children: (0, jsxRuntime.jsx)("div", {
                                  className: "t-icon icon-16",
                                  children: (0, jsxRuntime.jsx)(Ei, {}),
                                }),
                              }),
                              "paragraph" === i.sentenceMode &&
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "speech-controls header-speech",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: classNames()(
                                        "btn-sentence-action stop-speak",
                                        {
                                          visible: "stop" !== S,
                                        },
                                      ),
                                      "aria-hidden": "stop" === S,
                                      onClick: (e) => {
                                        "stop" !== S &&
                                          (e.stopPropagation(),
                                          A(),
                                          d(),
                                          extensionClient.track({
                                            name: "sentence_speech_stop",
                                          }));
                                      },
                                      children: (0, jsxRuntime.jsx)("div", {
                                        className: "t-icon icon-14",
                                        children: (0, jsxRuntime.jsx)(Sa, {}),
                                      }),
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: classNames()(
                                        "btn-sentence-action",
                                        S,
                                        {
                                          speaking: "stop" !== S,
                                        },
                                      ),
                                      onClick: () => {
                                        extensionClient.track({
                                          name: "sentence_speech_toggle",
                                        }),
                                          j({
                                            text: l,
                                            onHighlight: u,
                                          });
                                      },
                                      children: (0, jsxRuntime.jsx)("div", {
                                        className: "t-icon icon-16",
                                        children:
                                          "playing" === S
                                            ? (0, jsxRuntime.jsx)(Wi, {})
                                            : "pause" === S
                                              ? (0, jsxRuntime.jsx)($i, {})
                                              : Wa(S),
                                      }),
                                    }),
                                  ],
                                }),
                              IT.includes(r.language.subtitle) &&
                                (0, jsxRuntime.jsxs)("div", {
                                  className: classNames()(
                                    "btn-sentence-action tippy tippy-right",
                                    i.sentenceMode,
                                    {
                                      loading: g,
                                    },
                                  ),
                                  onClick: () => {
                                    UT(null, null, function* () {
                                      if (!a)
                                        return extensionClient.toggleSlider(
                                          "/setting/login",
                                        );
                                      if (!g)
                                        switch (i.sentenceMode) {
                                          case "paragraph":
                                            f(!0),
                                              yield I(props.text, !1),
                                              f(!1),
                                              y(xn("sentence")),
                                              extensionClient.track({
                                                name: "translator_sentence_combine",
                                              });
                                            break;
                                          case "sentence":
                                            _ ||
                                              (f(!0),
                                              yield O(props.text, !1),
                                              f(!1)),
                                              y(xn("paragraph")),
                                              extensionClient.track({
                                                name: "translator_sentence_split",
                                              });
                                        }
                                    });
                                  },
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "t-icon icon-16 mg-3",
                                      children: (0, jsxRuntime.jsx)(qa, {}),
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "tips",
                                      children:
                                        "sentence" === i.sentenceMode
                                          ? k("sentence_combine")
                                          : k("sentence_split"),
                                    }),
                                  ],
                                }),
                              (0, jsxRuntime.jsxs)("div", {
                                className:
                                  "btn-sentence-action tippy tippy-right engine-selector",
                                onClick: (e) =>
                                  UT(null, null, function* () {
                                    e.stopPropagation(), R(!z);
                                    const { message: t, data: n } =
                                      yield s.getTranslatorEngines();
                                    "ok" === t &&
                                      y(
                                        qr({
                                          engines: n.engines,
                                          quota: n.quota,
                                        }),
                                      );
                                  }),
                                children: [
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "t-icon icon-16",
                                    children: (0, jsxRuntime.jsx)(Jd, {
                                      name:
                                        o.sentence.icon || o.sentence.provider,
                                    }),
                                  }),
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "tips",
                                    children: k("exchange_translate_engine"),
                                  }),
                                  z &&
                                    (0, jsxRuntime.jsxs)("div", {
                                      className:
                                        "dropdown-menu top engine-dropdown",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "label",
                                          children: k("engine_free"),
                                        }),
                                        o.engines
                                          .filter(
                                            (e) => e.enabled && 1 === e.role,
                                          )
                                          .map((e) => Z(e)),
                                        o.engines.filter(
                                          (e) => e.enabled && "user" === e.type,
                                        ).length > 0 &&
                                          (0, jsxRuntime.jsxs)(
                                            jsxRuntime.Fragment,
                                            {
                                              children: [
                                                (0, jsxRuntime.jsx)("div", {
                                                  className: "label",
                                                  children: k("engine_custom"),
                                                }),
                                                o.engines
                                                  .filter(
                                                    (e) =>
                                                      e.enabled &&
                                                      "user" === e.type,
                                                  )
                                                  .map((e) => Z(e)),
                                              ],
                                            },
                                          ),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "label",
                                          children: k("engine_advanced"),
                                        }),
                                        o.engines
                                          .filter(
                                            (e) =>
                                              "trancy" === e.type &&
                                              e.enabled &&
                                              e.role >= 2,
                                          )
                                          .map((e) => Z(e)),
                                        (0, jsxRuntime.jsxs)("div", {
                                          className: "items item-engine",
                                          onClick: () => {
                                            extensionClient.open(
                                              "byok.html",
                                              !1,
                                            );
                                          },
                                          children: [
                                            (0, jsxRuntime.jsx)("div", {
                                              className: "t-icon icon-18",
                                              children: (0, jsxRuntime.jsx)(
                                                "div",
                                                {
                                                  className: "svg-icon",
                                                  children: (0, jsxRuntime.jsx)(
                                                    ua,
                                                    {},
                                                  ),
                                                },
                                              ),
                                            }),
                                            (0, jsxRuntime.jsx)("div", {
                                              className:
                                                "item-engine-name engine-add-more",
                                              children: k("engine_add_more"),
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
                      }),
                      "paragraph" === i.sentenceMode &&
                        (0, jsxRuntime.jsxs)("div", {
                          className: "rd-sentence-body scroll",
                          children: [
                            (0, jsxRuntime.jsx)("div", {
                              className: "rd-sentence-origin",
                              children: (0, jsxRuntime.jsx)(R_, {
                                text: l,
                                offset: 0,
                                active: c,
                              }),
                            }),
                            _
                              ? (0, jsxRuntime.jsx)("div", {
                                  className: classNames()(
                                    "rd-sentence-translate translation-fadein",
                                    {
                                      "ai-loading": v,
                                    },
                                  ),
                                  children: _,
                                })
                              : v
                                ? (0, jsxRuntime.jsx)("div", {
                                    className: "rd-sentence-translate",
                                    children: (() => {
                                      const t = Math.max(
                                        1,
                                        Math.ceil(props.text.length / 70) - 2,
                                      );
                                      return Array.from(
                                        {
                                          length: t,
                                        },
                                        (e, n) => {
                                          const r =
                                            1 === t
                                              ? "80%"
                                              : n === t - 1
                                                ? "60%"
                                                : "100%";
                                          return (0, jsxRuntime.jsx)(
                                            "div",
                                            {
                                              className:
                                                "translation-placeholder",
                                              style: {
                                                width: r,
                                                marginTop: 10,
                                              },
                                            },
                                            n,
                                          );
                                        },
                                      );
                                    })(),
                                  })
                                : null,
                          ],
                        }),
                      "sentence" === i.sentenceMode &&
                        (0, jsxRuntime.jsx)("div", {
                          className: classNames()(
                            "rd-divider-body scroll",
                            r.language.subtitle,
                          ),
                          children: h.map((t, n) =>
                            (0, jsxRuntime.jsx)(
                              xp,
                              $T(WT({}, props), {
                                sentence: t,
                                translating: v,
                                onGrammar: H,
                              }),
                              `${n}-${t.text.slice(0, 24)}`,
                            ),
                          ),
                        }),
                    ],
                  }),
              ],
            }),
          }),
      ],
    });
  };

  return SentenceTranslationCard;
}
