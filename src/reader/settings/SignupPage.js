/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverSignupPage(dependencies) {
  const Cp = dependencies.Cp;
  const Hi = dependencies.Hi;
  const React = dependencies.React;
  const Sa = dependencies.Sa;
  const Ta = dependencies.Ta;
  const Vi = dependencies.Vi;
  const Vn = dependencies.Vn;
  const classNames = dependencies.classNames;
  const extensionClient = dependencies.extensionClient;
  const jsxRuntime = dependencies.jsxRuntime;
  const kp = dependencies.kp;
  const useApiClient = dependencies.useApiClient;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useToast = dependencies.useToast;

  const SignupPage = (props) => {
    const t = useApiClient(!0),
      { locale: n } = useLocale(),
      { navigate: r } = useSliderNavigation(),
      { toast: i, Toast: a } = useToast(),
      [o, s] = (0, React.useState)(""),
      [l, c] = (0, React.useState)(""),
      [u, d] = (0, React.useState)(!1),
      { dispatch: _ } = useDispatchBridge(),
      p = () => {
        return (
          (e = null),
          (a = null),
          (s = function* () {
            if (u) return;
            if (!o || !l) return i.error(n("accountToastError"));
            d(!0);
            const { data: e, message: a } = yield t.signup(o, l);
            if ("ok" !== a) return d(!1), i.error(a);
            (null == e ? void 0 : e.token) &&
              (yield _(Vn(e), !0),
              r("/?first=true"),
              extensionClient.track({
                name: "signup",
              }));
          }),
          new Promise((t, n) => {
            var r = (e) => {
                try {
                  o(s.next(e));
                } catch (e) {
                  n(e);
                }
              },
              i = (e) => {
                try {
                  o(s.throw(e));
                } catch (e) {
                  n(e);
                }
              },
              o = (e) =>
                e.done ? t(e.value) : Promise.resolve(e.value).then(r, i);
            o((s = s.apply(e, a)).next());
          })
        );
        var e, a, s;
      };
    return (
      (0, React.useEffect)(
        () => (
          window.dispatchEvent(new CustomEvent("edvideo:uninstallHotKey")),
          () => {
            window.dispatchEvent(new CustomEvent("edvideo:installHotKey"));
          }
        ),
        [],
      ),
      (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-inside",
        id: "trancy-slider",
        children: [
          (0, jsxRuntime.jsx)(a, {}),
          (0, jsxRuntime.jsx)("div", {
            className: "rd-slider-nav",
            children: (0, jsxRuntime.jsxs)("div", {
              className: "nav-left",
              onClick: () => r(-1),
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "btn-slider-back",
                  children: (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-18",
                    children:
                      extensionClient.history < 1
                        ? (0, jsxRuntime.jsx)(Sa, {})
                        : (0, jsxRuntime.jsx)(Ta, {}),
                  }),
                }),
                (0, jsxRuntime.jsxs)("span", {
                  children: [" ", n("rd_sentence_ai_back")],
                }),
              ],
            }),
          }),
          (0, jsxRuntime.jsxs)("div", {
            className: "form-container",
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "account-tips",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "title",
                  children: n("accountSignupTitle"),
                }),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "trancy-form",
                onKeyDown: (e) => {
                  e.stopPropagation(), "Enter" === e.code && p();
                },
                children: [
                  (0, jsxRuntime.jsx)(kp, {}),
                  (0, jsxRuntime.jsx)(Cp, {}),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "input-group",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon-label",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-18",
                          children: (0, jsxRuntime.jsx)(Hi, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsx)("input", {
                        type: "text",
                        placeholder: n("accountEmail"),
                        value: o,
                        onChange: (e) => s(e.target.value),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "input-group",
                    children: [
                      (0, jsxRuntime.jsx)("div", {
                        className: "icon-label",
                        children: (0, jsxRuntime.jsx)("div", {
                          className: "t-icon icon-18",
                          children: (0, jsxRuntime.jsx)(Vi, {}),
                        }),
                      }),
                      (0, jsxRuntime.jsx)("input", {
                        type: "password",
                        placeholder: n("accountPassword"),
                        value: l,
                        onChange: (e) => c(e.target.value),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: classNames()("trancy-btn login", {
                      loading: u,
                    }),
                    onClick: p,
                    children: [
                      (0, jsxRuntime.jsx)("svg", {
                        viewBox: "25 25 50 50",
                        children: (0, jsxRuntime.jsx)("circle", {
                          r: "20",
                          cy: "50",
                          cx: "50",
                        }),
                      }),
                      (0, jsxRuntime.jsx)("span", {
                        children: n("accountSignupWithEmail"),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: classNames()("trancy-btn outline"),
                    onClick: () => {
                      extensionClient.track({
                        name: "skip_signup",
                      }),
                        r("/");
                    },
                    children: (0, jsxRuntime.jsx)("span", {
                      children: n("skip_signup"),
                    }),
                  }),
                  (0, jsxRuntime.jsx)("div", {
                    className: "form-link",
                    children: (0, jsxRuntime.jsx)("a", {
                      className: "link anchor",
                      onClick: () => {
                        r("/setting/login");
                      },
                      children: n("accountLogin"),
                    }),
                  }),
                  (0, jsxRuntime.jsxs)("div", {
                    className: "agreement",
                    children: [
                      "By sign up, I affirm that I agree to the",
                      (0, jsxRuntime.jsx)("a", {
                        href: "https://manual.trancy.org/en/legal/terms-of-service",
                        target: "_blank",
                        children: "Terms of Use",
                      }),
                      "and I acknowledge that I have read the",
                      (0, jsxRuntime.jsx)("a", {
                        href: "https://manual.trancy.org/en/legal/pravacy-policy",
                        target: "_blank",
                        children: "Privacy Policy",
                      }),
                      ".",
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

  return SignupPage;
}
