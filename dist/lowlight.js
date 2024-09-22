const Black = 0;
const Red = 1;
const Green = 2;
const Yellow = 3;
const Blue = 4;
const Magenta = 5;
const Cyan = 6;
const White = 7;
const dark = {
    'hljs-comment': Blue,
    'hljs-quote': Blue,
    'hljs-keyword': Red,
    'hljs-function': Red,
    'hljs-selector-tag': Green,
    'hljs-addition': Green,
    'hljs-number': Cyan,
    'hljs-string': Cyan,
    'hljs-meta\'s children': {
        'hljs-meta-string': Cyan,
        'hljs-keyword': Magenta,
    },
    'hljs-literal': Cyan,
    'hljs-doctag': Cyan,
    'hljs-regexp': Cyan,
    'hljs-title': Green,
    'hljs-section': Green,
    'hljs-name': Green,
    'hljs-selector-id': Green,
    'hljs-selector-class': Green,
    'hljs-attribute': Yellow,
    'hljs-attr': Yellow,
    'hljs-variable': Yellow,
    'hljs-template-variable': Yellow,
    'hljs-class\'s children': {
        'hljs-title': Yellow,
    },
    'hljs-type': Yellow,
    'hljs-symbol': Magenta,
    'hljs-bullet': Magenta,
    'hljs-subst': Magenta,
    'hljs-meta': Magenta,
    'hljs-selector-attr': Magenta,
    'hljs-selector-pseudo': Magenta,
    'hljs-link': Magenta,
    'hljs-built_in': Red,
    'hljs-deletion': Red,
    // hljs-emphasis: chalk.italic,
    // hljs-strong: chalk.bold,
    // hljs-formula: chalk.inverse
};
export default {
    dark,
};
