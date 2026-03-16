// trackedProxy.ts
import { ValueType } from 'cc';
import { utils } from './cocoeywa.utils';
import { AccessType, Trackable, Tracked } from './cocoeywa.types';

export interface ProxyContext {
  __hasChanged__?:boolean
  path?: string[];
  onAccess?: (type: AccessType, path: string, value?: unknown) => void;
}


/** ---------- Core Proxy ---------- */

/**
 * const state: GameState = {
 *   abc: {
 *     opacity: 255,
 *     pos: new Vec3(1, 2, 3)
 *   },
 *   sc: 0
 * };
 * const proxy = createTrackedProxy(state, {
 *   onAccess(type, path, value) {
 *     log.push(`${type}: ${path} ${value !== undefined ? `= ${value}` : ''}`);
 *   }
 * });
 * @param target 
 * @param ctx 
 * @returns 
 */

function createProxyInternal<T extends Trackable>(
  target: T,
  ctx: ProxyContext
): Tracked<T> {

  // Primitive or ValueType -> return directly (no proxy) but still track get access
  if (utils.isPrimitiveType(target) || utils.isCocosValueType(target)) {
    return target as Tracked<T>;
  }
  if(!ctx.path){
    ctx.path = [];
  }
  // Array
  if (Array.isArray(target)) {
    const arr = target as unknown as Trackable[];
    return new Proxy(arr, {
      get(obj, prop: string | symbol) {
        if (typeof prop === 'symbol') {
          return (obj as any)[prop];
        }

        const value = (obj as any)[prop];
        const nextPath = ctx.path.concat(prop.toString());

        ctx.onAccess?.('get', nextPath.join('.'), value);

        // If value is object/array, proxy it too
        return createProxyInternal(value as any, {
          path: nextPath,
          onAccess: ctx.onAccess
        });
      },

      set(obj, prop: string | symbol, value) {
        if (typeof prop === 'symbol') {
          (obj as any)[prop] = value;
          return true;
        }

        const nextPath = ctx.path.concat(prop.toString());
        ctx.onAccess?.('set', nextPath.join('.'), value);

        (obj as any)[prop] = value;
        return true;
      },

      deleteProperty(obj, prop: string | symbol) {
        if (typeof prop === 'symbol') return false;

        const nextPath = ctx.path.concat(prop.toString());
        ctx.onAccess?.('delete', nextPath.join('.'));

        return delete (obj as any)[prop];
      }
    }) as any;
  }

  // Object (including ValueType-like objects)
  return new Proxy(target as any, {
    get(obj, prop: string | symbol) {
      if (typeof prop === 'symbol') {
        return (obj as any)[prop];
      }

      const value = (obj as any)[prop];
      const nextPath = ctx.path.concat(prop.toString());

      ctx.onAccess?.('get', nextPath.join('.'), value);

      // If value is object/array, proxy it too
      return createProxyInternal(value as any, {
        path: nextPath,
        onAccess: ctx.onAccess
      });
    },

    set(obj, prop: string | symbol, value) {
      if (typeof prop === 'symbol') {
        (obj as any)[prop] = value;
        return true;
      }

      const nextPath = ctx.path.concat(prop.toString());
      ctx.onAccess?.('set', nextPath.join('.'), value);

      (obj as any)[prop] = value;
      return true;
    },
    
    deleteProperty(obj, prop: string | symbol) {
      if (typeof prop === 'symbol') return false;

      const nextPath = ctx.path.concat(prop.toString());
      ctx.onAccess?.('delete', nextPath.join('.'));

      return delete (obj as any)[prop];
    }
  }) as Tracked<T>;
}

/** ---------- Public API ---------- */
export function createTrackedProxy<T extends Trackable>(
  target: T,
  ctx: ProxyContext = { path: [] }
): Tracked<T> {
  return createProxyInternal(target, ctx);
}
