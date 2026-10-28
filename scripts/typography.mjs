/**
 * Line-break hygiene for Belarusian/Russian text, shared by the Markdown build and
 * the posts index so post bodies, titles and excerpts follow the same rules.
 *
 * - A dash never starts a line: the space before it becomes a no-break space.
 * - A one- or two-letter word (і, ў, а, з, на, не, па…) never ends a line: the space
 *   after it becomes a no-break space, so it travels with the next word.
 * - A number stays with what follows it: "209 км", "2 476".
 */
const NBSP = ' '
const SHORT_WORD = /(^|[\s(«„"' ])([A-Za-zА-Яа-яЁёІіЎўЇїЄєҐґ]{1,2}) (?=\S)/g

export const glueDashes = (text) => text.replace(/ ([—–])/g, `${NBSP}$1`)

export const glueShortWords = (text) => {
    // Runs until stable: in "і ў лес" the second short word is only free to glue
    // after the first one has been replaced.
    let previous
    let current = text
    do {
        previous = current
        current = current.replace(SHORT_WORD, `$1$2${NBSP}`)
    } while (current !== previous)
    return current
}

export const glueNumbers = (text) => text.replace(/(\d) (?=\S)/g, `$1${NBSP}`)

export const typograph = (text) => glueShortWords(glueNumbers(glueDashes(text)))
