/**
 * Semantic recovery of a scope-hoisted bundle function.
 */
export function recoverCustomHotkeySettings(dependencies) {
  const React = dependencies.React;
  const Ta = dependencies.Ta;
  const hotkeyManager = dependencies.hotkeyManager;
  const jsxRuntime = dependencies.jsxRuntime;
  const logDebug = dependencies.logDebug;
  const si = dependencies.si;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;
  const useToast = dependencies.useToast;
  const wT = dependencies.wT;

  const CustomHotkeySettings = () => {
    const { toast: e, Toast: t } = useToast(),
      { shortcuts: n } = useAppSelector((e) => ({
        shortcuts: e.shortcuts,
      })),
      { navigate: r } = useSliderNavigation(),
      { locale: i } = useLocale(),
      { dispatch: a } = useDispatchBridge(),
      [o, s] = (0, React.useState)(0);
    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside",
      id: "trancy-slider",
      onClick: () => s(o + 1),
      children: [
        (0, jsxRuntime.jsx)(t, {}),
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
                  children: (0, jsxRuntime.jsx)(Ta, {}),
                }),
              }),
              (0, jsxRuntime.jsx)("span", {
                children: i("rd_shortcut_config_title"),
              }),
            ],
          }),
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "tips",
              children: i("rd_shortcut_config_tips"),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "item-slider-group",
              children: [
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider pointer",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("shortcut_outside-caption"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: (0, jsxRuntime.jsx)(wT, {
                              cancelSignal: o,
                              editingPlaceholder: i(
                                "shortcut_picker_editing_placeholder",
                              ),
                              placeholder: i("shortcut_picker_placeholder"),
                              value: n.captionToggle,
                              onEditing: (e) => {
                                hotkeyManager.settingHotkey = e;
                              },
                              onChange: (e, t) => {
                                logDebug("captionToggle", {
                                  hk: e,
                                  label: t,
                                }),
                                  e &&
                                    (a(
                                      si({
                                        key: "captionToggle",
                                        value: e,
                                      }),
                                    ),
                                    hotkeyManager.updateShortcuts());
                              },
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: i("shortcut_outside-caption_des"),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider pointer",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("shortcut_turnon_ai_sub"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: (0, jsxRuntime.jsx)(wT, {
                              cancelSignal: o,
                              editingPlaceholder: i(
                                "shortcut_picker_editing_placeholder",
                              ),
                              placeholder: i("shortcut_picker_placeholder"),
                              value: n.aiTranscribe,
                              onEditing: (e) => {
                                hotkeyManager.settingHotkey = e;
                              },
                              onChange: (e, t) => {
                                logDebug("aiTranscribe", {
                                  hk: e,
                                  label: t,
                                }),
                                  e &&
                                    (a(
                                      si({
                                        key: "aiTranscribe",
                                        value: e,
                                      }),
                                    ),
                                    hotkeyManager.updateShortcuts());
                              },
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: i("shortcut_turnon_ai_sub_des"),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider pointer",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("shortcut_learning_mode"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: (0, jsxRuntime.jsx)(wT, {
                              cancelSignal: o,
                              editingPlaceholder: i(
                                "shortcut_picker_editing_placeholder",
                              ),
                              placeholder: i("shortcut_picker_placeholder"),
                              value: n.video,
                              onEditing: (e) => {
                                hotkeyManager.settingHotkey = e;
                              },
                              onChange: (e, t) => {
                                logDebug("video", {
                                  hk: e,
                                  label: t,
                                }),
                                  e &&
                                    (a(
                                      si({
                                        key: "video",
                                        value: e,
                                      }),
                                    ),
                                    hotkeyManager.updateShortcuts());
                              },
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: i("shortcut_learning_mode_des"),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider pointer",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("shortcut_fulltext_translate"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: (0, jsxRuntime.jsx)(wT, {
                              cancelSignal: o,
                              editingPlaceholder: i(
                                "shortcut_picker_editing_placeholder",
                              ),
                              placeholder: i("shortcut_picker_placeholder"),
                              value: n.immersiveTranslator,
                              onEditing: (e) => {
                                hotkeyManager.settingHotkey = e;
                              },
                              onChange: (e, t) => {
                                logDebug("immersiveTranslator", {
                                  hk: e,
                                  label: t,
                                }),
                                  e &&
                                    (a(
                                      si({
                                        key: "immersiveTranslator",
                                        value: e,
                                      }),
                                    ),
                                    hotkeyManager.updateShortcuts());
                              },
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: i("shortcut_fulltext_translate_des"),
                    }),
                  ],
                }),
                (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider pointer",
                  children: [
                    (0, jsxRuntime.jsxs)("div", {
                      className: "item-slider-content",
                      children: [
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-left",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: i("shortcut_quick_translate"),
                          }),
                        }),
                        (0, jsxRuntime.jsx)("div", {
                          className: "item-right",
                          children: (0, jsxRuntime.jsx)("span", {
                            children: (0, jsxRuntime.jsx)(wT, {
                              cancelSignal: o,
                              editingPlaceholder: i(
                                "shortcut_picker_editing_placeholder",
                              ),
                              placeholder: i("shortcut_picker_placeholder"),
                              value: n.quickTranslator,
                              onEditing: (e) => {
                                hotkeyManager.settingHotkey = e;
                              },
                              onChange: (e, t) => {
                                logDebug("quickTranslator", {
                                  hk: e,
                                  label: t,
                                }),
                                  e &&
                                    (a(
                                      si({
                                        key: "quickTranslator",
                                        value: e,
                                      }),
                                    ),
                                    hotkeyManager.updateShortcuts());
                              },
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-slider-des",
                      children: i("shortcut_quick_translate_des"),
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

  return CustomHotkeySettings;
}
