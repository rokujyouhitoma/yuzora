/**
 * Aozora Bunko Tokenizer
 */
"use strict";

/**
 * @typedef {{
 *   type: string,
 *   value: (string|undefined),
 *   rt: (string|undefined),
 *   children: (undefined),
 *   headingLevel: (number|undefined),
 *   headingText: (string|undefined),
 *   jisageClass: (string|undefined),
 *   alignmentClass: (string|undefined),
 *   inlineTokens: (!Array<!Object>|undefined)
 * }}
 */
var AozoraToken;

/**
 * @implements {AozoraTokenizerInterface}
 */
class AozoraTokenizer {
    constructor() {}

    /**
     * @param {string} line
     * @return {!AozoraToken}
     * @override
     */
    // @ts-expect-error
    // eslint-disable-next-line complexity
    tokenizeSingleLine(line) {
        if (line.trim().length === 0) {
            return {
                'type': 'BLOCK_EMPTY_LINE',
                'value': line,
                'rt': undefined,
                'children': undefined,
                'headingLevel': undefined,
                'headingText': undefined,
                'jisageClass': undefined,
                'alignmentClass': undefined,
                'inlineTokens': undefined
            };
        }
        
        if (line.trim() === '［＃改ページ］') {
            return {
                'type': 'BLOCK_PAGE_BREAK',
                'value': line,
                'rt': undefined,
                'children': undefined,
                'headingLevel': undefined,
                'headingText': undefined,
                'jisageClass': undefined,
                'alignmentClass': undefined,
                'inlineTokens': undefined
            };
        }
        
        // 地下げ (字下げ) 判定と除去
        let jisageClass = '';
        const jisageMatch = line.match(/［＃([０-９0-9]+)字下げ］/);
        if (jisageMatch) {
            const rawNum = jisageMatch[1];
            const cleanNum = rawNum.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            const n = parseInt(cleanNum, 10);
            jisageClass = `jisage${n}`;
            line = line.replace(/［＃[０-９0-9]+字下げ］/, '');
        }
        
        // アライメント判定と除去
        let alignmentClass = '';
        if (line.includes('［＃地付き］')) {
            alignmentClass = 'chitsuki';
            line = line.replace(/［＃地付き］/g, '');
        } else if (line.includes('［＃地寄せ］')) {
            alignmentClass = 'chiyose';
            line = line.replace(/［＃地寄せ］/g, '');
        } else {
            const chitageMatch = line.match(/［＃地から([０-９0-9]+)字上げ］/);
            if (chitageMatch) {
                const rawNum = chitageMatch[1];
                const cleanNum = rawNum.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
                const n = parseInt(cleanNum, 10);
                alignmentClass = `chitage-${n}`;
                line = line.replace(/［＃地から[０-９0-9]+字上げ］/g, '');
            }
        }
        
        // 見出し判定と除去
        let isHeading = false;
        let headingLevel = 2;
        let headingText = '';
        const headingMatch = line.match(/［＃「([^」]+)」は(大|中|小)見出し］/);
        if (headingMatch) {
            isHeading = true;
            headingText = headingMatch[1];
            const levelChar = headingMatch[2];
            if (levelChar === '大') headingLevel = 2;
            else if (levelChar === '中') headingLevel = 3;
            else if (levelChar === '小') headingLevel = 4;
            line = line.replace(/［＃「[^」]+」は(?:大|中|小)見出し］/, '');
        }
        
        // ブロック内部 of インライントークンを抽出
        const inlineTokens = this.tokenizeInline(line);
        
        if (isHeading) {
            return {
                'type': 'BLOCK_HEADING',
                'value': line,
                'rt': undefined,
                'children': undefined,
                'headingLevel': headingLevel,
                'headingText': headingText,
                'jisageClass': jisageClass,
                'alignmentClass': alignmentClass,
                'inlineTokens': inlineTokens
            };
        } else {
            return {
                'type': 'BLOCK_PARAGRAPH',
                'value': line,
                'rt': undefined,
                'children': undefined,
                'headingLevel': undefined,
                'headingText': undefined,
                'jisageClass': jisageClass,
                'alignmentClass': alignmentClass,
                'inlineTokens': inlineTokens
            };
        }
    }

    /**
     * @param {string} text
     * @return {!Array<!AozoraToken>}
     * @override
     */
    // @ts-expect-error
    tokenize(text) {
        const blocks = [];
        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            blocks.push(this.tokenizeSingleLine(lines[i]));
        }
        return blocks;
    }

    /**
     * @param {string} text
     * @return {!Array<!AozoraToken>}
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
                        tokens.push({
                            'type': 'RUBY',
                            'value': kanji,
                            'rt': rt,
                            'children': undefined,
                            'headingLevel': undefined,
                            'headingText': undefined,
                            'jisageClass': undefined,
                            'alignmentClass': undefined,
                            'inlineTokens': undefined
                        });
                        i = rtEndIdx + 1;
                        continue;
                    }
                }
            }
            
            const kanjiMatch = text.substring(i).match(/^((?:[一-龠々仝〆〇ヶ]|※［＃二の字点、面区点番号1-2-22］)+|[A-Za-z]+)《([^》]+)》/);
            if (kanjiMatch) {
                tokens.push({
                    'type': 'RUBY',
                    'value': kanjiMatch[1],
                    'rt': kanjiMatch[2],
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i += kanjiMatch[0].length;
                continue;
            }
            
            if (text.startsWith('［＃ここから太字］', i)) {
                tokens.push({
                    'type': 'BOLD_START',
                    'value': undefined,
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i += 9;
                continue;
            }
            if (text.startsWith('［＃ここで太字終わり］', i)) {
                tokens.push({
                    'type': 'BOLD_END',
                    'value': undefined,
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i += 11;
                continue;
            }
            if (text.startsWith('［＃ここから斜体］', i)) {
                tokens.push({
                    'type': 'ITALIC_START',
                    'value': undefined,
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i += 9;
                continue;
            }
            if (text.startsWith('［＃ここで斜体終わり］', i)) {
                tokens.push({
                    'type': 'ITALIC_END',
                    'value': undefined,
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i += 11;
                continue;
            }
            if (text.startsWith('［＃傍点］', i)) {
                tokens.push({
                    'type': 'BOUTEN_START',
                    'value': undefined,
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i += 5;
                continue;
            }
            if (text.startsWith('［＃傍点終わり］', i)) {
                tokens.push({
                    'type': 'BOUTEN_END',
                    'value': undefined,
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
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
                tokens.push({
                    'type': 'TEXT',
                    'value': text[i],
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i++;
            } else {
                tokens.push({
                    'type': 'TEXT',
                    'value': text.substring(i, nextSpecial),
                    'rt': undefined,
                    'children': undefined,
                    'headingLevel': undefined,
                    'headingText': undefined,
                    'jisageClass': undefined,
                    'alignmentClass': undefined,
                    'inlineTokens': undefined
                });
                i = nextSpecial;
            }
        }
        
        return tokens;
    }
}

window['AozoraTokenizer'] = AozoraTokenizer;
AozoraTokenizer.prototype['tokenizeSingleLine'] = AozoraTokenizer.prototype.tokenizeSingleLine;
