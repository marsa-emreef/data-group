export type Reducer<T, O> = (data: T, action: Action<O>) => T
export type Action<O> = { type: string, data: O, key: string, event: Event, index: number };
export type Renderer = { render: (dataGetter: () => any) => void, nodes: ChildNode[] };
export type DataSetter<O> = (oldData: O) => O;
export type ToString<O> = (data: O) => string;
export type DataGetter<O> = () => DataGetterValue<O>;
export type DataGetterValue<O> = { key?: string, data: O, index?: number };
export type UpdateDataCallback<O> = (value: DataSetter<O>) => void;

export const composeChangeEventName = (attribute: any) => `${attribute}Changed`;
export const hasValue = (param: any) => param !== undefined && param !== null && param !== '';
export const hasNoValue = (param: any) => !hasValue(param);
export const contains = (text: string, texts: string[]) => texts.reduce((acc, txt) => acc || text.indexOf(txt) >= 0, false);

export const DATA_WATCH_ATTRIBUTE = 'watch';
export const DATA_ACTION_ATTRIBUTE = 'action';
export const DATA_TOGGLE_ATTRIBUTE = 'toggle';
export const STATE_PROPERTY = '_state';
export const STATE_GLOBAL = '*';
export const DATA_KEY_ATTRIBUTE = 'data.key';
export const HIDE_CLASS: string = "data-element-hidden";
export const ARRAY_CONTEXT_ELEMENT_TAG_NAME = 'context-array';
export const CONTEXT_ELEMENT_TAG_NAME = 'context-element';

const style = document.createElement('style');
style.innerHTML = `.${HIDE_CLASS} {display: none !important;}`;
document.head.appendChild(style);
