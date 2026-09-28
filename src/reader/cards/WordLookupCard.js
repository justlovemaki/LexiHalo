/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverWordLookupCard(dependencies) {
  const Ia = dependencies.Ia;
  const LT = dependencies.LT;
  const Li = dependencies.Li;
  const MT = dependencies.MT;
  const Ma = dependencies.Ma;
  const Oa = dependencies.Oa;
  const React = dependencies.React;
  const TT = dependencies.TT;
  const WordActionButtons = dependencies.WordActionButtons;
  const Zn = dependencies.Zn;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const ir = dependencies.ir;
  const jsxRuntime = dependencies.jsxRuntime;
  const lr = dependencies.lr;
  const os = dependencies.os;
  const qT = dependencies.qT;
  const q_ = dependencies.q_;
  const ro = dependencies.ro;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDictionary = dependencies.useDictionary;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSpeech = dependencies.useSpeech;
  const vocabularyHighlighter = dependencies.vocabularyHighlighter;
  const za = dependencies.za;

  const WordLookupCard = (props) => {
    var t;
    const { box: n, translatorSelection: r, contextContent: i } = props,
      {
        user: a,
        edreader: o,
        language: s,
        tasks: l,
      } = useAppSelector(
        (e) => ({
          user: e.user,
          edreader: e.edreader,
          language: e.setting.language,
          tasks: e.tasks,
        }),
        os,
      ),
      { locale: c } = useLocale(),
      { dispatch: u } = useDispatchBridge(),
      {
        phrases: d,
        findPhrase: _,
        findWord: p,
        word: h,
        mapTranslation: m,
        mapPhonetic: g,
        togglePhoneticLocale: f,
        mapExplains: v,
        mapInflections: b,
      } = useDictionary(!0, u),
      { speechWord: y, speechStatus: x } = useSpeech(),
      [w, k] = (0, React.useState)(!1),
      [T, C] = (0, React.useState)(
        qT(
          LT(
            {},
            ro({
              width: 310,
              box: n,
              offsetY: 4,
            }),
          ),
          {
            width: "310px",
            zIndex: 2147483647,
          },
        ),
      ),
      S = useApiClient(!0),
      [j, A] = (0, React.useState)(!1),
      [N, P] = (0, React.useState)(),
      [E, L] = (0, React.useState)(0),
      q = (e, t) =>
        MT(null, null, function* () {
          if (0 !== E || N) return;
          L(1);
          try {
            const { translatorService: n } =
                yield extensionClient.getStateChunks({
                  only: ["translatorService"],
                }),
              r = n.engines.find(
                (e) =>
                  "user" === e.type || String(e._id || "").startsWith("byok-"),
              );
            if (!r) throw new Error("请先配置 BYOK AI 模型");
            const i = `You are a bilingual lexicographer. Explain the word in its exact sentence context. The source language is ${s.subtitle}; answer in ${s.translation}. Return only valid JSON without Markdown.`,
              a = `Word: {{text}}\nSentence context: ${t || ""}\nReturn {"pos":"part of speech","translation":"the precise contextual meaning in ${s.translation}"}.`,
              o = yield extensionClient.translateWithEngine({
                texts: [e],
                from: s.subtitle,
                to: s.translation,
                engine: {
                  ...r,
                  systemPrompt: i,
                  prompt: a,
                },
                useCache: !1,
              }),
              l = null == o[0] ? void 0 : o[0].translation;
            if (!l)
              throw new Error(
                (null == o[0] ? void 0 : o[0].message) || "AI 精准释义失败",
              );
            let c = String(l)
                .trim()
                .replace(/^```(?:json)?\s*/i, "")
                .replace(/\s*```$/i, ""),
              u = c.indexOf("{"),
              d = c.lastIndexOf("}");
            u >= 0 && d > u && (c = c.slice(u, d + 1));
            const _ = JSON.parse(c);
            P({
              pos: _ && _.pos ? String(_.pos) : "",
              translation: _ && _.translation ? String(_.translation) : "",
            });
          } catch (e) {
            P({
              pos: "AI",
              translation: e instanceof Error ? e.message : String(e),
            });
          } finally {
            L(2);
          }
        });
    (0, React.useEffect)(() => {
      extensionClient.track({
        name: "word_card_open",
      }),
        MT(null, null, function* () {
          let t = props.text;
          if (props.text.split(" ").length < 2 && "en" === s.subtitle) {
            const [n] = window.posTagger.tagSentence(props.text);
            t = n.lemma || n.normal || n.value;
          }
          A(props.text.split(" ").length > 1),
            o.selectAutoSpeech && y(props.text);
          let n = yield p(t, {
            withExplain: "en" !== s.subtitle,
          });
          if (!n) {
            const { translatorService: e } =
                yield extensionClient.getStateChunks({
                  only: ["translatorService"],
                }),
              a = yield extensionClient.translateWithEngine({
                texts: [t],
                from: s.subtitle,
                to: s.translation,
                engine: e.sentence,
                cacheScope: "selection",
                useCache: !0,
              }),
              o = null == a[0] ? void 0 : a[0].translation;
            o &&
              ((n = {
                text: t,
                stl: s.subtitle,
                translation: [
                  {
                    trans: o,
                  },
                ],
                times: 0,
                phonetics: [],
              }),
              u(lr(n)));
          }
          if ((r.loaded(), a)) {
            const { message: e, data: r } = yield S.patchWord(t, {
              times: (null == n ? void 0 : n.times)
                ? (null == n ? void 0 : n.times) + 1
                : 1,
            });
            "ok" === e && n && u(lr(LT(LT({}, n), r)));
          } else
            n &&
              u(
                lr(
                  qT(LT({}, n), {
                    times: (null == n ? void 0 : n.times)
                      ? (null == n ? void 0 : n.times) + 1
                      : 1,
                  }),
                ),
              );
          if (
            o.selectAutoStar &&
            !(null == n ? void 0 : n.star) &&
            !(null == n ? void 0 : n.master) &&
            n
          ) {
            const { message: t, data: r } = yield S.patchWord(
              null == n ? void 0 : n.text,
              {
                star: !0,
              },
            );
            "ok" === t &&
              (u(lr(LT(LT({}, n), r))),
              props.wordContext &&
                S.postWordContext(n.text, props.wordContext).catch(() => {})),
              "en" === s.subtitle &&
                vocabularyHighlighter.highlightWord(
                  qT(LT({}, n), {
                    star: !0,
                  }),
                );
          }
          if (
            (o.selectAutoExplain && i && q(t, i),
            n && i && ["en"].includes(s.subtitle))
          ) {
            const e = yield _(n.text, i);
            e &&
              Array.isArray(e) &&
              e.length > 0 &&
              u(
                ir({
                  words: e,
                  empty: !1,
                }),
              );
          }
        });
    }, [props.text]);
    const M = (0, React.useMemo)(() => (h ? b(h, props.text) : []), [h]),
      O = (0, React.useMemo)(() => (h ? v(h) : []), [h]),
      I = (0, React.useMemo)(() => (h ? g(h.text, h) : ""), [h]),
      [z, R] = (0, React.useState)(!1),
      B = (0, React.useRef)(null);
    return (
      (0, React.useEffect)(() => {
        var e;
        z &&
          B.current &&
          C(
            qT(
              LT(
                {},
                ro({
                  width: 310,
                  box: n,
                  offsetY: 4,
                  height:
                    null == (e = B.current)
                      ? void 0
                      : e.getBoundingClientRect().height,
                }),
              ),
              {
                width: "310px",
                zIndex: 2147483647,
              },
            ),
          );
      }, [z, d, B.current]),
      (0, jsxRuntime.jsxs)(q_.div, {
        mode: "open",
        children: [
          (0, jsxRuntime.jsx)("link", {
            onLoad: () => R(!0),
            rel: "stylesheet",
            href: `${props.runtime.scheme}/assets/edreader.css`,
          }),
          h &&
            z &&
            (0, jsxRuntime.jsxs)("div", {
              ref: B,
              onClick: (e) => e.stopPropagation(),
              className: classNames()(
                "rd-theme rd-words-card xor",
                o.theme,
                `lt-${s.translation}`,
              ),
              style: T,
              children: [
                (0, jsxRuntime.jsxs)("div", {
                  className: "rd-words-header",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "rd-words",
                      onClick: () => {
                        k(!w), TT()(props.text || h.text);
                      },
                      children:
                        w &&
                        h.syllables &&
                        (null == (t = h.syllables) ? void 0 : t.length) > 1
                          ? h.syllables.join("\xb7")
                          : props.text,
                    }),
                    null,
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: classNames()("rd-words-phonetic", x),
                  children: [
                    "en" === s.subtitle &&
                      (0, jsxRuntime.jsx)("div", {
                        onClick: () => {
                          const t = f(o.areaPhonetic);
                          y(props.text, t);
                        },
                        className: "pronuntion",
                        children: (0, jsxRuntime.jsx)("span", {
                          children: o.areaPhonetic || "und",
                        }),
                      }),
                    (0, jsxRuntime.jsxs)("div", {
                      onClick: () => y(props.text),
                      className: "phonetic",
                      children: [
                        I,
                        (0, jsxRuntime.jsx)("div", {
                          className: classNames()("icon-voice", x),
                          children: (0, jsxRuntime.jsx)(Ma, {}),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "rd-words-translation",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "rd-dictionary-source",
                      children: "Web Dictionary",
                    }),
                    O.map((e) =>
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()("rd-words-translation-item"),
                        children: [
                          e.pos &&
                            (0, jsxRuntime.jsx)("span", {
                              className: "pos",
                              children: e.pos,
                            }),
                          (0, jsxRuntime.jsx)("span", {
                            children: e.terms
                              .slice(0, 3)
                              .map((e) => e)
                              .join("\uff1b"),
                          }),
                        ],
                      }),
                    ),
                    (0 !== E || N) &&
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-words-translation-item",
                        children: [
                          (0, jsxRuntime.jsx)("span", {
                            className: classNames()("pos ai", {
                              loading: 1 === E,
                            }),
                            children: N
                              ? `AI${N.pos && "AI" !== N.pos ? ` · ${N.pos}` : ""}`
                              : "AI",
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: null == N ? void 0 : N.translation,
                          }),
                        ],
                      }),
                  ],
                }),
                M.length > 0 &&
                  props.text !== h.text &&
                  (0, jsxRuntime.jsxs)("div", {
                    className: "inflection",
                    children: [
                      h.text,
                      "\uff08 ",
                      M.map((e) => c(`rd_sentence_pos_${e}`)).join(" "),
                      " \uff09",
                    ],
                  }),
                d.length > 0 &&
                  (0, jsxRuntime.jsx)("div", {
                    className: "rd-words-phrase xor",
                    children: d.map((t) =>
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-words-phrase-item",
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-words-phrase-item-left",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "rd-words-phrase-text",
                                children: t.text,
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "rd-words-phrase-translation",
                                children: m(t).join(" "),
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "rd-words-phrase-item-right",
                            children: (0, jsxRuntime.jsx)(WordActionButtons, {
                              text: t.text,
                              context: () =>
                                props.wordContext &&
                                qT(LT({}, props.wordContext), {
                                  anchor: qT(LT({}, props.wordContext.anchor), {
                                    form: t.text,
                                  }),
                                }),
                            }),
                          }),
                        ],
                      }),
                    ),
                  }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "rd-words-footer",
                  children: [
                    h.book &&
                      (0, jsxRuntime.jsx)("div", {
                        className: "rd-words-times",
                        children: (0, jsxRuntime.jsx)("span", {
                          children: h.book,
                        }),
                      }),
                    (0, jsxRuntime.jsxs)("div", {
                      className: "rd-words-times",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-12",
                          children: (0, jsxRuntime.jsx)(za, {}),
                        }),
                        (0, jsxRuntime.jsx)("span", {
                          className: "mg-1",
                          children: h.times,
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "tips",
                          children: c("rd_words_times"),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsxs)("div", {
                      className: "rd-words-footer-action",
                      children: [
                        !j &&
                          !o.selectAutoExplain &&
                          (0, jsxRuntime.jsxs)("div", {
                            className: classNames()(
                              "rd-words-details tippy tippy-top",
                              {
                                "new-tag": !l.includes("new-aidict"),
                              },
                            ),
                            onClick: () => {
                              extensionClient.track({
                                name: "word_ai_open",
                              }),
                                l.includes("edvideo-guide-arrow") ||
                                  u(Zn("new-aidict")),
                                i && q(props.text, i);
                            },
                            children: [
                              (0, jsxRuntime.jsx)(Li, {}),
                              (0, jsxRuntime.jsx)("div", {
                                className: "tips",
                                children: c("ai_def"),
                              }),
                            ],
                          }),
                        !j &&
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-words-details tippy tippy-top",
                            onClick: (t) => {
                              t.stopPropagation();
                              const n = new URLSearchParams();
                              i && n.set("contentContext", i);
                              const a = props.wordContext
                                ? `${n.toString() ? "&" : ""}ctx=${((o = props.wordContext), encodeURIComponent(JSON.stringify(o)))}`
                                : "";
                              var o;
                              extensionClient.toggleSlider(
                                `/word/${null == props ? void 0 : props.text}?${n.toString()}${a}`,
                              ),
                                r.unmount();
                            },
                            children: [
                              (0, jsxRuntime.jsx)(Oa, {}),
                              (0, jsxRuntime.jsx)("div", {
                                className: "tips",
                                children: c("ai_detail"),
                              }),
                            ],
                          }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "rd-words-details",
                          onClick: () => {
                            extensionClient.emit("toggleSlider", ["content"], {
                              path: "/setting/selection-mode",
                            });
                          },
                          children: (0, jsxRuntime.jsx)(Ia, {}),
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

  return WordLookupCard;
}
