import { createElement } from "react";
const isReactElement = (v) => v != null
    && typeof v === 'object'
    && '$$typeof' in v
    && v['$$typeof'].toString() === 'Symbol(react.element)';
const toCamelCase = (v) => v.replace(/-[a-z]/g, ([_, v]) => `${v.toUpperCase()}`);
export function manualTamper(reactEl) {
    if (typeof reactEl === 'string')
        return reactEl.trim() || null;
    return reactEl.map((v, i) => {
        if (isReactElement(v)) {
            const newProps = Object.fromEntries(Object.entries(v.props).map(([propName, propValue]) => {
                if (propName === 'children')
                    return [propName, manualTamper(propValue)];
                let newValue = propValue;
                if (typeof propValue === 'string') {
                    const actualValue = propValue.match(/(?<=^\{).+(?=\}$)/g);
                    if (actualValue && actualValue[0]) {
                        newValue = JSON.parse(actualValue[0]);
                    }
                }
                return [toCamelCase(propName), newValue];
            }));
            newProps.key = i;
            const children = newProps.children;
            return createElement(v.type, newProps, ...(typeof children === "string" ? [children] : children ?? []));
        }
        return typeof v === "string" ? v.trim() || null : v;
    });
}
