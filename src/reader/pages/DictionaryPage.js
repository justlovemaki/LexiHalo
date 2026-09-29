/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverDictionaryPage(dependencies) {
  const B_ = dependencies.B_;
  const By = dependencies.By;
  const D_ = dependencies.D_;
  const Dy = dependencies.Dy;
  const Fo = dependencies.Fo;
  const Fy = dependencies.Fy;
  const Ho = dependencies.Ho;
  const Ma = dependencies.Ma;
  const R_ = dependencies.R_;
  const React = dependencies.React;
  const Ry = dependencies.Ry;
  const Sa = dependencies.Sa;
  const W_ = dependencies.W_;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const ja = dependencies.ja;
  const jsxRuntime = dependencies.jsxRuntime;
  const lr = dependencies.lr;
  const os = dependencies.os;
  const py = dependencies.py;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDictionary = dependencies.useDictionary;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useSpeech = dependencies.useSpeech;
  const useSseClient = dependencies.useSseClient;
  const zy = dependencies.zy;

  const DictionaryPage = (props) => {
    var t, n, r, i, a, o, s, l, c, u, d, _, p, h, m;
    const {
        config: g,
        user: f,
        edreader: v,
        setting: { language: b },
      } = useAppSelector(
        (e) => ({
          user: e.user,
          edreader: e.edreader,
          config: e.config,
          setting: e.setting,
        }),
        os,
      ),
      y = useApiClient(!0),
      { locale: x } = useLocale(),
      [w, k] = (0, React.useState)(!1),
      T = (function () {
        let { matches: e } = React.useContext(py),
          t = e[e.length - 1];
        return t ? t.params : {};
      })(),
      { dispatch: C } = useDispatchBridge(),
      {
        findWord: S,
        word: j,
        mapPhonetic: A,
        togglePhoneticLocale: N,
      } = useDictionary(!0, C),
      {
        speechWord: P,
        speechStatus: E,
        speechToggle: L,
        stop: q,
      } = useSpeech(),
      { fetchSSE: M } = useSseClient(),
      { navigate: O, router: I } = useSliderNavigation(),
      z = (0, React.useMemo)(
        () =>
          ((e) => {
            if (e)
              try {
                const t = JSON.parse(e);
                if (
                  t &&
                  Array.isArray(t.segments) &&
                  t.segments.length > 0 &&
                  t.anchor
                )
                  return t;
              } catch (e) {}
          })(new URLSearchParams(I.state.location.search).get("ctx")),
        [I.state.location.search],
      ),
      [R, B] = (0, React.useState)(),
      [D, F] = (0, React.useState)(!1),
      [H, V] = (0, React.useState)(),
      [W, $] = (0, React.useState)(""),
      [U, Z] = (0, React.useState)(),
      [K, G] = (0, React.useState)(!1),
      Y = (e) =>
        By(null, null, function* () {
          const t = b.subtitle,
            n = b.translation;
          $(e), F(!0), V(void 0);
          try {
            const { translatorService: r } =
                yield extensionClient.getStateChunks({
                  only: ["translatorService"],
                });
            const isAiEngine = (e) =>
              Boolean(e) &&
              ("user" === e.type ||
                String(e._id || "").startsWith("byok-") ||
                "built-in" !== e.type);
            const preferredEngine =
              [r?.sentence, r?.subtitle, r?.fulltext].find(
                (e) => isAiEngine(e) && r.engines?.some((x) => x._id === e._id),
              ) ||
              r.engines?.find(isAiEngine);
            const i =
              preferredEngine &&
              (r.engines?.find((e) => e._id === preferredEngine._id) || preferredEngine);
            if (!i) throw new Error("请先在 BYOK 设置中配置 AI 模型");
            const a = `You are a professional bilingual lexicographer. Analyze one word from ${t} and explain it in ${n}. Return only valid JSON without Markdown or extra text.`,
              o =
                'Analyze "{{text}}" and return this exact JSON structure: {"syllables":["..."] ,"pronunciations":[{"region":"US","value":"/.../"}],"senses":[{"pos":"noun","definition":[{"translations":["translation in ' +
                n +
                '"],"targetTranslation":"concise definition in ' +
                t +
                '","examples":[{"text":"example sentence in ' +
                t +
                '","translation":"translation in ' +
                n +
                '"}]}]}],"inflections":[{"form":"form label in ' +
                n +
                '","word":"..."}],"etymology":"brief etymology in ' +
                n +
                '","examples":[{"text":"example in ' +
                t +
                '","translation":"translation in ' +
                n +
                '"}],"phrases":[{"text":"common phrase","translations":["translation in ' +
                n +
                '"]}],"synonyms":[{"word":"synonym","translation":"translation in ' +
                n +
                '"}],"relatedWords":[]}. For an English verb, inflections must comprehensively include base form, third-person singular, present participle/gerund (-ing), simple past, past participle, present progressive, past progressive, future progressive, present perfect progressive, past perfect progressive, and future perfect progressive. Use subject-neutral patterns such as am/is/are + verb-ing where auxiliaries vary. For English nouns include singular and plural; for adjectives include positive, comparative, and superlative. Write each form label in ' +
                n +
                ". Use empty arrays or an empty string when a field is unavailable.",
              s = yield extensionClient.translateWithEngine({
                texts: [e],
                from: t,
                to: n,
                engine: {
                  ...i,
                  systemPrompt: a,
                  prompt: o,
                },
                useCache: !1,
              }),
              l = null == s[0] ? void 0 : s[0].translation;
            if (!l)
              throw new Error(
                (null == s[0] ? void 0 : s[0].message) || "AI 详解生成失败",
              );
            let c = String(l).trim();
            const fenceMatch = c.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (fenceMatch) c = fenceMatch[1].trim();
            let u = c.indexOf("{"),
              d = c.lastIndexOf("}");
            let p = null;
            if (u >= 0 && d > u) {
              try {
                p = JSON.parse(c.slice(u, d + 1));
              } catch (_) {}
            }
            if (!p) {
              try {
                p = JSON.parse(c);
              } catch (_) {}
            }
            if (!p || !Array.isArray(p.senses) || p.senses.length === 0) {
              // Fallback: build a minimal valid structure from unstructured AI text or plain translation
              const plain = c.replace(/[{}\[\]"]/g, "").trim();
              p = {
                syllables: [],
                pronunciations: [],
                senses: [
                  {
                    pos: "",
                    definition: [
                      {
                        translations: [plain || l],
                        targetTranslation: "",
                        examples: [],
                      },
                    ],
                  },
                ],
                inflections: [],
                etymology: "",
                examples: [],
                phrases: [],
                synonyms: [],
                relatedWords: [],
              };
            }
            B(p);
          } catch (e) {
            V({
              message: e instanceof Error ? e.message : String(e),
            });
          } finally {
            F(!1);
          }
        }),
      J = () =>
        By(null, null, function* () {
          var e;
          if (!T.text) return;
          const [t] = window.posTagger.tagSentence(T.text),
            n = t.lemma || t.normal || t.value,
            r = yield S(n, {
              withExplain: "en" !== b.subtitle,
            });
          r &&
            C(
              lr(
                Ry(zy({}, r), {
                  times: (null == r ? void 0 : r.times)
                    ? (null == r ? void 0 : r.times) + 1
                    : 1,
                }),
              ),
            ),
            Z(void 0),
            B(void 0);
          const i =
            new URLSearchParams(I.state.location.search).get(
              "contentContext",
            ) ||
            (z
              ? null == (e = z.segments[z.anchor.seg])
                ? void 0
                : e.text
              : null);
          Y(n), k(!0);
        });
    (0, React.useEffect)(() => {
      J();
    }, [T.text]);
    const X = (e) => {
        const t = Dy[Fy(e)];
        if (!t) return e || "";
        const n = x(`rd_sentence_pos_${t.locale}`);
        return n && "--" !== n ? n : e || "";
      },
      Q = (e) => {
        var t, n, r;
        return null !=
          (r = null != (n = null == (t = Dy[Fy(e)]) ? void 0 : t.abbr) ? n : e)
          ? r
          : "";
      },
      ee = [
        T.text || "",
        ...(null !=
        (n =
          null == (t = null == R ? void 0 : R.inflections)
            ? void 0
            : t.map((e) => (null == e ? void 0 : e.word)).filter(Boolean))
          ? n
          : []),
      ],
      [te, ne] = (0, React.useState)(""),
      { active: re, onHighlight: ie, reset: ae } = W_(),
      oe = (e) => {
        const t = te === e ? E : "stop";
        return {
          [t]: !0,
          active: "stop" !== t,
        };
      },
      se = (e, t, n) => {
        var r;
        const { plain: i, segments: a } = Ho(
            B_(null != (r = null == e ? void 0 : e.text) ? r : ""),
            ee,
          ),
          o = "sense" === n,
          s =
            te === i
              ? D_(
                  a.map((e) => e.text),
                  B_(i),
                )
              : null;
        return (0, jsxRuntime.jsxs)(
          "div",
          {
            className: o ? "pos-base-example-sentence" : "item-sentence",
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: o
                  ? "pos-base-example-sentence-text"
                  : "sentence-text",
                children: (() => {
                  const e = (0, jsxRuntime.jsx)("span", {
                    className: classNames()("example-speaker", oe(i)),
                    onClick: () => {
                      return (
                        (e = i),
                        By(null, null, function* () {
                          e &&
                            (te && te !== e && q(),
                            ae(),
                            ne(e),
                            yield L({
                              text: e,
                              onHighlight: ie,
                            }));
                        })
                      );
                      var e;
                    },
                    children: (0, jsxRuntime.jsx)(Ma, {}),
                  });
                  return a.length
                    ? a.map((t, n) => {
                        const r = (e, t) =>
                            s
                              ? (0, jsxRuntime.jsx)(R_, {
                                  text: e,
                                  offset: s[n].start + t,
                                  active: re,
                                })
                              : e,
                          i = n === a.length - 1;
                        let o = t.text,
                          l = "";
                        if (i) {
                          const e = t.text.match(/\S{1,8}\s*$/);
                          e &&
                            void 0 !== e.index &&
                            ((o = t.text.slice(0, e.index)),
                            (l = t.text.slice(e.index)));
                        }
                        const c = i
                          ? (0, jsxRuntime.jsxs)(React.Fragment, {
                              children: [
                                o && r(o, 0),
                                (0, jsxRuntime.jsxs)("span", {
                                  className: "speaker-join",
                                  children: [l && r(l, o.length), e],
                                }),
                              ],
                            })
                          : r(t.text, 0);
                        return t.keyword
                          ? (0, jsxRuntime.jsx)(
                              "span",
                              {
                                className: "sentence-highlight",
                                children: c,
                              },
                              n,
                            )
                          : (0, jsxRuntime.jsx)(
                              React.Fragment,
                              {
                                children: c,
                              },
                              n,
                            );
                      })
                    : e;
                })(),
              }),
              (0, jsxRuntime.jsx)("div", {
                className: o
                  ? "pos-base-example-sentence-translation"
                  : "sentence-translation",
                children: null == e ? void 0 : e.translation,
              }),
            ],
          },
          t,
        );
      },
      le = (null == (r = null == R ? void 0 : R.syllables) ? void 0 : r.length)
        ? R.syllables
        : null == j
          ? void 0
          : j.syllables;
    return (0, jsxRuntime.jsxs)("div", {
      id: "trancy-slider",
      className: "rd-dict",
      onClick: (e) => {
        e.stopPropagation();
      },
      children: [
        (0, jsxRuntime.jsxs)("div", {
          className: "header",
          children: [
            (0, jsxRuntime.jsxs)("div", {
              className: "back-btn",
              onClick: () => extensionClient.toggleSlider(),
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "icon-back",
                  children: (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-16",
                    children: (0, jsxRuntime.jsx)(Sa, {}),
                  }),
                }),
                (0, jsxRuntime.jsx)("span", {
                  className: "title",
                  children: x("DictionaryTitle"),
                }),
              ],
            }),
            null,
          ],
        }),
        w &&
          !j &&
          (0, jsxRuntime.jsx)("div", {
            className: "trancy-slider-container scroll",
            children: (0, jsxRuntime.jsxs)("div", {
              className: "nodata-card",
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "noimg",
                }),
                (0, jsxRuntime.jsxs)("span", {
                  children: [T.text, " has no definition yet."],
                }),
              ],
            }),
          }),
        j &&
          T.text &&
          (0, jsxRuntime.jsxs)("div", {
            className: "trancy-slider-container scroll",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "words-card",
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "rd-words-header",
                    children: (0, jsxRuntime.jsxs)("div", {
                      className: "rd-words-title",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "rd-words",
                          children: T.text,
                        }),
                        le &&
                          le.length > 1 &&
                          (0, jsxRuntime.jsx)("div", {
                            className: "rd-words-syllable",
                            children: le.join("\xb7"),
                          }),
                      ],
                    }),
                  }),
                  !1
                    ? (0, jsxRuntime.jsx)("div", {
                        className: "rd-phonetic-box",
                        children: (() => {
                          const e = new Set();
                          return R.pronunciations
                            .filter((t) => {
                              var n;
                              const r =
                                null != (n = null == t ? void 0 : t.region)
                                  ? n
                                  : "";
                              return !e.has(r) && (e.add(r), !0);
                            })
                            .map((e, t) =>
                              (0, jsxRuntime.jsxs)(
                                "div",
                                {
                                  className: classNames()("item-phonetic", E),
                                  onClick: () => {
                                    var t, n;
                                    const r =
                                      null ==
                                      (n =
                                        null ==
                                        (t = null == e ? void 0 : e.region)
                                          ? void 0
                                          : t.split("-").pop())
                                        ? void 0
                                        : n.toLowerCase();
                                    P(T.text || j.text, "gb" === r ? "uk" : r);
                                  },
                                  children: [
                                    "en" === b.subtitle &&
                                      (null == e ? void 0 : e.region) &&
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "phonetic-lang",
                                        children: e.region.split("-").pop(),
                                      }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "phonetic-text",
                                      children: null == e ? void 0 : e.value,
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "phonetic-icon",
                                      children: (0, jsxRuntime.jsx)(Ma, {}),
                                    }),
                                  ],
                                },
                                t,
                              ),
                            );
                        })(),
                      })
                    : (0, jsxRuntime.jsxs)("div", {
                        className: classNames()("rd-words-phonetic", E),
                        children: [
                          "en" === b.subtitle &&
                            (0, jsxRuntime.jsx)("div", {
                              onClick: () => {
                                const e = N(v.areaPhonetic);
                                P(T.text || j.text, e);
                              },
                              className: "pronuntion",
                              children: (0, jsxRuntime.jsx)("span", {
                                children: v.areaPhonetic || "und",
                              }),
                            }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "phonetic",
                            onClick: () => P(T.text || j.text),
                            children: [
                              A(T.text, j),
                              (0, jsxRuntime.jsx)("div", {
                                className: classNames()("icon-voice", E),
                                children: (0, jsxRuntime.jsx)(Ma, {}),
                              }),
                            ],
                          }),
                        ],
                      }),
                ],
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "trancy-slider-wrapper",
                children: (0, jsxRuntime.jsxs)("div", {
                  className: "rd-dict-definition",
                  children: [
                    (() => {
                      const e = Array.isArray(j.explains)
                        ? j.explains
                        : Array.isArray(j.dict)
                          ? j.dict.map((e) => ({
                              pos: e.pos || "",
                              terms: Array.isArray(e.terms)
                                ? e.terms
                                : Array.isArray(e.entry)
                                  ? e.entry.map((e) => e.word).filter(Boolean)
                                  : [],
                            }))
                          : Array.isArray(j.translation)
                            ? [
                                {
                                  pos: "",
                                  terms: j.translation
                                    .map((e) => e.trans)
                                    .filter(Boolean),
                                },
                              ]
                            : [];
                      return e.length
                        ? (0, jsxRuntime.jsxs)("div", {
                            className: "web-dictionary-box",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "box-title",
                                children: "Web Dictionary",
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "rd-words-translation",
                                children: e.map((e, t) =>
                                  (0, jsxRuntime.jsxs)(
                                    "div",
                                    {
                                      className: "rd-words-translation-item",
                                      children: [
                                        e.pos &&
                                          (0, jsxRuntime.jsx)("span", {
                                            className: "pos",
                                            children: e.pos,
                                          }),
                                        (0, jsxRuntime.jsx)("span", {
                                          children: (e.terms || []).join("；"),
                                        }),
                                      ],
                                    },
                                    t,
                                  ),
                                ),
                              }),
                            ],
                          })
                        : null;
                    })(),
                    (K || U) &&
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()("explain-box", {
                          "explain-loading": K && !U,
                        }),
                        children: [
                          K &&
                            !U &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "explain-skeleton-body",
                              children: [
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "sk-word-row",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "skeleton-line sk-pos",
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "skeleton-line sk-translation",
                                    }),
                                  ],
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "skeleton-line sk-sentence",
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "skeleton-line sk-sentence-tr",
                                }),
                                (0, jsxRuntime.jsx)("div", {
                                  className: "skeleton-line sk-phrase",
                                }),
                              ],
                            }),
                          U &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "section-reveal",
                              children: [
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "explain-word",
                                  children: [
                                    (0, jsxRuntime.jsx)("span", {
                                      className: "explain-pos",
                                      children: Q(
                                        null == (o = U.word) ? void 0 : o.pos,
                                      ),
                                    }),
                                    (0, jsxRuntime.jsx)("span", {
                                      className: "explain-translation",
                                      children:
                                        null == (s = U.word)
                                          ? void 0
                                          : s.translation,
                                    }),
                                  ],
                                }),
                                U.sentence &&
                                  (0, jsxRuntime.jsxs)("div", {
                                    className: "explain-sentence",
                                    children: [
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "explain-sentence-text",
                                        children: Fo(
                                          null != (l = U.sentence.sentence)
                                            ? l
                                            : "",
                                        ),
                                      }),
                                      (0, jsxRuntime.jsx)("div", {
                                        className:
                                          "explain-sentence-translation",
                                        children: Fo(
                                          null != (c = U.sentence.translation)
                                            ? c
                                            : "",
                                        ),
                                      }),
                                    ],
                                  }),
                                (null == (u = U.phrases) ? void 0 : u.length) >
                                  0 &&
                                  (0, jsxRuntime.jsx)("ul", {
                                    className: classNames()("explain-phrases", {
                                      single: 1 === U.phrases.length,
                                    }),
                                    children: U.phrases.map((e, t) => {
                                      var n, r;
                                      return (0, jsxRuntime.jsxs)(
                                        "li",
                                        {
                                          children: [
                                            (0, jsxRuntime.jsx)("span", {
                                              className: "explain-phrase",
                                              children: Fo(
                                                null != (n = e.phrase) ? n : "",
                                              ),
                                            }),
                                            (0, jsxRuntime.jsxs)("span", {
                                              className:
                                                "explain-phrase-translation",
                                              children: [
                                                " ",
                                                Fo(
                                                  null != (r = e.translation)
                                                    ? r
                                                    : "",
                                                ),
                                              ],
                                            }),
                                          ],
                                        },
                                        t,
                                      );
                                    }),
                                  }),
                              ],
                            }),
                        ],
                      }),
                    (D ||
                      (null == (d = null == R ? void 0 : R.senses)
                        ? void 0
                        : d.length)) &&
                      (0, jsxRuntime.jsxs)("div", {
                        className: classNames()("explanation-box", {
                          "explanation-loading":
                            D &&
                            !(null == (_ = null == R ? void 0 : R.senses)
                              ? void 0
                              : _.length),
                        }),
                        children: [
                          D &&
                            !(null == (p = null == R ? void 0 : R.senses)
                              ? void 0
                              : p.length) &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "dict-skeleton-body",
                              children: [
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "sk-pos",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "skeleton-line sk-badge",
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "skeleton-line sk-pos-name",
                                    }),
                                  ],
                                }),
                                [0, 1].map((e) =>
                                  (0, jsxRuntime.jsxs)(
                                    "div",
                                    {
                                      className: "sk-sense",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "skeleton-line sk-def",
                                        }),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "skeleton-line sk-gloss",
                                        }),
                                        (0, jsxRuntime.jsxs)("div", {
                                          className: "sk-example",
                                          children: [
                                            (0, jsxRuntime.jsx)("div", {
                                              className:
                                                "skeleton-line sk-example-1",
                                            }),
                                            (0, jsxRuntime.jsx)("div", {
                                              className:
                                                "skeleton-line sk-example-2",
                                            }),
                                          ],
                                        }),
                                      ],
                                    },
                                    e,
                                  ),
                                ),
                              ],
                            }),
                          !!(null == (h = null == R ? void 0 : R.senses)
                            ? void 0
                            : h.length) &&
                            (0, jsxRuntime.jsx)("div", {
                              className: "section-reveal",
                              children: R.senses.map((e, t) => {
                                var n;
                                return (0, jsxRuntime.jsxs)(
                                  "div",
                                  {
                                    className: "item-explanation",
                                    children: [
                                      (0, jsxRuntime.jsxs)("div", {
                                        className: "pos-headers",
                                        children: [
                                          (0, jsxRuntime.jsx)("div", {
                                            className: "pos-badge",
                                            children: Q(
                                              null == e ? void 0 : e.pos,
                                            ),
                                          }),
                                          (0, jsxRuntime.jsx)("div", {
                                            className: "pos-text",
                                            children: X(
                                              null == e ? void 0 : e.pos,
                                            ),
                                          }),
                                        ],
                                      }),
                                      null ==
                                      (n = null == e ? void 0 : e.definition)
                                        ? void 0
                                        : n.map((e, t) => {
                                            var n, r;
                                            return (0, jsxRuntime.jsxs)(
                                              "div",
                                              {
                                                className:
                                                  "item-explanation-pos-base",
                                                children: [
                                                  (0, jsxRuntime.jsx)("div", {
                                                    className:
                                                      "pos-local-explain",
                                                    children: (0,
                                                    jsxRuntime.jsx)("span", {
                                                      children:
                                                        null ==
                                                        (n =
                                                          null == e
                                                            ? void 0
                                                            : e.translations)
                                                          ? void 0
                                                          : n.join("\uff1b"),
                                                    }),
                                                  }),
                                                  (0, jsxRuntime.jsx)("div", {
                                                    className:
                                                      "pos-orgin-explain",
                                                    children:
                                                      null == e
                                                        ? void 0
                                                        : e.targetTranslation,
                                                  }),
                                                  null ==
                                                  (r =
                                                    null == e
                                                      ? void 0
                                                      : e.examples)
                                                    ? void 0
                                                    : r.map((e, t) =>
                                                        se(e, t, "sense"),
                                                      ),
                                                ],
                                              },
                                              t,
                                            );
                                          }),
                                    ],
                                  },
                                  t,
                                );
                              }),
                            }),
                        ],
                      }),
                    H &&
                      403 !== H.code &&
                      !(null == (m = null == R ? void 0 : R.senses)
                        ? void 0
                        : m.length) &&
                      (0, jsxRuntime.jsxs)("div", {
                        className: "dict-def-error",
                        children: [
                          (0, jsxRuntime.jsx)("span", {
                            className: "dict-def-error-text",
                            children: H.message || x("dict_def_error"),
                          }),
                          (0, jsxRuntime.jsx)("div", {
                            className: "dict-def-btn outline",
                            onClick: () => W && Y(W),
                            children: x("grammar_retry"),
                          }),
                        ],
                      }),
                    R &&
                      (0, jsxRuntime.jsxs)(React.Fragment, {
                        children: [
                          R.inflections &&
                            R.inflections.length > 0 &&
                            (0, jsxRuntime.jsx)("div", {
                              className: "word-form-box",
                              children: R.inflections.map((e, t) =>
                                (0, jsxRuntime.jsxs)(
                                  "div",
                                  {
                                    className: "item-word-form",
                                    children: [
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "word-form-label",
                                        children: null == e ? void 0 : e.form,
                                      }),
                                      (0, jsxRuntime.jsx)("div", {
                                        className: "word-form-value",
                                        children: null == e ? void 0 : e.word,
                                      }),
                                    ],
                                  },
                                  t,
                                ),
                              ),
                            }),
                          R.etymology &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "word-etymology-box",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "box-title",
                                  children: x("dict_etymology"),
                                }),
                                (0, jsxRuntime.jsx)("p", {
                                  children: R.etymology,
                                }),
                              ],
                            }),
                          R.examples &&
                            R.examples.length > 0 &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "sentence-box",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "box-title",
                                  children: x("dict_examples"),
                                }),
                                R.examples.map((e, t) => se(e, t, "list")),
                              ],
                            }),
                          R.phrases &&
                            R.phrases.length > 0 &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "phrase-box",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "box-title",
                                  children: x("dict_phrases"),
                                }),
                                R.phrases.map((e, t) => {
                                  var n, r;
                                  return (0, jsxRuntime.jsxs)(
                                    "div",
                                    {
                                      className: "item-phrase",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "phrase-text",
                                          children: null == e ? void 0 : e.text,
                                        }),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "phrase-translation",
                                          children:
                                            null !=
                                            (r =
                                              null ==
                                              (n =
                                                null == e
                                                  ? void 0
                                                  : e.translations)
                                                ? void 0
                                                : n.join("\uff1b"))
                                              ? r
                                              : null == e
                                                ? void 0
                                                : e.translation,
                                        }),
                                      ],
                                    },
                                    t,
                                  );
                                }),
                              ],
                            }),
                          R.synonyms &&
                            R.synonyms.length > 0 &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "synonym-box",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "box-title",
                                  children: x("dict_synonyms"),
                                }),
                                R.synonyms.map((e, t) =>
                                  (0, jsxRuntime.jsxs)(
                                    "div",
                                    {
                                      className: "item-phrase",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "phrase-text",
                                          children: null == e ? void 0 : e.word,
                                        }),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "phrase-translation",
                                          children:
                                            null == e ? void 0 : e.translation,
                                        }),
                                      ],
                                    },
                                    t,
                                  ),
                                ),
                              ],
                            }),
                          R.relatedWords &&
                            R.relatedWords.length > 0 &&
                            (0, jsxRuntime.jsxs)("div", {
                              className: "root-word-box",
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "box-title",
                                  children: x("dict_related_words"),
                                }),
                                R.relatedWords.map((e, t) =>
                                  (0, jsxRuntime.jsxs)(
                                    "div",
                                    {
                                      className: "item-phrase",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "phrase-text",
                                          children: null == e ? void 0 : e.word,
                                        }),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "phrase-translation",
                                          children:
                                            null == e ? void 0 : e.meaning,
                                        }),
                                      ],
                                    },
                                    t,
                                  ),
                                ),
                              ],
                            }),
                        ],
                      }),
                  ],
                }),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "trancy-slider-footer",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "label",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "t-icon icon-16",
                        children: (0, jsxRuntime.jsx)(ja, {}),
                      }),
                      x("ExtenalDictionary"),
                    ],
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "item-dict-wrapper",
                    children: (g.schemes && g.schemes.length > 0
                      ? g.schemes
                      : [
                          {
                            name: "Oxford",
                            scheme:
                              "https://www.oxfordlearnersdictionaries.com/definition/english/$TEXT",
                            codes: { en: "english" },
                            options: { width: 450, height: 750, type: "popup" },
                          },
                          {
                            name: "Collins",
                            scheme:
                              "https://www.collinsdictionary.com/dictionary/english/$TEXT",
                            codes: { en: "english" },
                            options: { width: 450, height: 750, type: "popup" },
                          },
                          {
                            name: "Longman",
                            scheme:
                              "https://www.ldoceonline.com/dictionary/$TEXT",
                            codes: { en: "english" },
                            options: { width: 450, height: 750, type: "popup" },
                          },
                          {
                            name: "Youdao",
                            scheme: "https://dict.youdao.com/w/$TEXT",
                            codes: {},
                            options: { width: 450, height: 750, type: "popup" },
                          },
                        ]
                    ).map((e, t) =>
                      (0, jsxRuntime.jsx)(
                        "div",
                        {
                          className: "item-dict",
                          onClick: () =>
                            ((e) => {
                              if (!j) return;
                              const t = e.codes[b.subtitle] || b.subtitle,
                                n = e.codes[b.translation] || b.translation,
                                r = e.scheme
                                  .replace(/\$TEXT/g, j.text)
                                  .replace(/\$FROM/g, t)
                                  .replace(/\$TO/g, n);
                              let { width: i, height: a } = e.options || {},
                                o = 0,
                                s = 0;
                              if (i && a) {
                                const t = Math.ceil(
                                    window.screen.width / 2 - Number(i) / 2,
                                  ),
                                  n = Math.ceil(
                                    window.screen.height / 2 - Number(a) / 2,
                                  );
                                (s = e.options.left
                                  ? Number(e.options.left)
                                  : t),
                                  (o = e.options.top
                                    ? Number(e.options.top)
                                    : n);
                              }
                              const l = Ry(
                                zy(
                                  {
                                    url: r,
                                  },
                                  e.options || {},
                                ),
                                {
                                  left: s,
                                  top: o,
                                },
                              );
                              extensionClient.createWindow(l);
                            })(e),
                          children: e.name,
                        },
                        t,
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

  return DictionaryPage;
}
