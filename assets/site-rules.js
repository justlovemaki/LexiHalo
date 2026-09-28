(() => {
  "use strict";

  const STORAGE_KEY = "lexihalo_site_rules";
  const status = document.getElementById("status");
  const saveButton = document.getElementById("save");
  const editor = document.getElementById("immersive-rules");
  const input = document.getElementById("immersive-new-rule");
  const addButton = document.getElementById("immersive-add");
  const ruleList = document.getElementById("immersive-rule-list");
  const currentButton = document.getElementById("add-immersive-current");
  const currentHost = new URLSearchParams(location.search).get("host")?.trim() || "";

  let rules = [];
  let saving = false;
  let statusTimer;

  const normalizeRules = (value) => {
    const seen = new Set();
    return String(value || "")
      .split(/\r?\n/)
      .map((rule) => rule.trim())
      .filter((rule) => rule && !rule.startsWith("#"))
      .filter((rule) => {
        const key = rule.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const showStatus = (message, error = false) => {
    window.clearTimeout(statusTimer);
    status.classList.toggle("error", error);
    status.textContent = message;
    if (!error)
      statusTimer = window.setTimeout(() => {
        status.textContent = "";
      }, 3000);
  };

  const setBusy = (value) => {
    saving = value;
    saveButton.disabled = value;
    addButton.disabled = value;
    currentButton.disabled = value;
  };

  const currentRuleIndex = () =>
    rules.findIndex((rule) => rule.toLowerCase() === currentHost.toLowerCase());

  const render = (syncEditor = true) => {
    if (syncEditor) editor.value = rules.join("\n");
    ruleList.replaceChildren();

    if (!rules.length) {
      const empty = document.createElement("div");
      empty.className = "rule-empty";
      empty.textContent = "尚未添加规则";
      ruleList.append(empty);
    } else {
      rules.forEach((rule, index) => {
        const row = document.createElement("div");
        row.className = "rule-row";
        const text = document.createElement("code");
        text.textContent = rule;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "danger-link";
        remove.textContent = "删除";
        remove.setAttribute("aria-label", `删除规则 ${rule}`);
        remove.addEventListener("click", () => {
          persist(
            rules.filter((_, i) => i !== index),
            `已删除 ${rule}`,
          );
        });
        row.append(text, remove);
        ruleList.append(row);
      });
    }

    if (currentHost) {
      currentButton.hidden = false;
      const added = currentRuleIndex() >= 0;
      currentButton.classList.toggle("remove-current", added);
      currentButton.textContent = added ? `移除 ${currentHost}` : `添加 ${currentHost}`;
    }
  };

  const persist = async (nextRules, message) => {
    if (saving) return;
    setBusy(true);
    try {
      // Keep only the immersive rules. Video subtitle auto-start continues to
      // use LexiHalo's original built-in setting.
      await chrome.storage.local.set({
        [STORAGE_KEY]: { immersive: nextRules },
      });
      rules = nextRules;
      render();
      showStatus(message);
    } catch (error) {
      showStatus(`保存失败：${error.message || error}`, true);
    } finally {
      setBusy(false);
    }
  };

  const addRule = () => {
    const additions = normalizeRules(input.value);
    if (!additions.length) return input.focus();
    const merged = normalizeRules([...rules, ...additions].join("\n"));
    const addedCount = merged.length - rules.length;
    input.value = "";
    if (!addedCount) return showStatus("该规则已经存在");
    persist(merged, `已添加 ${addedCount} 条规则`);
  };

  addButton.addEventListener("click", addRule);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addRule();
    }
  });

  currentButton.addEventListener("click", () => {
    if (!currentHost) return;
    const index = currentRuleIndex();
    persist(
      index >= 0 ? rules.filter((_, i) => i !== index) : [...rules, currentHost],
      index >= 0 ? `已移除 ${currentHost}` : `已添加 ${currentHost}`,
    );
  });

  chrome.storage.local
    .get(STORAGE_KEY)
    .then((result) => {
      const stored = result[STORAGE_KEY] || {};
      rules = normalizeRules(Array.isArray(stored.immersive) ? stored.immersive.join("\n") : "");
      if (Object.prototype.hasOwnProperty.call(stored, "subtitle")) {
        chrome.storage.local.set({ [STORAGE_KEY]: { immersive: rules } }).catch(() => {});
      }
      render();
    })
    .catch((error) => showStatus(`读取失败：${error.message || error}`, true));

  saveButton.addEventListener("click", () => {
    persist(normalizeRules(editor.value), "已保存批量修改");
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveButton.click();
    }
  });
})();

document.documentElement.setAttribute("data-lexihalo-site-rules-runtime", "readable");
