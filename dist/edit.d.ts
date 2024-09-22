import { Root, Element as HastElement, Text as HastText, Comment as HastComment, Doctype as HastDoctype } from 'hast';
interface Scoped {
    [k: string]: number | Scoped;
}
export declare function Visit({ code, sheet }: {
    code: (HastElement | HastText | HastComment | Root | HastDoctype);
    sheet: Scoped;
}): string | import("react/jsx-runtime").JSX.Element;
export declare function Edit(): import("react/jsx-runtime").JSX.Element;
export {};
