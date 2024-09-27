import { Dispatch, SetStateAction } from "react";
interface WindowContext {
    id: number;
}
export declare const windowContext: import("react").Context<WindowContext>;
interface WindowData {
    url: string;
    id: number;
    visible: boolean;
}
type TypeofWindowingContext = [WindowData[], Dispatch<SetStateAction<WindowData[]>>];
export declare const windowingContext: import("react").Context<TypeofWindowingContext>;
export declare function App(): import("react/jsx-runtime").JSX.Element;
export {};
