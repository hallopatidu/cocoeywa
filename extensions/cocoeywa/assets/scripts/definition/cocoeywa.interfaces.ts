import { AccessType } from "./cocoeywa.types";

export interface IOInterface {    
    input<T = unknown>(data: T): Promise<T>;
    output<T = unknown>(): T
};

export interface HookInterface extends IOInterface {    
    
};

export interface UIComponentInterface {
    show(): void;
    hide(): void;
}

// ----------- Proxy -------------

export interface ProxyContext {
  path: string[];
  onAccess?: (type: AccessType, path: string, value?: unknown) => void;
}





