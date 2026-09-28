/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverVoiceSettings(dependencies) {
  const Bi = dependencies.Bi;
  const Jc = dependencies.Jc;
  const Ma = dependencies.Ma;
  const React = dependencies.React;
  const SpeechSynthesisUtterance = dependencies.SpeechSynthesisUtterance;
  const Ta = dependencies.Ta;
  const Xc = dependencies.Xc;
  const au = dependencies.au;
  const classNames = dependencies.classNames;
  const dn = dependencies.dn;
  const eu = dependencies.eu;
  const iu = dependencies.iu;
  const jsxRuntime = dependencies.jsxRuntime;
  const nu = dependencies.nu;
  const ou = dependencies.ou;
  const ru = dependencies.ru;
  const su = dependencies.su;
  const tx = dependencies.tx;
  const un = dependencies.un;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const VoiceSettings = (props) => {
    const {
        language: t,
        voice: n,
        user: r,
        ttsEngine: i,
      } = useAppSelector((e) => ({
        voice: e.setting.voice,
        language: e.setting.language,
        user: e.user,
        ttsEngine: e.setting.ttsEngine,
      })),
      a = eu(!0),
      o = (0, React.useMemo)(() => nu(a, t.subtitle), [a, t.subtitle]),
      s = (0, React.useMemo)(
        () =>
          ((e, t) => {
            var n;
            const r = new Map();
            e.forEach((e) => {
              const t = r.get(e.locale);
              t ? t.push(e) : r.set(e.locale, [e]);
            });
            const i = null != (n = Xc[t]) ? n : Xc[Jc(t)];
            return [...r.entries()]
              .map(([e, t]) => ({
                locale: e,
                label: au(t[0]),
                items: t,
              }))
              .sort((e, t) =>
                e.locale === i
                  ? -1
                  : t.locale === i
                    ? 1
                    : t.items.length - e.items.length ||
                      e.locale.localeCompare(t.locale),
              );
          })(o, t.subtitle),
        [o, t.subtitle],
      ),
      l = s.length > 1,
      c = "azure" === i,
      u = null != n ? n : su(a, t.subtitle),
      { navigate: d } = useSliderNavigation(),
      { locale: _ } = useLocale(),
      { dispatch: p } = useDispatchBridge(),
      [h, m] = (0, React.useState)(""),
      g = (0, React.useRef)(new Audio()),
      f = () => {
        var e;
        g.current.pause(),
          null == (e = window.speechSynthesis) || e.cancel(),
          m("");
      };
    (0, React.useEffect)(() => () => f(), []);
    const v = (e, t) => {
        const n = h === e;
        f(), n || (m(e), t());
      },
      b = (e) => _("Male" === e.gender ? "rd_voice_male" : "rd_voice_female"),
      y = (e) => ("hd" === ru(e.voiceId) ? _("rd_voice_tier_hd") : ""),
      x = (e, t) =>
        (0, jsxRuntime.jsx)(
          "div",
          {
            className: "voice-group-head",
            children: e,
          },
          `head-${t}`,
        ),
      w = (e) => {
        const t = h === e.key,
          n = "Male" === e.gender;
        return (0, jsxRuntime.jsxs)(
          "div",
          {
            className: classNames()("voice-item", {
              selected: e.checked,
            }),
            onClick: e.onPick,
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: classNames()("voice-preview", {
                  playing: t,
                }),
                onClick: (t) => {
                  t.stopPropagation(), e.onPreview();
                },
                children: t
                  ? (0, jsxRuntime.jsxs)("span", {
                      className: "voice-equalizer",
                      children: [
                        (0, jsxRuntime.jsx)("i", {}),
                        (0, jsxRuntime.jsx)("i", {}),
                        (0, jsxRuntime.jsx)("i", {}),
                      ],
                    })
                  : (0, jsxRuntime.jsx)("div", {
                      className: "t-icon icon-14",
                      children: (0, jsxRuntime.jsx)(Ma, {}),
                    }),
              }),
              (0, jsxRuntime.jsxs)("div", {
                className: "voice-text",
                children: [
                  (0, jsxRuntime.jsxs)("div", {
                    className: "voice-title",
                    children: [
                      (0, jsxRuntime.jsx)("span", {
                        className: "voice-name",
                        children: e.name,
                      }),
                      e.gender &&
                        (0, jsxRuntime.jsx)("span", {
                          className: "voice-gender",
                          title: e.genderTitle,
                          children: n ? "\u2642" : "\u2640",
                        }),
                      e.badge &&
                        (0, jsxRuntime.jsx)("span", {
                          className: classNames()("voice-badge", e.badgeKind),
                          children: e.badge,
                        }),
                    ],
                  }),
                  e.meta &&
                    (0, jsxRuntime.jsx)("div", {
                      className: "voice-meta",
                      children: e.meta,
                    }),
                ],
              }),
              (0, jsxRuntime.jsx)("span", {
                className: classNames()("voice-check", {
                  checked: e.checked,
                }),
                children:
                  e.checked &&
                  (0, jsxRuntime.jsx)("div", {
                    className: "t-icon icon-12",
                    children: (0, jsxRuntime.jsx)(Bi, {}),
                  }),
              }),
            ],
          },
          e.key,
        );
      },
      k = (e) =>
        w({
          key: e.id,
          name: iu(e),
          badge: y(e),
          badgeKind: "tier",
          gender: e.gender,
          genderTitle: b(e),
          checked: c && (null == u ? void 0 : u.id) === e.id,
          onPick: () =>
            ((e) => {
              p(un(e), !0);
            })(e),
          onPreview: () =>
            ((e) =>
              v(e.id, () => {
                if (!e.previewUrl) return m("");
                (g.current.src = e.previewUrl),
                  (g.current.onended = () => m("")),
                  (g.current.onerror = () => m("")),
                  g.current.play().catch(() => m(""));
              }))(e),
        });
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside voice-picker",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsx)("div", {
          className: "rd-slider-nav",
          children: (0, jsxRuntime.jsxs)("div", {
            className: "nav-left",
            onClick: () => d(-1),
            children: [
              (0, jsxRuntime.jsx)("div", {
                className: "btn-slider-back",
                children: (0, jsxRuntime.jsx)("div", {
                  className: "t-icon icon-18",
                  children: (0, jsxRuntime.jsx)(Ta, {}),
                }),
              }),
              (0, jsxRuntime.jsx)("span", {
                children: _("itemTableChooseVoice"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "voice-hint",
              children: (0, jsxRuntime.jsx)("div", {
                className: "voice-hint-text",
                children: _("rd_voice_tips"),
              }),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "voice-list",
              children: [
                l && x(_("rd_voice_group_default"), "system"),
                (0, jsxRuntime.jsx)("div", {
                  className: "voice-group-body",
                  children: w({
                    key: tx,
                    name: _("rd_words_voice_default"),
                    meta: _("rd_voice_system_meta"),
                    checked: !c,
                    onPick: () => p(dn("default"), !0),
                    onPreview: () =>
                      v(tx, () => {
                        const e = window.speechSynthesis;
                        if (!e) return m("");
                        const n = new SpeechSynthesisUtterance(
                          ((e) => {
                            var t;
                            return null != (t = ou[Jc(e)]) ? t : ou.en;
                          })(t.subtitle),
                        );
                        (n.lang = t.subtitle),
                          (n.onend = () => m("")),
                          (n.onerror = () => m("")),
                          e.speak(n);
                      }),
                  }),
                }),
                s.map((e) =>
                  (0, jsxRuntime.jsxs)(
                    "div",
                    {
                      className: "voice-group",
                      children: [
                        l && x(e.label, e.locale),
                        (0, jsxRuntime.jsx)("div", {
                          className: "voice-group-body",
                          children: e.items.map(k),
                        }),
                      ],
                    },
                    e.locale,
                  ),
                ),
                a.length > 0 &&
                  0 === o.length &&
                  (0, jsxRuntime.jsx)("div", {
                    className: "voice-empty",
                    children: _("rd_voice_none"),
                  }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  return VoiceSettings;
}
