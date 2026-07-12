/**
 * Aozora Bunko Tokenizer
 */
"use strict";

/**
 * @implements {AozoraTokenizerInterface}
 */
class AozoraTokenizer {
    constructor() {}

    /**
     * @param {string} text
     * @return {!Array<!ASTNodeInterface>}
     * @override
     */
    // @ts-expect-error
    // eslint-disable-next-line complexity
    tokenizeInline(text) {
        const tokens = [];
        let i = 0;
        
        while (i < text.length) {
            if (text[i] === '｜' || text[i] === '|') {
                const rubyEndIdx = text.indexOf('《', i);
                if (rubyEndIdx !== -1) {
                    const rtEndIdx = text.indexOf('》', rubyEndIdx);
                    if (rtEndIdx !== -1) {
                        const kanji = text.substring(i + 1, rubyEndIdx);
                        const rt = text.substring(rubyEndIdx + 1, rtEndIdx);
                        tokens.push({ type: 'RUBY', value: kanji, rt: rt, children: undefined });
                        i = rtEndIdx + 1;
                        continue;
                    }
                }
            }
            
            const kanjiMatch = text.substring(i).match(/^((?:[一-龠々仝〆〇ヶ]|※［＃二の字点、面区点番号1-2-22］)+|[A-Za-z]+)《([^》]+)》/);
            if (kanjiMatch) {
                tokens.push({ type: 'RUBY', value: kanjiMatch[1], rt: kanjiMatch[2], children: undefined });
                i += kanjiMatch[0].length;
                continue;
            }
            
            if (text.startsWith('［＃ここから太字］', i)) {
                tokens.push({ type: 'BOLD_START', value: undefined, rt: undefined, children: undefined });
                i += 9;
                continue;
            }
            if (text.startsWith('［＃ここで太字終わり］', i)) {
                tokens.push({ type: 'BOLD_END', value: undefined, rt: undefined, children: undefined });
                i += 11;
                continue;
            }
            if (text.startsWith('［＃ここから斜体］', i)) {
                tokens.push({ type: 'ITALIC_START', value: undefined, rt: undefined, children: undefined });
                i += 9;
                continue;
            }
            if (text.startsWith('［＃ここで斜体終わり］', i)) {
                tokens.push({ type: 'ITALIC_END', value: undefined, rt: undefined, children: undefined });
                i += 11;
                continue;
            }
            if (text.startsWith('［＃傍点］', i)) {
                tokens.push({ type: 'BOUTEN_START', value: undefined, rt: undefined, children: undefined });
                i += 5;
                continue;
            }
            if (text.startsWith('［＃傍点終わり］', i)) {
                tokens.push({ type: 'BOUTEN_END', value: undefined, rt: undefined, children: undefined });
                i += 8;
                continue;
            }
            if (text.startsWith('［＃', i)) {
                const endIdx = text.indexOf('］', i);
                if (endIdx !== -1) {
                    i = endIdx + 1;
                    continue;
                }
            }
            
            let nextSpecial = text.length;
            const specials = ['｜', '|', '［＃', '《'];
            for (let j = 0; j < specials.length; j++) {
                const idx = text.indexOf(specials[j], i);
                if (idx !== -1 && idx < nextSpecial) {
                    nextSpecial = idx;
                }
            }
            
            const textChunk = text.substring(i, nextSpecial);
            if (text[nextSpecial] === '《') {
                const nestedKanjiMatch = textChunk.match(/([一-龠々仝〆〇ヶ]+|[A-Za-z]+)$/);
                if (nestedKanjiMatch) {
                    nextSpecial = i + nestedKanjiMatch.index;
                }
            }
            
            if (nextSpecial === i) {
                tokens.push({ type: 'TEXT', value: text[i], rt: undefined, children: undefined });
                i++;
            } else {
                tokens.push({ type: 'TEXT', value: text.substring(i, nextSpecial), rt: undefined, children: undefined });
                i = nextSpecial;
            }
        }
        
        return tokens;
    }
}

window['AozoraTokenizer'] = AozoraTokenizer;
