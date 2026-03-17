import { IOptions } from "../@types";
import { cocoshield } from "./decorator";
import path, { join } from 'path';
import { EXTENSION_PATH, RUNTIME_PATH, TOOLS_PATH } from "./global";

const TELEMETRY_TOOL: string = 'generate-sentry';
const TELEMETRY_SCRIPT = './telemetry-modifier.js';
const TELEMETRY_FOLDER = 'telemetry';
const TELEMETRY_APP_PATH = join(EXTENSION_PATH, TOOLS_PATH + `/${TELEMETRY_TOOL}`, TELEMETRY_SCRIPT);

const SENTRY_TOOL: string = 'generate-sentry';
const SENTRY_SCRIPT = './sentry-modifier.js';
const SENTRY_FOLDER = 'sentry';

const GA_TOOL: string = 'generate-ga';
const GA_SCRIPT = './ga-loader.js';
const GA_FOLDER = 'ga';
const GA_APP_PATH = join(EXTENSION_PATH, TOOLS_PATH + `/${GA_TOOL}`, GA_SCRIPT);

const EXPORTED_PATCH_TELEMETRY_SCRIPT = './index.ts';
const EXPORTED_PATCH_SENTRY_SCRIPT = './index.ts';
const EXPORTED_PATCH_GA_SCRIPT = './index.ts';
const SENTRY_APP_PATH = join(EXTENSION_PATH, TOOLS_PATH + `/${SENTRY_TOOL}`, SENTRY_SCRIPT);

export async function generateTelemetrySDK(config: IOptions, runtimePath:string = RUNTIME_PATH) {
    if(config.enableSentry || config.enableGA){
        const runtimeTelemetryFolder:string = join(runtimePath, TELEMETRY_FOLDER);
        const patchScriptPath:string = join(runtimeTelemetryFolder, EXPORTED_PATCH_TELEMETRY_SCRIPT);
        const envOption = {
            ...process.env,
            LANG: 'en_US.UTF-8',
            PATCH_SCRIPT: patchScriptPath,
            TELEMETRY_ENVIRONMENT: config.environment,            
        }
        let result = await cocoshield.progress.spawn(
            'node',
            [TELEMETRY_APP_PATH],
            {
                env:envOption
            }, true
        );
        let success = result.isSuccess;
        let err = result.err;
        let data = result.data;
        
        if (success && err == null) {
            // Update new contents.
            const decryptorFileUrl:string = await Editor.Message.request('asset-db', 'query-url', patchScriptPath);
            await Editor.Message.request('asset-db', 'refresh-asset', decryptorFileUrl);
            // 
            console.log("✓ Implement Telemetry successfully");
        } else {
            console.error("❌ Implement Telemetry SDK failed: ", JSON.stringify(err));
        }
    }
}

export async function generateSentrySDK(config: IOptions, runtimePath:string = RUNTIME_PATH) {
    if(config.enableSentry){
        const runtimeSentryFolder:string = join(runtimePath, SENTRY_FOLDER);
        const patchScriptPath:string = join(runtimeSentryFolder, EXPORTED_PATCH_SENTRY_SCRIPT);
        const envOption = {
            ...process.env,
            LANG: 'en_US.UTF-8',
            PATCH_SCRIPT: patchScriptPath,
            SENTRY_ENVIRONMENT: config.environment,
            ENABLE:config.enableSentry ? 'true' : 'false',
            ENABLE_SENTRY_TELEMETRY: config.enableSentryTelemetry ? 'true' : 'false',
            DSN: config.sentryDSN,
            SENTRY_SAMPLE_RATE: config.sentrySampleRate,
            SENTRY_TRACE_SAMPLE_RATE: config.sentryTraceSampleRate,
            SENTRY_RELEASE: config.sentryRelease,
        }
        let result = await cocoshield.progress.spawn(
            'node',
            [SENTRY_APP_PATH],
            {
                env:envOption
            }, true
        );

        let success = result.isSuccess;
        let err = result.err;
        let data = result.data;
        
        if (success && err == null) {
            const decryptorFileUrl:string = await Editor.Message.request('asset-db', 'query-url', patchScriptPath);
            await Editor.Message.request('asset-db', 'refresh-asset', decryptorFileUrl);
            console.log("✓ Implement Sentry SDK successfully");
        } else {
            console.error("❌ Implement Sentry SDK failed: ", JSON.stringify(err));
        }
    }
}


export async function generateGoogleAnalyticSDK(config: IOptions, runtimePath:string = RUNTIME_PATH) {
    if(config.enableGA){
        const runtimeGAFolder:string = join(runtimePath, GA_FOLDER);
        const patchScriptPath:string = join(runtimeGAFolder, EXPORTED_PATCH_GA_SCRIPT);
        const envOption = {
            ...process.env,
            LANG: 'en_US.UTF-8',
            GA_ENVIRONMENT: config.environment,
            PATCH_SCRIPT: patchScriptPath,
            ENABLE:config.enableGA ? 'true' : 'false',
            GA_KEY: config.gaKey
        }
        let result = await cocoshield.progress.spawn(
            'node',
            [GA_APP_PATH],
            {
                env:envOption
            }, true
        );

        let success = result.isSuccess;
        let err = result.err;
        let data = result.data;
        
        if (success && err == null) {
            const decryptorFileUrl:string = await Editor.Message.request('asset-db', 'query-url', patchScriptPath);
            await Editor.Message.request('asset-db', 'refresh-asset', decryptorFileUrl);
            console.log("✓ Implement GA SDK successfully");
        } else {
            console.error("❌ Implement GA SDK failed: ", JSON.stringify(err));
        }
    }
}

