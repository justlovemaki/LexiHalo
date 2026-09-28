/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverSideNavigation(dependencies) {
  const Bf = dependencies.Bf;
  const Qi = dependencies.Qi;
  const React = dependencies.React;
  const Rf = dependencies.Rf;
  const Sa = dependencies.Sa;
  const Xi = dependencies.Xi;
  const classNames = dependencies.classNames;
  const ea = dependencies.ea;
  const extensionClient = dependencies.extensionClient;
  const ga = dependencies.ga;
  const jsxRuntime = dependencies.jsxRuntime;
  const useApiClient = dependencies.useApiClient;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const SideNavigation = (props) => {
    const { navigate: t, router: n } = useSliderNavigation(),
      { tasks: r, setting: i } = useAppSelector((e) => e),
      { locale: a } = useLocale(),
      { dispatch: o } = useDispatchBridge(),
      s = useApiClient(!0),
      [l, c] = (0, React.useState)(null),
      u = () => {
        return (
          (e = null),
          (t = null),
          (n = function* () {
            const { message: e, data: t } = yield s.getNotification();
            "ok" === e && (null == t ? void 0 : t.id) && c(t);
          }),
          new Promise((r, i) => {
            var a = (e) => {
                try {
                  s(n.next(e));
                } catch (e) {
                  i(e);
                }
              },
              o = (e) => {
                try {
                  s(n.throw(e));
                } catch (e) {
                  i(e);
                }
              },
              s = (e) =>
                e.done ? r(e.value) : Promise.resolve(e.value).then(a, o);
            s((n = n.apply(e, t)).next());
          })
        );
        var e, t, n;
      };
    return (0, jsxRuntime.jsx)(Rf, {
      children: (0, jsxRuntime.jsxs)("div", {
        className: "rd-slider-bar",
        children: [
          (0, jsxRuntime.jsx)("div", {
            className: "item-quick-action ",
            onClick: (e) => {
              e.stopPropagation(), extensionClient.toggleSlider();
            },
            children: (0, jsxRuntime.jsx)("div", {
              className: "icon btn-close",
              children: (0, jsxRuntime.jsx)("div", {
                className: "t-icon icon-16",
                children: (0, jsxRuntime.jsx)(Sa, {}),
              }),
            }),
          }),
          (0, jsxRuntime.jsx)("div", {
            onClick: () => {
              t("/"),
                extensionClient.track({
                  name: "sidenav_setting_open",
                });
            },
            className: classNames()("item-quick-action", {
              active: "/" === n.state.location.pathname,
            }),
            children: (0, jsxRuntime.jsx)(Bf, {
              content: a("sidenav_setting"),
              side: "left",
              children: (0, jsxRuntime.jsx)("div", {
                className: "icon",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-16",
                  children:
                    "/" === n.state.location.pathname
                      ? (0, jsxRuntime.jsx)(ea, {})
                      : (0, jsxRuntime.jsx)(Qi, {}),
                }),
              }),
            }),
          }),
          (0, jsxRuntime.jsx)("div", {
            onClick: () => {
              extensionClient.track({
                name: "sidenav_fulltext_translate_open",
              }),
                extensionClient.emit("fulltext-translation", ["content"]);
            },
            className: "item-quick-action",
            children: (0, jsxRuntime.jsx)(Bf, {
              content: a("sidenav_fulltext_translate"),
              side: "left",
              children: (0, jsxRuntime.jsx)("div", {
                className: "icon",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-16",
                  children: (0, jsxRuntime.jsx)(ga, {}),
                }),
              }),
            }),
          }),
          (0, jsxRuntime.jsx)("div", {
            onClick: () => {
              extensionClient.track({
                name: "sidenav_quick_translate_open",
              }),
                extensionClient.emit("quick-translator", ["content"]);
            },
            className: "item-quick-action",
            children: (0, jsxRuntime.jsx)(Bf, {
              content: a("sidenav_quick_translate"),
              side: "left",
              children: (0, jsxRuntime.jsx)("div", {
                className: "icon",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-16",
                  children: (0, jsxRuntime.jsx)(Xi, {}),
                }),
              }),
            }),
          }),
        ],
      }),
    });
  };

  return SideNavigation;
}
