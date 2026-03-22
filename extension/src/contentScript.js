import { deduplicateSubtitles } from './dedupe.js';

let subtitleMemory = [];
let debounceTimer = null;
let currentSentence = "";
console.log("Poteshu Subtitle Extractor starting...");

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const target = mutation.target;
            
            // Check for YouTube's caption segment element
            let text = "";
            if (target.classList && target.classList.contains('ytp-caption-segment')) {
                text = target.innerText || target.textContent;
            } else if (target.parentElement && target.parentElement.classList && target.parentElement.classList.contains('ytp-caption-segment')) {
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
        //If it's a completely new sentence (not a replacement/extension of the previous one),
        // we instantly flush the pending sentence to the server so we don't drop it.
        if (!result.replaced && debounceTimer) {
            clearTimeout(debounceTimer);
            sendToServer(currentSentence);
        }

        currentSentence = result.text;
        
        if (debounceTimer) clearTimeout(debounceTimer);
        
        // Wait 700ms. If no new characters are added, it means the subtitle is complete.
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
    const video = document.querySelector('video');
    if (video) timestamp = video.currentTime;
    
    let title = document.title.replace(" - YouTube", "");
    const titleEl = document.querySelector('h1.ytd-watch-metadata');
    if (titleEl && titleEl.innerText) title = titleEl.innerText;

    fetch('http://localhost:8000/subtitle', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            text: text,
            timestamp: timestamp,
            title: title
        })
    }).catch(err => {});
}

const startObserver = () => {
    const container = document.body; 
    if (container) {
        observer.observe(container, { childList: true, characterData: true, subtree: true });
        console.log("Poteshu monitoring DOM for .ytp-caption-segment");
    } else {
        setTimeout(startObserver, 1000);
    }
};

startObserver();
