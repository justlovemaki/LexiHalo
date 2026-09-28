/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverWordbookPage(dependencies) {
  const Fw = dependencies.Fw;
  const Mi = dependencies.Mi;
  const React = dependencies.React;
  const Ta = dependencies.Ta;
  const ar = dependencies.ar;
  const ba = dependencies.ba;
  const classNames = dependencies.classNames;
  const cr = dependencies.cr;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const WordbookPage = (props) => {
    const {
        wordbook: { books: t, book: n },
        user: r,
      } = useAppSelector((e) => e),
      [i, a] = (0, React.useState)(),
      { navigate: o } = useSliderNavigation(),
      { locale: s } = useLocale(),
      l = useApiClient(!0),
      [c, u] = (0, React.useState)(!1),
      { dispatch: d } = useDispatchBridge();
    return (
      (0, React.useEffect)(() => {
        Fw(null, null, function* () {
          const { message: e, data: t } = yield l.getWordbooks();
          "ok" === e &&
            d(
              cr({
                books: t.books,
                book: t.book,
              }),
            );
        });
      }, []),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside rd-page-wordbook",
        id: "trancy-slider",
        children: [
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-nav",
            children: [
              (0, jsxRuntime.jsxs)("div", {
                className: "nav-left",
                onClick: () => o(-1),
                children: [
                  (0, jsxRuntime.jsx)("div", {
                    className: "btn-slider-back",
                    children: (0, jsxRuntime.jsx)("div", {
                      className: "t-icon icon-18",
                      children: (0, jsxRuntime.jsx)(Ta, {}),
                    }),
                  }),
                  (0, jsxRuntime.jsx)("span", {
                    children: s("learning_book_title"),
                  }),
                ],
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "nav-right",
                children: [
                  (0, jsxRuntime.jsxs)("a", {
                    className: "btn-slider-link",
                    onClick: () =>
                      extensionClient.openDashboard(
                        "https://learn.trancy.org/wordbook-import",
                      ),
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "t-icon icon-16",
                        children: (0, jsxRuntime.jsx)(ba, {}),
                      }),
                      (0, jsxRuntime.jsx)("span", {
                        children: s("new_wordbook"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "rd-btn-wordbook",
                    onClick: () =>
                      Fw(null, null, function* () {
                        if (!i) return;
                        u(!0);
                        const e = (null == n ? void 0 : n.name) === i.name,
                          { message: a } = yield l[
                            e ? "deleteBook" : "postWordbooks"
                          ](i.name);
                        if ("ok" === a) {
                          if (
                            (yield d(
                              cr({
                                books: t,
                                book: e ? void 0 : i,
                              }),
                            ),
                            !e)
                          ) {
                            const { message: e, data: t } =
                              yield l.getBookWords();
                            "ok" === e && Array.isArray(t) && (yield d(ar(t)));
                          }
                          extensionClient.rehighlight();
                        }
                        u(!1);
                      }),
                    children: c
                      ? (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-18 loading",
                          children: (0, jsxRuntime.jsx)(Mi, {}),
                        })
                      : (null == i ? void 0 : i.name) &&
                          (null == n ? void 0 : n.name) ===
                            (null == i ? void 0 : i.name)
                        ? s("learning_book_disactive_btn")
                        : s("leanning_book_active_btn"),
                  }),
                ],
              }),
            ],
          }),
          (0, jsxRuntime.jsxs)("div", {
            className: "rd-slider-content",
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "tips",
                children: s("leanring_book_tips"),
              }),
              (0, jsxRuntime.jsx)("div", {
                className: "item-slider-group",
                children: [...t]
                  .sort((e, t) =>
                    e.name === (null == n ? void 0 : n.name) ||
                    (e.uid && t.name !== (null == n ? void 0 : n.name))
                      ? -1
                      : 0,
                  )
                  .map((e) =>
                    (0, jsxRuntime.jsxs)("div", {
                      className: classNames()("item-slider item-wordbook", {
                        active: e.name === (null == n ? void 0 : n.name),
                        selected: (null == i ? void 0 : i.name) === e.name,
                      }),
                      onClick: () => a(e),
                      children: [
                        (0, jsxRuntime.jsx)("img", {
                          src: e.cover,
                          alt: e.title,
                        }),
                        (0, jsxRuntime.jsxs)("div", {
                          className: "wordbook-info",
                          children: [
                            (0, jsxRuntime.jsx)("div", {
                              className: "wordbook-name",
                              children: e.title,
                            }),
                            (0, jsxRuntime.jsx)("div", {
                              className: "wordbook-num",
                              children: e.count,
                            }),
                          ],
                        }),
                        e.name === (null == n ? void 0 : n.name) &&
                          (0, jsxRuntime.jsx)("div", {
                            className: "wordbook-stats",
                            children: s("learning_book_ing"),
                          }),
                      ],
                    }),
                  ),
              }),
            ],
          }),
        ],
      })
    );
  };

  return WordbookPage;
}
