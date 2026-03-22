(() => {
  // src/dedupe.js
  function deduplicateSubtitles(memory, rawText) {
    if (!rawText) return { added: false, replaced: false, text: "" };
    const cleanedText = rawText.replace(/\s+/g, " ").trim();
    if (!cleanedText) return { added: false, replaced: false, text: "" };
    if (memory.includes(cleanedText)) {
      return { added: false, replaced: false, text: cleanedText };
    }
    if (memory.length > 0) {
      const lastItem = memory[memory.length - 1];
      if (cleanedText.startsWith(lastItem)) {
        memory[memory.length - 1] = cleanedText;
        return { added: true, replaced: true, text: cleanedText };
      }
    }
    memory.push(cleanedText);
    if (memory.length > 50) memory.shift();
    return { added: true, replaced: false, text: cleanedText };
  }

  // src/contentScript.js
  var subtitleMemory = [];
  var debounceTimer = null;
  var currentSentence = "";
  console.log("Poteshu Subtitle Extractor starting...");
  var observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" || mutation.type === "characterData") {
        const target = mutation.target;
        let text = "";
        if (target.classList && target.classList.contains("ytp-caption-segment")) {
          text = target.innerText || target.textContent;
        } else if (target.parentElement && target.parentElement.classList && target.parentElement.classList.contains("ytp-caption-segment")) {
          text = target.parentElement.innerText || target.parentElement.textContent;
        }
        if (text) {
          processText(text);
        }
      }
    }
  });
  function processText(rawText) {
    if (!rawText) return;
    const result = deduplicateSubtitles(subtitleMemory, rawText);
    if (result.added) {
      if (!result.replaced && debounceTimer) {
        clearTimeout(debounceTimer);
        sendToServer(currentSentence);
      }
      currentSentence = result.text;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        sendToServer(currentSentence);
        debounceTimer = null;
      }, 700);
    }
  }
  function sendToServer(text) {
    if (!text) return;
    console.log("Poteshu Extracted (Final/Debounced):", text);
    let timestamp = 0;
    const video = document.querySelector("video");
    if (video) timestamp = video.currentTime;
    let title = document.title.replace(" - YouTube", "");
    const titleEl = document.querySelector("h1.ytd-watch-metadata");
    if (titleEl && titleEl.innerText) title = titleEl.innerText;
    fetch("http://localhost:8000/subtitle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        timestamp,
        title
      })
    }).catch((err) => {
    });
  }
  var startObserver = () => {
    const container = document.body;
    if (container) {
      observer.observe(container, { childList: true, characterData: true, subtree: true });
      console.log("Poteshu monitoring DOM for .ytp-caption-segment");
    } else {
      setTimeout(startObserver, 1e3);
    }
  };
  startObserver();
})();
