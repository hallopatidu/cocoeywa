import { __private, ValueType } from "cc";

export type SimplePropertyType = __private._cocos_core_data_decorators_property__SimplePropertyType;

export type Path = string;

// ------- Class Decorator Type --------
export type Initializer = () => unknown;
export type IPropertyOptions = __private._cocos_core_data_decorators_property__IPropertyOptions | __private._cocos_core_data_utils_attribute_defines__IExposedAttributes;
export type IExposedAttributes = __private._cocos_core_data_utils_attribute_defines__IExposedAttributes;
export type BabelPropertyDecoratorDescriptor = PropertyDescriptor & { initializer?: Initializer };
export type LegacyPropertyDecorator = (
    target: Record<string, any>, propertyKey: string | symbol, descriptorOrInitializer?: BabelPropertyDecoratorDescriptor | Initializer | null,
) => void;
export type ClassStash = IExposedAttributes & {
    default?: unknown;
    proto?: {
        properties?: Record<PropertyKey, PropertyStash>;
    };
    errorProps?: Record<PropertyKey, true>;
}
export type DecorateHandlerType = (
    cache: ClassStash, 
    propertyStash: PropertyStash,
    ctor: new () => unknown,
    propertyKey: Parameters<LegacyPropertyDecorator>[1],
    options?:IPropertyOptions, 
    descriptorOrInitializer?: Parameters<LegacyPropertyDecorator>[2] | undefined )=>void;

export type PropertyStash = IExposedAttributes & {
    default?: unknown,
    get?: () => unknown,
    set?: (value: unknown) => void,
    _short?: unknown,
    __internalFlags: number,
    __$extends?:DecorateHandlerType[],
    __$decorate:string
}

/** ---------- Types ---------- */
export type PrimitiveType =
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint;

export type Trackable =
  | PrimitiveType
  | ValueType
  | Trackable[]
  | { [key: string]: Trackable };

export type Tracked<T> =
  T extends PrimitiveType
    ? T
    : T extends ValueType
      ? T
      : T extends Array<infer U>
        ? Tracked<U>[]
        : T extends object
          ? { [K in keyof T]: Tracked<T[K]> }
          : T;

export type AccessType = 'get' | 'set' | 'delete';


// export type ActionDataType = {
//     [n:string]: ActionDataType|string
// }

// -------- candidate / removable -----------
// export type TransferDataType = {
//     __line__:number,
//     __token__:number,
//     [n:string]: unknown
// } & object



