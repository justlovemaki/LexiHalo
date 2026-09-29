/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverPopupApp(dependencies) {
  const React = dependencies.React;
  const englishTranslations = dependencies.englishTranslations;
  const jsxRuntime = dependencies.jsxRuntime;
  const translations = dependencies.translations;

  const RESTRICTED_URL_PATTERNS = [
    /^chrome(-extension|-untrusted|-search|-devtools)?:\/\//i,
    /^edge:\/\//i,
    /^about:/i,
    /^moz-extension:\/\//i,
    /^safari-web-extension:\/\//i,
    /^view-source:/i,
    /^devtools:\/\//i,
    /^https?:\/\/chromewebstore\.google\.com/i,
    /^https?:\/\/chrome\.google\.com\/webstore/i,
    /^https?:\/\/addons\.mozilla\.org/i,
    /^https?:\/\/microsoftedge\.microsoft\.com\/addons/i,
    /^https?:\/\/www\.google\.com\/_\/chrome\/newtab/i,
  ];
  const detectUiLanguage = () => {
    let language = "en";
    try {
      language =
        chrome.i18n?.getUILanguage?.() || navigator.language || "en";
    } catch {}
    if (translations[language]) return language;
    const normalized = language.toLowerCase();
    if (normalized.startsWith("zh")) {
      return /hant|tw|hk|mo/.test(normalized) ? "zh-Hant" : "zh-CN";
    }
    const base = language.split("-")[0];
    return translations[base] ? base : "en";
  };
  const openExtensionPage = (url) => {
    if (!/^https?:/i.test(url)) {
      try {
        chrome.tabs.create({ url });
      } catch {}
    }
    window.close();
  };

  const PopupApp = () => {
    const [e, t] = (0, React.useState)(void 0),
      [i, o] = (0, React.useState)(detectUiLanguage),
      [r, s] = (0, React.useState)(null);
    (0, React.useEffect)(() => {
      let e = !0;
      return (
        new Promise((e) => {
          try {
            chrome.tabs.query(
              {
                active: !0,
                currentWindow: !0,
              },
              (t) => {
                var i;
                chrome.runtime.lastError,
                  e(null == (i = null == t ? void 0 : t[0]) ? void 0 : i.url);
              },
            );
          } catch (t) {
            e(void 0);
          }
        }).then(
          (i) =>
            e &&
            t(
              ((e) => {
                if (!e) return "browser";
                if (RESTRICTED_URL_PATTERNS.some((t) => t.test(e)))
                  return "browser";
                try {
                  return (t = new URL(e).host) &&
                    ("learn.trancy.org" === t ||
                      "localhost" === t ||
                      t.startsWith("localhost:") ||
                      "127.0.0.1" === t ||
                      t.startsWith("127.0.0.1:"))
                    ? "dashboard"
                    : null;
                } catch (e) {
                  return "browser";
                }
                var t;
              })(i),
            ),
        ),
        new Promise((e) => {
          let t = null;
          const i = (i) => {
              clearTimeout(n);
              try {
                null == t || t.disconnect();
              } catch (e) {}
              e(i);
            },
            n = setTimeout(() => i(null), 3e3);
          try {
            (t = chrome.runtime.connect({
              name: "trancy-popup-context",
            })),
              t.onMessage.addListener((e) => {
                i(e && "object" == typeof e ? e : null);
              }),
              t.onDisconnect.addListener(() => {
                chrome.runtime.lastError, i(null);
              });
          } catch (e) {
            i(null);
          }
        }).then((t) => {
          e && t && (s(t), t.uiLang && translations[t.uiLang] && o(t.uiLang));
        }),
        () => {
          e = !1;
        }
      );
    }, []);
    const l = (e) => {
        var t;
        return (
          (null == (t = translations[i]) ? void 0 : t[e]) ||
          englishTranslations[e] ||
          e
        );
      },
      _ = "dashboard" === e;
    return (0, jsxRuntime.jsxs)("div", {
      className: "trancy-popup " + (void 0 !== e ? "ready" : ""),
      children: [
        (0, jsxRuntime.jsxs)("div", {
          className: "trancy-popup-head",
          children: [
            (0, jsxRuntime.jsx)("img", {
              className: "trancy-popup-logo",
              src: "assets/icons/ic48.png",
              alt: "",
            }),
            (0, jsxRuntime.jsx)("span", {
              className: "trancy-popup-brand",
              children: "LexiHalo",
            }),
          ],
        }),
        (0, jsxRuntime.jsx)("div", {
          className: "trancy-popup-title",
          children: l(_ ? "popup_dashboard_title" : "popup_unsupported_title"),
        }),
        (0, jsxRuntime.jsx)("div", {
          className: "trancy-popup-desc",
          children: l(_ ? "popup_dashboard_des" : "popup_unsupported_des"),
        }),
        (0, jsxRuntime.jsx)("div", {
          className: "trancy-popup-actions",
          children: _
            ? (0, jsxRuntime.jsx)("button", {
                className: "trancy-popup-btn primary",
                onClick: () => window.close(),
                children: l("popup_got_it"),
              })
            : (0, jsxRuntime.jsx)("button", {
                className: "trancy-popup-btn primary",
                onClick: () => window.close(),
                children: l("popup_got_it"),
              }),
        }),
      ],
    });
  };

  return PopupApp;
}
