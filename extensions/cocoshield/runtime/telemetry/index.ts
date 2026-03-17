import { js, log } from "cc";
import { BUILD } from "cc/env";

export type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug' | 'assert' | 'trace';

export type ITelemetryTagInfo = {
    [n:string]:any
}
export type ITelemetryInfo = {
    type:string,
    category:string,
    message:string,
    level:"fatal"| "error"|"warning"| "log"| "info" | "debug",
    data:{
        id:string,
        [n:string]:any
    },
    timestamp?:string,
}
type ILogFunction = (...args:any)=>void
type ILogLevelOption = {
    [n in ConsoleLevel | string]?: ILogFunction;
} //& {trace?:ILogFunction};

const cLog:Function = console.log.bind(console);
const cWarn:Function = console.warn.bind(console);
const cError:Function = console.error.bind(console);
const cTrace:Function = console.trace.bind(console);
const cInfo:Function = console.info.bind(console);
const cDebug:Function = console.debug.bind(console);

const TELEMETRY_ENVIRONMENT:string = 'QA';

// BUILD && console.log('Start Sentry !')
const logLevelOptions:ILogLevelOption = {
    log : function(...args:any){
        (TELEMETRY_ENVIRONMENT == 'QA') && cLog(`DEV ${Date.now().toString()}`, ...args);
    },
    error : function(...args:any){
        (TELEMETRY_ENVIRONMENT == 'QA') &&  cError(`DEV ${Date.now().toString()}`, ...args);        
    },
    warn : function(...args:any){
        (TELEMETRY_ENVIRONMENT == 'QA') &&  cWarn(`DEV ${Date.now().toString()}`, ...args);
    },
    debug : function(...args:any){
        // cDebug(`DEV ${Date.now().toString()}`, ...args);
    },
    trace : function(...args:any){
        if(BUILD){
            Telemetry.instance?.trace(...args);
        }else{
            cTrace(`DEV ${Date.now().toString()}`, ...args)
        }
    },
    info:  function(...args:any){
        if(BUILD){
            Telemetry.instance?.info(...args);
        }else{
            if(args.length == 1){
                cInfo(`DEV ${Date.now().toString()}` , JSON.stringify(args[0]));
            }else{
                cInfo(`DEV ${Date.now().toString()}` , ...args);
            }
        }

    }
};


export default class Telemetry {
    private static _instance: Telemetry | null = null;
    public static get instance(): Telemetry | null {
        if (!this._instance) {
            this._instance = new Telemetry();
        }
        return Telemetry._instance;
    }

    private _logEvents: ILogFunction[] = [];
    private _traceEvents: ILogFunction[] = [];
    
    register(level:ConsoleLevel, logEvent:ILogFunction){
        this._logEvents.push(logEvent);
    }

    info(...args:any){ 
        this._logEvents.forEach(callFunc=>{
            callFunc && callFunc(...args);
        });
    }

    trace(...args:any){
        this._traceEvents.forEach(callFunc=>{
            callFunc && callFunc(...args);
        });
    }

    getGameInfo(): {gameCode:string, operator:string, username:string}|null {
        try {
            // Lấy URL hiện tại từ trình duyệt
            const currentUrl = window.location.href;

            // Phân tích cú pháp URL
            const parsedUrl = new URL(currentUrl);

            // Lấy giá trị param "data"
            const dataParam = parsedUrl.searchParams.get("data");
            if (!dataParam) {
                return null;
            }

            // Giải mã base64 → chuỗi JSON
            const jsonString = atob(dataParam);

            // Phân tích JSON thành object
            const obj = JSON.parse(jsonString);
            // const {gameCode, operator, username} = obj;
            // Lấy trường gameCode
            return obj ? {
                gameCode:obj.gameCode,
                operator:obj.operator,
                username:obj.username
            } : null;
        } catch (error) {
            console.error("Error parsing data param:", error);
            return null;
        }
    }
    
}

if(BUILD){
    for (const [level, handler] of Object.entries(logLevelOptions)) {
        const desc = js.getPropertyDescriptor(console, level)
        js.value(console, level, handler.bind(console), desc.writable,desc. enumerable)
    }
}