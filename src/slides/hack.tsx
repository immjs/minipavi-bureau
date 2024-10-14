import { createElement, ReactElement, ReactNode } from "react";

const isReactElement = (v: ReactNode): v is ReactElement => v != null
  && typeof v === 'object'
  && '$$typeof' in v
  && (v['$$typeof'] as Symbol).toString() === 'Symbol(react.element)';

const toCamelCase = (v: string) => v.replace(/-[a-z]/g, ([_, v]) => `${v.toUpperCase()}`);

export function manualTamper(reactEl: string | ReactNode[]) {
  if (typeof reactEl === 'string') return reactEl.trim() || null;
  return reactEl.map((v, i): ReactNode => {
    if (isReactElement(v)) {
      const newProps = Object.fromEntries(Object.entries(v.props).map(([propName, propValue]) => {
        if (propName === 'children') return [propName, manualTamper(propValue as ReactNode[])];
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
      const children = newProps.children as (React.ReactElement | string | undefined)[];
      return createElement(v.type, newProps, ...(typeof children === "string" ? [children] : children ?? []));
    }
    return typeof v === "string" ? v.trim() || null : v;
  });
}
