/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverQuickTranslatorPanel(dependencies) {
  const Fn = dependencies.Fn;
  const Jd = dependencies.Jd;
  const React = dependencies.React;
  const Sa = dependencies.Sa;
  const TT = dependencies.TT;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const ka = dependencies.ka;
  const logDebug = dependencies.logDebug;
  const qC = dependencies.qC;
  const q_ = dependencies.q_;
  const so = dependencies.so;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useToast = dependencies.useToast;
  const wa = dependencies.wa;
  const wi = dependencies.wi;
  const xa = dependencies.xa;
  const ya = dependencies.ya;
  const z_ = dependencies.z_;

  const QuickTranslatorPanel = (props) => {
    var t, n;
    const {
        user: r,
        quickTranslator: i,
        translatorService: a,
        setting: { language: o },
        edreader: s,
      } = useAppSelector((e) => e),
      l = (0, React.useRef)(null),
      c = (0, React.useRef)(null),
      [u, d] = (0, React.useState)(i.text),
      [_, p] = (0, React.useState)(i.translation),
      [h, m] = (0, React.useState)(!1),
      [g, f] = (0, React.useState)(1),
      [v, b] = (0, React.useState)(),
      y = (0, React.useRef)(0),
      x = (0, React.useRef)(0),
      w = (0, React.useRef)(0),
      k = (0, React.useRef)(!1),
      { locale: T } = useLocale(),
      { dispatch: C } = useDispatchBridge(),
      { Toast: S, toast: j } = useToast(),
      A = props.quickTranslator.canFillBack(),
      N = [
        {
          code: "auto",
          flag: "auto",
          name: "Auto",
          lang: "auto",
          alias: ["Auto"],
          nativeName: T("auto_select"),
          available: !0,
          tokenize: !1,
          match: ["auto"],
        },
        ...so,
      ],
      P = () => {
        x.current && clearTimeout(x.current),
          (x.current = window.setTimeout(() => {
            l.current
              ? (l.current.focus(),
                (l.current.selectionStart = l.current.selectionEnd =
                  l.current.value.length),
                (l.current.scrollTop = l.current.scrollHeight),
                c.current && (c.current.scrollTop = c.current.scrollHeight))
              : P();
          }, 300));
      };
    (0, React.useEffect)(() => {
      d(i.text), p(i.translation);
    }, [i.translation]),
      (0, React.useEffect)(
        () => (
          h
            ? (f(1),
              (w.current = window.setInterval(() => {
                f((e) => (e >= 3 ? 1 : e + 1));
              }, 300)))
            : w.current && (clearInterval(w.current), (w.current = 0)),
          () => {
            w.current && clearInterval(w.current);
          }
        ),
        [h],
      );
    const E = (e) =>
      qC(null, null, function* () {
        var t;
        if (!e)
          return void C(
            Fn({
              text: "",
              translation: "",
            }),
          );
        m(!0);
        let n = i.quickFrom,
          r = i.quickTo;
        if ("auto" === n) {
          const i = window.detectLanguage(e.slice(0, 300)),
            a =
              null == i
                ? void 0
                : i.some((e) => e.lang === r && e.accuracy > 0.05);
          n = a
            ? o.subtitle
            : (null == (t = null == i ? void 0 : i[0]) ? void 0 : t.lang) ||
              o.subtitle;
          const s = [r, o.translation, o.interface];
          r = s.find((e) => e !== n) || o.translation;
        }
        const s = yield extensionClient.translateWithEngine({
          texts: [e],
          from: n,
          to: r,
          engine: a.sentence,
          cacheScope: "quick",
          useCache: !0,
        });
        m(!1),
          logDebug("translate", {
            data: s,
          });
        const l = s.map((e) => e.translation).join(" ");
        yield C(
          Fn({
            text: e,
            translation: l,
          }),
        );
      });
    (0, React.useEffect)(() => {
      c.current && (c.current.scrollTop = c.current.scrollHeight + 20);
    }, [_]);
    const L = (e) => {
        var t;
        const n = null == (t = null != e ? e : _) ? void 0 : t.trim();
        n && (TT()(n), j.success(T("quick_sentence_copy_toast"), 650));
      },
      q = () => {
        if (h) return;
        const t = _.trim();
        if (t) {
          if (A) {
            const n = props.quickTranslator.fillBack(t);
            logDebug("filled", {
              filled: n,
            });
          } else L(t);
          props.quickTranslator.unmount();
        }
      },
      M = (t) =>
        qC(null, null, function* () {
          switch (!0) {
            case t.metaKey && "c" === t.key:
              t.stopPropagation(),
                t.preventDefault(),
                L(_),
                props.quickTranslator.unmount();
              break;
            case t.metaKey && "Enter" === t.key:
              t.stopPropagation(), t.preventDefault(), q();
              break;
            case "Enter" === t.key:
              t.stopPropagation(), t.preventDefault(), E(u);
              break;
            case "Escape" === t.key:
              t.stopPropagation(),
                t.preventDefault(),
                props.quickTranslator.unmount();
              break;
            case "KeyE" === t.code && t.metaKey && t.shiftKey:
              t.stopPropagation(), t.preventDefault(), I();
          }
        }),
      O = (e) => {
        b(e === v ? void 0 : e);
      },
      I = () =>
        qC(null, null, function* () {
          d(""),
            p(""),
            C(
              Fn({
                quickFrom: i.quickTo,
                quickTo: i.quickFrom,
                text: "",
                translation: "",
              }),
            ),
            j.success(T("quick_sentence_swap_success"), 650);
        });
    (0, React.useEffect)(() => {
      P(),
        extensionClient.track({
          name: "quick_translator_open",
        });
      return (
        [i.quickFrom, i.quickTo].includes("und") &&
          C(
            Fn({
              quickFrom: o.translation,
              quickTo: o.subtitle,
            }),
          ),
        i.text && i.text.trim() && (k.current = !0),
        () => {
          y.current && clearTimeout(y.current);
        }
      );
    }, []),
      (0, React.useEffect)(() => {
        k.current &&
          i.text &&
          i.text.trim() &&
          "und" !== i.quickFrom &&
          "und" !== i.quickTo &&
          ((k.current = !1),
          (y.current = window.setTimeout(() => E(i.text), 500)));
      }, [i.quickFrom, i.quickTo]);
    const [z, R] = (0, React.useState)(!1);
    return (0, jsxRuntime.jsxs)(q_.div, {
      onClick: (e) => {
        e.stopPropagation(), b(void 0);
      },
      onKeyDown: M,
      children: [
        (0, jsxRuntime.jsx)("link", {
          onLoad: () => R(!0),
          rel: "stylesheet",
          href: `${props.runtime.scheme}/assets/edreader.css`,
        }),
        z &&
          (0, jsxRuntime.jsxs)("div", {
            className: classNames()("rd-translator-root rd-theme", s.theme),
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "rd-translator-mask",
              }),
              (0, jsxRuntime.jsx)(S, {}),
              (0, jsxRuntime.jsxs)("div", {
                className: "rd-translator-container xor",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "rd-translator-container-body",
                    children: [
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-translator-target",
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-language-selector",
                            children: [
                              (0, jsxRuntime.jsxs)("div", {
                                className: "rd-language-value",
                                onClick: (e) => {
                                  e.stopPropagation(), O("quickFrom");
                                },
                                children: [
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "t-icon icon-16",
                                    children: (0, jsxRuntime.jsx)(ya, {}),
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    children:
                                      (null ==
                                      (t = N.find(
                                        (e) => e.code === i.quickFrom,
                                      ))
                                        ? void 0
                                        : t.nativeName) ||
                                      T("quick_sentence_select_tips"),
                                  }),
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "t-icon icon-16",
                                    children: (0, jsxRuntime.jsx)(ka, {}),
                                  }),
                                ],
                              }),
                              "quickFrom" === v &&
                                (0, jsxRuntime.jsx)("div", {
                                  className: "dropdown-menu middle",
                                  children: N.map((e) =>
                                    (0, jsxRuntime.jsx)("div", {
                                      className: classNames()("items", {
                                        selected: e.code === i.quickFrom,
                                      }),
                                      onClick: () =>
                                        C(
                                          Fn({
                                            quickFrom: e.code,
                                          }),
                                        ),
                                      children: (0, jsxRuntime.jsx)("span", {
                                        children: e.nativeName,
                                      }),
                                    }),
                                  ),
                                }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)("textarea", {
                            className: "rd-textarea",
                            onChange: (e) => {
                              d(e.target.value),
                                y.current && clearTimeout(y.current),
                                (y.current = window.setTimeout(
                                  () => E(e.target.value),
                                  2e3,
                                ));
                            },
                            onKeyDown: M,
                            value: u,
                            ref: l,
                            name: "source",
                            placeholder: "Enter Text...",
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-translator-swtich",
                        children: [
                          (0, jsxRuntime.jsx)("div", {
                            onClick: I,
                            children: (0, jsxRuntime.jsx)(z_, {
                              provider: "switch",
                            }),
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-tool-tips",
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "content",
                                children: T("quick_sentence_swap_tips"),
                              }),
                              (0, jsxRuntime.jsx)("span", {
                                className: "key",
                                children: "\u2318/Ctrl",
                              }),
                              (0, jsxRuntime.jsx)("span", {
                                className: "key",
                                children: "shift",
                              }),
                              (0, jsxRuntime.jsx)("span", {
                                className: "key",
                                children: "E",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-translator-translation",
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-language-selector",
                            children: [
                              (0, jsxRuntime.jsxs)("div", {
                                className: "rd-language-value",
                                onClick: (e) => {
                                  e.stopPropagation(), O("quickTo");
                                },
                                children: [
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "t-icon icon-16",
                                    children: (0, jsxRuntime.jsx)(xa, {}),
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    children:
                                      (null ==
                                      (n = so.find((e) => e.code === i.quickTo))
                                        ? void 0
                                        : n.nativeName) ||
                                      T("quick_sentence_select_tips"),
                                  }),
                                  (0, jsxRuntime.jsx)("div", {
                                    className: "t-icon icon-16",
                                    children: (0, jsxRuntime.jsx)(ka, {}),
                                  }),
                                ],
                              }),
                              "quickTo" === v &&
                                (0, jsxRuntime.jsx)("div", {
                                  className: "dropdown-menu middle",
                                  children: so.map((e) =>
                                    (0, jsxRuntime.jsx)("div", {
                                      className: classNames()("items", {
                                        selected: e.code === i.quickTo,
                                      }),
                                      onClick: () =>
                                        C(
                                          Fn({
                                            quickTo: e.code,
                                          }),
                                        ),
                                      children: e.nativeName,
                                    }),
                                  ),
                                }),
                            ],
                          }),
                          (0, jsxRuntime.jsx)("textarea", {
                            ref: c,
                            className: "rd-textarea right",
                            value: `${h ? ".".repeat(g) : _}`,
                            onChange: (e) => {
                              p(e.target.value);
                            },
                            onKeyDown: M,
                            name: "target",
                            placeholder: "Translation",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "rd-translator-container-footer",
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
                      (0, jsxRuntime.jsxs)("div", {
                        className: "rd-right-action-group",
                        children: [
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-right-action",
                            onClick: q,
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(wi, {}),
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "rd-tool-tips left",
                                children: [
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "content",
                                    children: T("quick_sentence_fill_tips"),
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "key",
                                    children: "\u2318/Ctrl",
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "key",
                                    children: "\u21b5",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-right-action",
                            onClick: () => L(_),
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(wa, {}),
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "rd-tool-tips",
                                children: [
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "content",
                                    children: T("quick_sentence_copy_tips"),
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "key",
                                    children: "\u2318/Ctrl",
                                  }),
                                  (0, jsxRuntime.jsx)("span", {
                                    className: "key",
                                    children: "C",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-right-action",
                            onClick: () =>
                              qC(null, null, function* () {
                                if (!r)
                                  return extensionClient.toggleSlider(
                                    "/setting/login",
                                  );
                                props.quickTranslator.unmount(),
                                  extensionClient.toggleSlider(
                                    "/setting/translator-engine?activeTab=sentence",
                                  );
                              }),
                            children: [
                              (0, jsxRuntime.jsx)(Jd, {
                                name: a.sentence.icon || a.sentence.provider,
                              }),
                              (0, jsxRuntime.jsx)("div", {
                                className: "rd-tool-tips",
                                children: T("quick_sentence_change_tips"),
                              }),
                            ],
                          }),
                          (0, jsxRuntime.jsxs)("div", {
                            className: "rd-right-action",
                            onClick: () => props.quickTranslator.unmount(),
                            children: [
                              (0, jsxRuntime.jsx)("div", {
                                className: "t-icon icon-14",
                                children: (0, jsxRuntime.jsx)(Sa, {}),
                              }),
                              (0, jsxRuntime.jsxs)("div", {
                                className: "rd-tool-tips",
                                children: [
                                  "Esc ",
                                  T("quick_sentence_esc_tips"),
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
            ],
          }),
      ],
    });
  };

  return QuickTranslatorPanel;
}
