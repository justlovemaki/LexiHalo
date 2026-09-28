/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverWordActionButtons(dependencies) {
  const Ba = dependencies.Ba;
  const Da = dependencies.Da;
  const Fa = dependencies.Fa;
  const Gf = dependencies.Gf;
  const Ha = dependencies.Ha;
  const Kf = dependencies.Kf;
  const React = dependencies.React;
  const Zf = dependencies.Zf;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const logWarning = dependencies.logWarning;
  const lr = dependencies.lr;
  const os = dependencies.os;
  const qp = dependencies.qp;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const vocabularyHighlighter = dependencies.vocabularyHighlighter;

  const WordActionButtons = (props) => {
    const {
        words: t,
        user: n,
        language: r,
      } = useAppSelector(
        (e) => ({
          words: e.words,
          user: e.user,
          language: e.setting.language,
        }),
        os,
      ),
      i = t.find(
        (t) =>
          t.text &&
          props.text &&
          t.text.toLowerCase() === props.text.toLowerCase(),
      ),
      a = useApiClient(!0),
      { locale: o } = useLocale(),
      s = props.navigate || extensionClient.toggleSlider.bind(extensionClient),
      { dispatch: l, nativeDispatch: c } = useDispatchBridge(),
      u = `${r.subtitle}_${r.translation}`;
    if (!i) return (0, jsxRuntime.jsx)(jsxRuntime.Fragment, {});
    const d = () => {
        var t;
        try {
          const n = null == (t = props.context) ? void 0 : t.call(props);
          n && a.postWordContext(i.text, n).catch(() => {});
        } catch (e) {
          logWarning("[WordAction.context]", e);
        }
      },
      _ = (e) => {
        e.star && !e.master
          ? vocabularyHighlighter.highlightWord(e)
          : vocabularyHighlighter.unhighlightWord(e.text);
      },
      p = i && i.star,
      h = i && i.master;
    return (0, jsxRuntime.jsxs)(React.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(qp, {
          tips: o(h ? "TooltipForgotWord" : "TooltipKnowWord"),
          children: (0, jsxRuntime.jsx)("div", {
            className: "btn-words-action",
            onClick: (e) =>
              ((e, t) =>
                Gf(null, null, function* () {
                  var r;
                  if ((e.stopPropagation(), !n)) return s("/setting/signup");
                  c(
                    lr(
                      Kf(Zf(Zf({}, i), t), {
                        stl: null != (r = i.stl) ? r : u,
                      }),
                    ),
                  ),
                    _(Zf(Zf({}, i), t));
                  const {
                    code: o,
                    message: p,
                    data: h,
                  } = yield a.patchWord(i.text, t);
                  return (
                    "ok" === p && (l(lr(Zf(Zf({}, i), h))), t.star && d()),
                    void 0
                  );
                }))(e, {
                master: !h,
              }),
            children: (0, jsxRuntime.jsx)("div", {
              className: classNames()("t-icon icon-22", {
                anchor: h,
              }),
              children: h
                ? (0, jsxRuntime.jsx)(Da, {})
                : (0, jsxRuntime.jsx)(Ba, {}),
            }),
          }),
        }),
        (0, jsxRuntime.jsx)(qp, {
          tips: o(p ? "TooltipRemoveWord" : "TooltipSaveWord"),
          children: (0, jsxRuntime.jsx)("div", {
            className: "btn-words-action",
            onClick: (e) =>
              ((e, t) =>
                Gf(null, null, function* () {
                  var r;
                  if ((e.stopPropagation(), !n)) return s("/setting/signup");
                  c(
                    lr(
                      Kf(Zf({}, i), {
                        star: t,
                        stl: null != (r = i.stl) ? r : u,
                      }),
                    ),
                  ),
                    _(
                      Kf(Zf({}, i), {
                        star: t,
                      }),
                    );
                  const {
                    code: o,
                    message: p,
                    data: h,
                  } = yield a.postWords(
                    Kf(Zf({}, i), {
                      star: t,
                    }),
                  );
                  return (
                    "ok" === p &&
                      (l(
                        lr(
                          Kf(Zf(Zf({}, i), h), {
                            star: t,
                          }),
                        ),
                      ),
                      t && d()),
                    void 0
                  );
                }))(e, !p),
            children: (0, jsxRuntime.jsx)("div", {
              className: classNames()("t-icon icon-20 heart-rd", {
                red: p,
              }),
              children: p
                ? (0, jsxRuntime.jsx)(Ha, {})
                : (0, jsxRuntime.jsx)(Fa, {}),
            }),
          }),
        }),
      ],
    });
  };

  return WordActionButtons;
}
