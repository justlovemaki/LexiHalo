/**
 * Writing-assistant settings extracted from the recovered Reader bundle.
 */
export function recoverWriterSettings(dependencies) {
  const setWriterEnableAction = dependencies.Hn;
  const jsxRuntime = dependencies.jsxRuntime;
  const useAppSelector = dependencies.useAppSelector;
  const useDispatchBridge = dependencies.useDispatchBridge;
  const useLocale = dependencies.useLocale;
  const useSliderNavigation = dependencies.useSliderNavigation;

  const WriterSettings = () => {
    const { writer } = useAppSelector((state) => ({
      writer: state.writer,
    }));
    const { navigate } = useSliderNavigation();
    const { locale } = useLocale();
    const { dispatch } = useDispatchBridge();

    return (0, jsxRuntime.jsxs)("div", {
      className: "rd-slider-inside",
      id: "trancy-slider",
      children: [
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-nav",
          children: [
            (0, jsxRuntime.jsxs)("div", {
              className: "nav-left",
              onClick: () => navigate(-1),
              children: [
                (0, jsxRuntime.jsx)("div", {
                  className: "btn-slider-back",
                  children: (0, jsxRuntime.jsx)("i", {
                    className: "material-symbols-rounded",
                    children: "chevron_left",
                  }),
                }),
                (0, jsxRuntime.jsx)("span", { children: "写作增强 beta" }),
              ],
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "nav-right",
              children: (0, jsxRuntime.jsxs)("a", {
                href: "https://www.trancy.org/user-guide",
                target: "_blank",
                className: "btn-slider-link",
                children: [
                  (0, jsxRuntime.jsx)("i", {
                    className: "material-symbols-rounded",
                    children: "help_outline",
                  }),
                  (0, jsxRuntime.jsx)("span", {
                    children: locale("rd_manual"),
                  }),
                ],
              }),
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)("div", {
          className: "rd-slider-content",
          children: [
            (0, jsxRuntime.jsx)("div", {
              className: "tips",
              children:
                "该功能目前处于测试阶段，只做了简单兼容，如有建议可通过下方入口反馈。",
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "item-slider-group",
              children: (0, jsxRuntime.jsx)("div", {
                className: "item-slider",
                children: (0, jsxRuntime.jsxs)("div", {
                  className: "item-slider-content",
                  children: [
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-left",
                      children: (0, jsxRuntime.jsx)("span", {
                        children: "写作增强辅助",
                      }),
                    }),
                    (0, jsxRuntime.jsx)("div", {
                      className: "item-right",
                      onClick: () => dispatch(setWriterEnableAction(!writer.enable)),
                      children: (0, jsxRuntime.jsx)("input", {
                        type: "checkbox",
                        className: "rd-switch",
                        checked: writer.enable,
                        readOnly: true,
                      }),
                    }),
                  ],
                }),
              }),
            }),
            (0, jsxRuntime.jsxs)("div", {
              className: "bottom-tips",
              children: [
                (0, jsxRuntime.jsx)("i", {
                  className: "material-symbols-rounded",
                  children: "tips_and_updates",
                }),
                (0, jsxRuntime.jsx)("p", {
                  children:
                    "1. 启用后，在输入框输入 /en [text][两次空格]，即可把 text 翻译为英文",
                }),
                (0, jsxRuntime.jsx)("p", {
                  children: "2. /en 你好世界 == hello world",
                }),
                (0, jsxRuntime.jsx)("p", {
                  children: "3. 支持语言：en es fr de it pt hi ko ja",
                }),
              ],
            }),
            (0, jsxRuntime.jsx)("div", {
              className: "survey",
              children: (0, jsxRuntime.jsx)("a", {
                href: "https://tally.so/r/n9X0Z5",
                target: "_blank",
                className: "btn-survey",
                children: "视频教程及建议",
              }),
            }),
          ],
        }),
      ],
    });
  };

  return WriterSettings;
}
