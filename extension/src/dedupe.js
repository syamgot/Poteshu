export function deduplicateSubtitles(memory, rawText) {
    if (!rawText) return { added: false, replaced: false, text: "" };
    
    // Clean up whitespaces and newlines
    const cleanedText = rawText.replace(/\s+/g, ' ').trim();
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
