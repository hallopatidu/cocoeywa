import { BuildHook, IBuildResult, IOptions, ITaskOptions } from '../@types';
import { cocoshield } from './decorator';
import { encrypt, generateDecryptFile, removeDecryptFiles, setupDecryptor } from './encryptor';
import { PACKAGE_NAME } from './global';
import { obfuscate } from './obfuscator';
import { generateGoogleAnalyticSDK, generateSentrySDK, generateTelemetrySDK } from './telemetry';
import { getAllFilesPath, removeAllSourceMaps, removeDevModeFolder, renameMD5Files } from './asset-handlers';
import { join } from 'path';

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

// let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocoshield in builder.`);
    // allAssets = await Editor.Message.request('asset-db', 'query-assets');    
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // TODO some thing
    log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
    const config: IOptions = options.packages[PACKAGE_NAME];
    Editor.Message.send('builder', 'open-devtools');
    if (config.securityOption == 'Auto') {
        // password tu 6 den 10 so
        config.password = cocoshield.utils.string.random(cocoshield.utils.number.randomInt(6, 10));
        config.seed = cocoshield.utils.number.randomInt(10, 1000)
    }

    await generateTelemetrySDK(config);
    await generateSentrySDK(config);
    await generateGoogleAnalyticSDK(config);
    await setupDecryptor(config);
    await generateDecryptFile(config);
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    console.debug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    console.log('webTestOption', 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    const config: IOptions = options.packages[PACKAGE_NAME];
    // 
    await obfuscate(result.paths.assets, config, join(result.dest, '..', 'sourcemaps'));
    await encrypt(result.paths.assets, config);
    await removeAllSourceMaps(result.paths.dir)
    await getAllFilesPath(result.paths.dir);
    // 
    await renameMD5Files(result.paths.dir, ['cnf.json', 'landingPage.jpg', 'landingPage.webp']);
    await removeDevModeFolder(result.paths.assets, config);
    // 
    // await removeDecryptFiles();
};

export const unload: BuildHook.unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    console.log(`onAfterMake: root: ${root}, options: ${options}`);
};
