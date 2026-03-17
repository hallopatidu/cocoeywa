import { BUILD, EDITOR } from "cc/env";
import Telemetry, { ITelemetryInfo } from "../telemetry";

const GA_ENVIRONMENT:string = "QA";
const GA_KEY:string = "G-CXFP1FLH1F";
const ENABLE:boolean = true;


if(ENABLE && BUILD){
    (function (window:any, document:Document){
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            
            return;
        };
        // Kiểm tra nếu đã có script GA
        // if (document.querySelector(`script[src*="google-analytics.com"]`)) return;
        const gameProfile: {gameCode:string, operator:string, username:string} = Telemetry.instance.getGameInfo();
        // Tạo thẻ script
        const script:HTMLScriptElement = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_KEY}`;
         // Khi script đã tải, khởi tạo GA
        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function (){window.dataLayer.push(arguments);}
            window.gtag('js', new Date());
            window.gtag('config', GA_KEY, {
                'user_id': gameProfile.username,
                'send_page_view': false
            });
            Telemetry.instance.register('info',(...args)=>{
                const defaultTelemetryInfo:ITelemetryInfo = args[0];
                if(typeof defaultTelemetryInfo == 'object'){
                    if(!defaultTelemetryInfo.level){
                        defaultTelemetryInfo.level = 'info';
                    }
                    // 
                    const telemetryTagInfo = {
                        // event:telemetryInfo.category,
                        game:defaultTelemetryInfo.data?.id || gameProfile?.gameCode,                        
                        operator: gameProfile.operator,  
                        player : gameProfile.username,                      
                        environment: GA_ENVIRONMENT,
                        timestamp: Date.now(),
                    };
                    if(defaultTelemetryInfo.data){
                        const keys:string[] = Object.keys(defaultTelemetryInfo.data);
                        keys.forEach((key:string)=>{
                            telemetryTagInfo[key] = defaultTelemetryInfo.data[key];
                        })
                    }
                    window.gtag('event', defaultTelemetryInfo.category, telemetryTagInfo);
                }
            })
        };
        // 
        document.body.appendChild(script);
        // 
    })(window || globalThis.window, document || globalThis.document);
}