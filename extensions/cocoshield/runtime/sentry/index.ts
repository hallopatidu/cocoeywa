import * as Sentry from "@sentry/browser";
import { js } from "cc";
import { BUILD, EDITOR } from "cc/env";
import Telemetry, { ConsoleLevel, ITelemetryInfo, ITelemetryTagInfo } from "../telemetry";



type CaptureContext = {
    user?: {
        id?: string | number,
        email?: string,
        ip_address?: string,
        username?: string,
    }
    level?: "fatal" | "error" | "warning" | "log" | "info" | "debug",
    // Additional data that should be sent with the exception.
    extra?: Record<string, unknown>,
    // Additional tags that should be sent with the exception.
    tags?: Record<string, string>,
    contexts?: Record<string, Record<string, unknown>>,
    fingerprint?: string[],
}


const DSN:string = "https://96d2c54d9e6abf394b4a280ab233b0ac@o4510186320166912.ingest.us.sentry.io/4510187025793024";
const ENABLE:boolean = true;
const ENABLE_SENTRY_TELEMETRY:boolean = false;
const SENTRY_RELEASE:string = "test";
const SENTRY_SAMPLE_RATE:number = 1;
const SENTRY_TRACE_SAMPLE_RATE:number = 1;
const SENTRY_ENVIRONMENT:string = "QA";
const SENTRY_BROWSER_TRACING:boolean = true;
const SENTRY_BROWSER_API_ERRORS:boolean = true;


(function (){
        const registerLogLevels:ConsoleLevel[] = ['error'];
        
        if(ENABLE_SENTRY_TELEMETRY){
            // Tam dong do ly do phia config build tool thuong config sai.
            // Telemetry.instance?.register('info', function(...args:any){
            //     if(ENABLE){ 
            //         const telemetryInfo:ITelemetryInfo = args[0];
            //         if(typeof telemetryInfo == 'object'){
            //             if(!telemetryInfo.level){
            //                 telemetryInfo.level = 'info';
            //             }
            //             Sentry.addBreadcrumb.apply(Sentry, args);
            //             const telemetryTagInfo = {
            //                 event:telemetryInfo.category,
            //                 game:telemetryInfo.data?.id,
            //                 // params:sentryInfo.data?.params
            //             } as ITelemetryTagInfo;
            //             if(telemetryInfo.data){
            //                 const keys:string[] = Object.keys(telemetryInfo.data);
            //                 keys.forEach((key:string)=>{
            //                     telemetryTagInfo[key] = telemetryInfo.data[key];
            //                 })
            //             }
            //             // 
            //             Sentry.captureMessage(telemetryInfo.message, {
            //                 level:'info',
            //                 tags: telemetryTagInfo
            //                 // extra: Object.create(sentryInfo.data)
            //             } as CaptureContext)
            //         }else{
            //             Sentry.logger.info.apply(Sentry.logger, args);
            //         }
            //     }
            // });
        }
        // 
        const gameProfile: any = Telemetry.instance?.getGameInfo();
        // 

        // 
        // Initialize Sentry
        Sentry.init({
            dsn: DSN,
            sampleRate:SENTRY_SAMPLE_RATE,
            environment:SENTRY_ENVIRONMENT,
            release: SENTRY_RELEASE,
            // Setting this option to true will send default PII data to Sentry.
            // For example, automatic IP address collection on events
            sendDefaultPii: true,
            integrations: [
                // send console.log, console.warn, and console.error calls as logs to Sentry
                Sentry.consoleLoggingIntegration({ levels: registerLogLevels }),
                //Sentry.browserTracingIntegration(),
                Sentry.breadcrumbsIntegration()
                // Sentry.browserApiErrorsIntegration()
            ],
            // Enable logs to be sent to Sentry
            enableLogs: true,
            tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
            beforeSendLog: (log) => {
                if (!ENABLE_SENTRY_TELEMETRY && log.level === "info") {
                    // Filter out all info logs
                    return null;
                }
                return log;
            },
            beforeSend(event:Sentry.ErrorEvent, hint: Sentry.EventHint):Sentry.ErrorEvent{
                // hint.originalException
                event.tags = {
                    ...event.tags,
                    environment: SENTRY_ENVIRONMENT,
                    // error_type: "exception"
                }
                if(gameProfile){
                    event.tags.operator = gameProfile?.operator;
                    event.tags.game = gameProfile?.gameCode;
                    event.tags.user_name = gameProfile?.username;
                }else{
                    event.tags.operator = "LOCALHOST";
                    event.tags.game = '*';
                    event.tags.user_name = 'DEV';
                }
                return event
            },
            ignoreSpans: [
                // Browser connection events
                { op: /^browser\.(cache|connect|DNS)$/ },
                // Fonts
                { op: "resource.other", name: /.+\.(woff2|woff|ttf|eot)$/ },
                // CSS files
                { op: "resource.link", name: /.+\.css.*$/ },
                // Images
                {
                    op: /resource\.(other|img)/,
                    name: /.+\.(png|svg|jpe?g|gif|bmp|tiff?|webp|avif|heic?|ico).*$/,
                },
                // Measure spans
                { op: "measure" },
            ],
        });
        // 
        if(BUILD){
            // const gameCode:string|null = getGameCodeFromBrowserUrl()
            gameProfile && Sentry.setTag("game", gameProfile.gameCode);
        }
        
        // 
})()


