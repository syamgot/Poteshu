import { deduplicateSubtitles } from './dedupe.js';
import { describe, it, expect } from 'vitest';

describe('Subtitle Deduplication Logic', () => {
    it('should extract text and mark as added if it is new', () => {
        const memory = [];
        const rawText = "こんにちは";
        
        const result = deduplicateSubtitles(memory, rawText);
        expect(result.added).toBe(true);
        expect(result.text).toBe("こんにちは");
        expect(memory.length).toBe(1);
        expect(memory[0]).toBe("こんにちは");
    });
    
    it('should ignore exact duplicate strings', () => {
        const memory = ["こんにちは"];
        const rawText = "こんにちは";
        
        const result = deduplicateSubtitles(memory, rawText);
        expect(result.added).toBe(false);
        expect(memory.length).toBe(1);
    });
    
    it('should clean up whitespaces and newlines', () => {
        const memory = [];
        const rawText = " \n こんにちは \n ";
        
        const result = deduplicateSubtitles(memory, rawText);
        expect(result.added).toBe(true);
        expect(result.text).toBe("こんにちは");
    });
});
