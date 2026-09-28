/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverVocabularyPage(dependencies) {
  let sk = dependencies.sk;
  const Ca = dependencies.Ca;
  const Di = dependencies.Di;
  const Ma = dependencies.Ma;
  const React = dependencies.React;
  const SideNavigation = dependencies.SideNavigation;
  const WordActionButtons = dependencies.WordActionButtons;
  const ak = dependencies.ak;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const fn = dependencies.fn;
  const getLearningLanguage = dependencies.getLearningLanguage;
  const gt = dependencies.gt;
  const gv = dependencies.gv;
  const hn = dependencies.hn;
  const ik = dependencies.ik;
  const ja = dependencies.ja;
  const jsxRuntime = dependencies.jsxRuntime;
  const ka = dependencies.ka;
  const matchesUrlRule = dependencies.matchesUrlRule;
  const mn = dependencies.mn;
  const oi = dependencies.oi;
  const ok = dependencies.ok;
  const oo = dependencies.oo;
  const pa = dependencies.pa;
  const useAppSelector = dependencies.useAppSelector;
  const useDictionary = dependencies.useDictionary;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useSpeech = dependencies.useSpeech;
  const useWordSync = dependencies.useWordSync;
  const vn = dependencies.vn;
  const yi = dependencies.yi;
  const za = dependencies.za;

  const VocabularyPage = (props) => {
    var t, n, r;
    const {
        wordbook: i,
        words: a,
        user: o,
        setting: s,
        edreader: l,
        dualCaption: c,
      } = useAppSelector((e) => e),
      { navigate: u } = useSliderNavigation(),
      { locale: d } = useLocale(),
      { mapExplains: _, mapPhonetic: p } = useDictionary(!0),
      { speechWord: h, speechStatus: m } = useSpeech(),
      [g, f] = (0, React.useState)(!1),
      v = window.location.hostname,
      b = window.location.href,
      y = null != (t = s.wordHighlightMode) ? t : "blacklist",
      x = null != (n = s.blacklist) ? n : [],
      w = null != (r = s.wordHighlightWhitelist) ? r : [],
      k = (0, React.useMemo)(() => {
        var e;
        return null == (e = x.find((e) => matchesUrlRule(b, e.host)))
          ? void 0
          : e.host;
      }, [x, b]),
      T = (0, React.useMemo)(() => {
        var e;
        return null == (e = w.find((e) => matchesUrlRule(b, e.host)))
          ? void 0
          : e.host;
      }, [w, b]),
      C = !!k,
      S = !!T,
      j = "whitelist" === y ? S : !C,
      A = "whitelist" === y ? w.length : x.length,
      { syncUpdatedWords: N, syncWordBook: P } = useWordSync(),
      [E, L] = (0, React.useState)([]),
      [q, M] = (0, React.useState)([]),
      O = (0, React.useMemo)(() => a.filter((e) => e.star).length, [a]),
      { dispatch: I } = useDispatchBridge(),
      z = "und" !== getLearningLanguage(),
      R = z,
      [B, D] = (0, React.useState)(!1),
      F = !1 !== (null == c ? void 0 : c.subtitleHighlight),
      [H, V] = (0, React.useState)(!1),
      W = () => {
        var e, t, n, r;
        let i,
          o = "";
        if (R) {
          const t = gt(getLearningLanguage());
          D(t);
          const n = t
            ? null
            : (() => {
                var e, t;
                const n = document.getElementById("trancy-caption-corpus");
                if (!n) return null;
                const r =
                  null != (t = null == (e = n.content) ? void 0 : e.textContent)
                    ? t
                    : "";
                return r.trim() ? r : null;
              })();
          V(null !== n),
            (o = `corpus|${window.location.href}|${null != (e = null == n ? void 0 : n.length) ? e : 0}`),
            (i = () => (null != n ? n : ""));
        } else
          (o = `page|${window.location.href}|${null != (r = null == (n = null == (t = document.body) ? void 0 : t.textContent) ? void 0 : n.length) ? r : 0}`),
            (i = () => document.body.innerText);
        const s = (null == sk ? void 0 : sk.key) === o,
          l = s
            ? sk.set
            : ((e) => {
                const t = e ? window.posTagger.tagSentence(e) : [];
                return new Set(t.map((e) => e.lemma || e.value || e.normal));
              })(i());
        s ||
          (sk = {
            key: o,
            set: l,
          });
        const c = a.filter(
          (e) => !e.master && (e.book || e.star) && l.has(e.text),
        );
        L(c), f(!0);
      };
    return (
      (0, React.useEffect)(() => {
        const e = ((e, t = 500) => {
          const n = window;
          if ("function" == typeof n.requestIdleCallback) {
            const r = n.requestIdleCallback(e, {
              timeout: t,
            });
            return () => n.cancelIdleCallback(r);
          }
          const r = window.setTimeout(e, 300);
          return () => window.clearTimeout(r);
        })(W);
        if (!R) return e;
        const t = () => W();
        return (
          window.addEventListener(oo, t),
          () => {
            e(), window.removeEventListener(oo, t);
          }
        );
      }, [a]),
      (0, React.useEffect)(() => {
        N(), P();
      }, []),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider rd-slider-my",
        id: "trancy-slider",
        children: [
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-container",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "rd-slider-header",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "brand",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "logo",
                        children: (0, jsxRuntime.jsx)(yi, {}),
                      }),
                      (0, jsxRuntime.jsx)("div", {
                        className: "title",
                        children: "LexiHalo",
                      }),
                    ],
                  }),
                  o &&
                    (0, jsxRuntime.jsxs)("div", {
                      onClick: () => {},
                      className: "vip-tag premium",
                      children: [
                        "Free Access",
                        (null == o ? void 0 : o.AIEngineExpired) &&
                        (null == o ? void 0 : o.AIEngineExpired) > Date.now()
                          ? (0, jsxRuntime.jsx)("span", {
                              children: " + AI",
                            })
                          : "",
                      ],
                    }),
                ],
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "rd-slider-content",
                children: [
                  "en" !== s.language.subtitle &&
                    (0, jsxRuntime.jsx)("div", {
                      className: "rd-word-item-card",
                      children: (0, jsxRuntime.jsxs)("div", {
                        className: "rd-empty",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            className: "t-icon icon-24",
                            children: (0, jsxRuntime.jsx)(Di, {}),
                          }),
                          (0, jsxRuntime.jsx)("span", {
                            children: d("my_not_support"),
                          }),
                        ],
                      }),
                    }),
                  "en" === s.language.subtitle &&
                    (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
                      children: [
                        (0, jsxRuntime.jsxs)("div", {
                          className: "my-cards-group",
                          children: [
                            (0, jsxRuntime.jsxs)("div", {
                              className: "item-my-cards",
                              onClick: () => {
                                if (
                                  (extensionClient.track({
                                    name: "sidenav_wordlist_open",
                                  }),
                                  !o)
                                )
                                  return u("/setting/login");
                                u("/wordlist");
                              },
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "my-cards-icon wordlist",
                                }),
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "my-cards-content",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "number",
                                      children: O,
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "title",
                                      children: d("my_vocabulary"),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, jsxRuntime.jsxs)("div", {
                              className: "item-my-cards",
                              onClick: () => {
                                if (
                                  (extensionClient.track({
                                    name: "sidenav_wordbook_open",
                                  }),
                                  !o)
                                )
                                  return u("/setting/login");
                                u("/setting/wordbook");
                              },
                              children: [
                                (0, jsxRuntime.jsx)("div", {
                                  className: "my-cards-icon learnbook",
                                }),
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "my-cards-content",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "number",
                                      children: i.book
                                        ? i.book.title
                                        : d("my_learning_book_choose"),
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "title",
                                      children: d("my_learning_book"),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        !z &&
                          !l.wordHighlight &&
                          (0, jsxRuntime.jsx)("div", {
                            className: "highlight-off-card",
                            children: (0, jsxRuntime.jsxs)("div", {
                              className: "highlight-off-card-content",
                              children: [
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "highlight-off-card-title",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "t-icon icon-20",
                                      children: (0, jsxRuntime.jsx)(pa, {}),
                                    }),
                                    d("settingExportCaptionWordsHighlight"),
                                  ],
                                }),
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "right-action",
                                  onClick: () => {
                                    u("/setting/highlight-sitelist");
                                  },
                                  children: [
                                    (0, jsxRuntime.jsx)("span", {
                                      children: d("rd_closed_already"),
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
                        !z &&
                          l.wordHighlight &&
                          (0, jsxRuntime.jsx)("div", {
                            className: "rd-word-highlight-card",
                            children: (0, jsxRuntime.jsxs)("div", {
                              className: "rd-word-highlight-card-content",
                              children: [
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "card-switch-group",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "card-switch-title",
                                      children: d("always_open_highlight"),
                                    }),
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "card-switch",
                                      onClick: () =>
                                        ok(null, null, function* () {
                                          extensionClient.track({
                                            name: "wordlist_highlight_site_toggle",
                                            event_value: `${y}:${v}`,
                                          }),
                                            "whitelist" === y
                                              ? S
                                                ? yield I(
                                                    vn({
                                                      host: T || v,
                                                    }),
                                                  )
                                                : yield I(
                                                    fn({
                                                      host: v,
                                                    }),
                                                  )
                                              : C
                                                ? yield I(
                                                    mn({
                                                      host: k || v,
                                                    }),
                                                  )
                                                : yield I(
                                                    hn({
                                                      host: v,
                                                    }),
                                                  ),
                                            extensionClient.rehighlight();
                                        }),
                                      children: (0, jsxRuntime.jsx)("input", {
                                        type: "checkbox",
                                        className: "rd-switch",
                                        checked: j,
                                        readOnly: !0,
                                      }),
                                    }),
                                  ],
                                }),
                                (0, jsxRuntime.jsxs)("div", {
                                  className: "card-url-host",
                                  children: [
                                    (0, jsxRuntime.jsx)("div", {
                                      className: "card-left-host",
                                      children: v.replace(/^www\./, ""),
                                    }),
                                    (0, jsxRuntime.jsxs)("div", {
                                      className: "highlight-rule-text",
                                      onClick: () => {
                                        extensionClient.track({
                                          name: "wordlist_highlight_rule_open",
                                        }),
                                          u("/setting/highlight-sitelist");
                                      },
                                      children: [
                                        l.wordHighlight
                                          ? `${d(`highlight_mode_${y}`)} \xb7 ${A}`
                                          : d("rd_closed_already"),
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "t-icon icon-16",
                                          children: (0, jsxRuntime.jsx)(Ca, {}),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        z &&
                          (0, jsxRuntime.jsx)("div", {
                            className: "rd-word-highlight-card",
                            children: (0, jsxRuntime.jsx)("div", {
                              className: "rd-word-highlight-card-content",
                              children: (0, jsxRuntime.jsxs)("div", {
                                className: "card-switch-group",
                                children: [
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "card-switch-title",
                                    children: d("subtitle_highlight_title"),
                                  }),
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "card-switch",
                                    onClick: () =>
                                      ok(null, null, function* () {
                                        const e = !F;
                                        extensionClient.track({
                                          name: "wordlist_subtitle_highlight_toggle",
                                          value: e ? "on" : "off",
                                        }),
                                          yield I(oi(e), !0);
                                      }),
                                    children: (0, jsxRuntime.jsx)("input", {
                                      type: "checkbox",
                                      className: "rd-switch",
                                      checked: F,
                                      readOnly: !0,
                                    }),
                                  }),
                                ],
                              }),
                            }),
                          }),
                        (0, jsxRuntime.jsxs)("div", {
                          className: "rd-word-item-card",
                          children: [
                            g &&
                              E.length > 0 &&
                              (0, jsxRuntime.jsxs)("div", {
                                className: "label-divider",
                                children: [
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "label",
                                    children: d(
                                      R
                                        ? "my_video_words"
                                        : "my_highlight_words",
                                    ),
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "count-num",
                                    children: E.length,
                                  }),
                                  (0, jsxRuntime.jsx)("div", {
                                    className:
                                      "btn-expand-all " +
                                      (q.length === E.length ? "active" : ""),
                                    onClick: () => {
                                      extensionClient.track({
                                        name: "wordlist_expand_all_toggle",
                                      }),
                                        q.length > 0
                                          ? M([])
                                          : M(E.map((e) => e.text));
                                    },
                                    children:
                                      q.length === E.length
                                        ? (0, jsxRuntime.jsxs)("span", {
                                            children: [
                                              d("collapse_definition"),
                                              " ",
                                              (0, jsxRuntime.jsx)(ka, {}),
                                            ],
                                          })
                                        : (0, jsxRuntime.jsxs)("span", {
                                            children: [
                                              d("expand_definition"),
                                              " ",
                                              (0, jsxRuntime.jsx)(ka, {}),
                                            ],
                                          }),
                                  }),
                                ],
                              }),
                            g &&
                              0 === E.length &&
                              (0, jsxRuntime.jsx)(
                                gv,
                                ak(ik({}, props), {
                                  text: B
                                    ? d("my_video_words_not_watching")
                                    : R && !H
                                      ? d("my_video_words_empty")
                                      : void 0,
                                }),
                              ),
                            (0, jsxRuntime.jsx)("div", {
                              className: "word-item-group",
                              children: E.map((e) =>
                                (0, jsxRuntime.jsxs)("div", {
                                  className: classNames()("word-item", {
                                    active: q.includes(e.text),
                                  }),
                                  onClick: () => {
                                    return (
                                      (t = e.text),
                                      ok(null, null, function* () {
                                        extensionClient.track({
                                          name: "wordlist_word_toggle",
                                        }),
                                          q.includes(t)
                                            ? M(q.filter((e) => e !== t))
                                            : (M([...q, t]),
                                              l.selectAutoSpeech && h(t));
                                      })
                                    );
                                    var t;
                                  },
                                  children: [
                                    (0, jsxRuntime.jsxs)("div", {
                                      className: "word-top",
                                      children: [
                                        (0, jsxRuntime.jsx)("div", {
                                          className: "wordbook-name",
                                          children: e.text,
                                        }),
                                        (0, jsxRuntime.jsxs)("div", {
                                          className: "right-action",
                                          children: [
                                            (0, jsxRuntime.jsx)(
                                              WordActionButtons,
                                              {
                                                text: e.text,
                                              },
                                            ),
                                            (0, jsxRuntime.jsx)("div", {
                                              className: "item-action expand",
                                              children: (0, jsxRuntime.jsx)(
                                                "div",
                                                {
                                                  className: "t-icon icon-20",
                                                  children: (0, jsxRuntime.jsx)(
                                                    ja,
                                                    {},
                                                  ),
                                                },
                                              ),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    q.includes(e.text) &&
                                      (0, jsxRuntime.jsxs)("div", {
                                        className: "word-detail",
                                        children: [
                                          (0, jsxRuntime.jsx)("div", {
                                            className:
                                              classNames()("rd-words-phonetic"),
                                            children: (0, jsxRuntime.jsxs)(
                                              "div",
                                              {
                                                className: "phonetic",
                                                onClick: (t) => {
                                                  t.stopPropagation(),
                                                    h(e.text);
                                                },
                                                children: [
                                                  (0, jsxRuntime.jsx)("div", {
                                                    className: classNames()(
                                                      "icon-voice",
                                                      m,
                                                    ),
                                                    children: (0,
                                                    jsxRuntime.jsx)("div", {
                                                      className:
                                                        "t-icon icon-16",
                                                      children: (0,
                                                      jsxRuntime.jsx)(Ma, {}),
                                                    }),
                                                  }),
                                                  (0, jsxRuntime.jsxs)("span", {
                                                    children: [
                                                      " ",
                                                      p(e.text, e),
                                                    ],
                                                  }),
                                                ],
                                              },
                                            ),
                                          }),
                                          (0, jsxRuntime.jsx)("div", {
                                            className: "rd-words-translation",
                                            children: _(e).map((e) =>
                                              (0, jsxRuntime.jsxs)("p", {
                                                className: classNames()(
                                                  "rd-words-translation-item",
                                                ),
                                                children: [
                                                  e.pos &&
                                                    (0, jsxRuntime.jsx)(
                                                      "span",
                                                      {
                                                        className: "pos",
                                                        children: e.pos,
                                                      },
                                                    ),
                                                  (0, jsxRuntime.jsx)("span", {
                                                    children:
                                                      e.terms.join("\uff1b"),
                                                  }),
                                                ],
                                              }),
                                            ),
                                          }),
                                          e.times &&
                                            e.times > 0 &&
                                            (0, jsxRuntime.jsxs)("div", {
                                              className: "rd-words-times",
                                              children: [
                                                (0, jsxRuntime.jsx)("div", {
                                                  className: "t-icon icon-12",
                                                  children: (0, jsxRuntime.jsx)(
                                                    za,
                                                    {},
                                                  ),
                                                }),
                                                (0, jsxRuntime.jsx)("span", {
                                                  className: "mg-1",
                                                  children: e.times,
                                                }),
                                                (0, jsxRuntime.jsx)("div", {
                                                  className: "tips",
                                                  children: d("rd_words_times"),
                                                }),
                                              ],
                                            }),
                                        ],
                                      }),
                                  ],
                                }),
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsx)(SideNavigation, ik({}, props)),
        ],
      })
    );
  };

  return VocabularyPage;
}
