/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverInitializeVideoRouter(dependencies) {
  let videoRouter = dependencies.videoRouter;
  const CS = dependencies.CS;
  const DS = dependencies.DS;
  const GS = dependencies.GS;
  const Gf = dependencies.Gf;
  const HS = dependencies.HS;
  const Hv = dependencies.Hv;
  const Ly = dependencies.Ly;
  const QS = dependencies.QS;
  const RS = dependencies.RS;
  const Rx = dependencies.Rx;
  const XS = dependencies.XS;
  const Zx = dependencies.Zx;
  const aC = dependencies.aC;
  const fk = dependencies.fk;
  const gk = dependencies.gk;
  const ik = dependencies.ik;
  const jsxRuntime = dependencies.jsxRuntime;
  const logDebug = dependencies.logDebug;
  const mk = dependencies.mk;
  const qx = dependencies.qx;
  const sb = dependencies.sb;
  const zS = dependencies.zS;
  const zx = dependencies.zx;

  const initializeVideoRouter = (props) => {
    const n = [
      {
        path: "/player",
        element: (0, jsxRuntime.jsx)(Zx, aC({}, props)),
        children: [
          {
            path: "collection/word",
            element: (0, jsxRuntime.jsx)(Rx, aC({}, props)),
          },
          {
            path: "collection/sentence",
            element: (0, jsxRuntime.jsx)(zx, aC({}, props)),
          },
          {
            path: "aiplaylist",
            element: (0, jsxRuntime.jsx)(fk, aC({}, props)),
          },
          {
            path: "word/:text",
            element: (0, jsxRuntime.jsx)(qx, aC({}, props)),
          },
          {
            path: "setting",
            element: (0, jsxRuntime.jsx)(CS, {}),
          },
          {
            path: "options/language",
            element: (0, jsxRuntime.jsx)(RS, aC({}, props)),
          },
          {
            path: "options/theme",
            element: (0, jsxRuntime.jsx)(DS, {}),
          },
          {
            path: "options/shortcuts",
            element: (0, jsxRuntime.jsx)(zS, {}),
          },
          {
            path: "options/font",
            element: (0, jsxRuntime.jsx)(GS, {}),
          },
          {
            path: "options/summary",
            element: (0, jsxRuntime.jsx)(gk, aC({}, props)),
          },
          {
            path: "options/highlight-theme",
            element: (0, jsxRuntime.jsx)(HS, {}),
          },
          {
            path: "options/export-subtitle",
            element: (0, jsxRuntime.jsx)(XS, {}),
          },
        ],
      },
      {
        path: "/",
        element: (0, jsxRuntime.jsx)(Zx, aC({}, props)),
      },
      {
        path: "/practice/speech",
        element: (0, jsxRuntime.jsx)(mk, aC({}, props)),
        children: [
          {
            path: "word/:text",
            element: (0, jsxRuntime.jsx)(qx, aC({}, props)),
          },
          {
            path: "options/shortcuts",
            element: (0, jsxRuntime.jsx)(zS, {}),
          },
          {
            path: "options/grammar",
            element: (0, jsxRuntime.jsx)(QS, aC({}, props)),
          },
        ],
      },
      {
        path: "/practice/typing",
        element: (0, jsxRuntime.jsx)(ik, aC({}, props)),
        children: [
          {
            path: "word/:text",
            element: (0, jsxRuntime.jsx)(qx, aC({}, props)),
          },
          {
            path: "options/shortcuts",
            element: (0, jsxRuntime.jsx)(zS, {}),
          },
          {
            path: "options/grammar",
            element: (0, jsxRuntime.jsx)(QS, aC({}, props)),
          },
        ],
      },
    ];
    return (
      (videoRouter = (function (e, t) {
        return Hv({
          basename: null == t ? void 0 : t.basename,
          future: Ly({}, null == t ? void 0 : t.future, {
            v7_prependBasename: !0,
          }),
          history: Gf({
            initialEntries: null == t ? void 0 : t.initialEntries,
            initialIndex: null == t ? void 0 : t.initialIndex,
          }),
          hydrationData: null == t ? void 0 : t.hydrationData,
          routes: e,
          mapRouteProperties: sb,
          dataStrategy: null == t ? void 0 : t.dataStrategy,
          patchRoutesOnNavigation:
            null == t ? void 0 : t.patchRoutesOnNavigation,
        }).initialize();
      })(n, {
        initialEntries: ["/"],
        initialIndex: 1,
      })),
      logDebug("[routes]", videoRouter),
      videoRouter
    );
  };

  return initializeVideoRouter;
}
