import CryptoJS from 'crypto-js';
import { copyFile, mkdir, readdir, readFile, rm, rmdir, stat, unlink, writeFile,  } from 'fs/promises';
import path, { join } from 'path';
import { EXTENSION_PATH, RUNTIME_PATH, SUPPORT_ENCRYPTED_IMAGES, TOOLS_PATH } from './global';
import { cocoshield } from './decorator';
import { existsSync } from 'fs';
import { IOptions } from '../@types';
import { size } from 'cc';
import { buffer } from 'stream/consumers';
import { IAssetMeta } from '@cocos/creator-types/editor/packages/asset-db/@types/public';

const DECRYPTOR_TOOL: string = 'generate-decryptor';
const OFFSET_IMAGE_NAME:string = 'logo.png';
const DECRYPTOR_SCRIPT = './decryptor.js';
const RUNTIME_SCRIPT = './runtime.ts';
const EXPORTED_PATCH_SCRIPT = './index.ts';
const DECRYPT_FOLDER_NAME = 'decryptor';
const DECRYPTOR_APP_PATH = join(EXTENSION_PATH, TOOLS_PATH + `/${DECRYPTOR_TOOL}`, DECRYPTOR_SCRIPT);
const RUNTIME_APP_PATH = join(EXTENSION_PATH, TOOLS_PATH + `/${DECRYPTOR_TOOL}`, RUNTIME_SCRIPT);
const AVATAR_PATH = join(EXTENSION_PATH, TOOLS_PATH + `/${DECRYPTOR_TOOL}`, OFFSET_IMAGE_NAME);

// const IMG_EXT_LIST:string[] = ['.png','.jpg', '.jpeg'];

let ENCRYPT_PASSWORD = 'hallopatidu';
let SEED = 6969;
let PERMS = [];

const DefaultOffsetBuffers:Map<string, Buffer> = new Map<string, Buffer>();

export async function setupDecryptor(config: IOptions) {
    const decryptedFile:string = EXPORTED_PATCH_SCRIPT ;//config.password + '.ts' || EXPORTED_PATCH_SCRIPT;
    const runtimeDecryptorFolder:string = join(RUNTIME_PATH, DECRYPT_FOLDER_NAME);
    const patchScriptPath:string = join(runtimeDecryptorFolder, decryptedFile);
    try{
        if(!existsSync(runtimeDecryptorFolder)){
            await Editor.Message.request('asset-db', 'query-ready');            
            await mkdir(runtimeDecryptorFolder);
            const folderUrl:string = await Editor.Message.request('asset-db', 'query-url', runtimeDecryptorFolder);
            await Editor.Message.request('asset-db', 'refresh-asset', folderUrl);
        }
        if(!existsSync(patchScriptPath)){            
            await copyFile(RUNTIME_APP_PATH, patchScriptPath);
            const url:string = await Editor.Message.request('asset-db', 'query-url', patchScriptPath);
            // await Editor.Message.request('asset-db', 'reimport-asset', url);
            await Editor.Message.request('asset-db', 'refresh-asset', url);            
        }
        
        for (let index = 0; index < SUPPORT_ENCRYPTED_IMAGES.length; index++) {
            const ext:string = SUPPORT_ENCRYPTED_IMAGES[index];
            const filePath:string = AVATAR_PATH.replace(/\.[^/.]+$/, ext);
            const buffer:Buffer = await readFile(filePath);
            buffer && DefaultOffsetBuffers.set(ext, buffer);
        }
        console.log("✓ Setup Decryptor successfully");
    }catch(err){
        await rmdir(runtimeDecryptorFolder, { recursive: true, maxRetries: 3, retryDelay: 500 })
        console.error("❌ Setup decryptor failed: ", JSON.stringify(err));
    }
}

export async function generateDecryptFile(config: IOptions, runtimePath:string = RUNTIME_PATH){
    const partialRatio:number = config.encryptionLevel/100;
    const runtimeDecryptorFolder:string = join(runtimePath, DECRYPT_FOLDER_NAME);
    const decryptedFile:string = EXPORTED_PATCH_SCRIPT ;// config.password + '.ts' || EXPORTED_PATCH_SCRIPT;
    const patchScriptPath:string = join(runtimeDecryptorFolder, decryptedFile);

    const sigBytesRecords:Record<string, number> = {};

    DefaultOffsetBuffers.forEach((buffer:Buffer, key:string)=>{
        sigBytesRecords[key] = buffer.byteLength;
    })
    const envOption = {
        ...process.env,
        LANG: 'en_US.UTF-8',
        PATCH_SCRIPT: patchScriptPath,
        ENABLE:config.enableEncryption ? "true":"false",
        BUILD_VERSION: config.sentryRelease || (Date.now().toString()) || '1.0.0',
        PASSWORD: config.password ? config.password : ENCRYPT_PASSWORD,
        SEED: config.seed ? config.seed.toString() : SEED.toString(),
        RATIO: (partialRatio !== undefined && partialRatio !== null) ? partialRatio.toString() : "0.1",
        SIGBYTES: sigBytesRecords ? JSON.stringify(sigBytesRecords) : '{}'
    }
    if(PERMS.length) {
        envOption['PERMS'] = PERMS;
    }
    let result = await cocoshield.progress.spawn(
        'node',
        [DECRYPTOR_APP_PATH],
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
        console.log("✓ Generate Dencryption code successfully with build version: " + envOption.BUILD_VERSION);
    } else {
        console.error("❌ Generate Dencryption code failed with build version: " + envOption.BUILD_VERSION, ' - Error: ' + err, ' - Data: ' + JSON.stringify(data));
    }
}



export async function removeDecryptFiles(runtimePath:string = RUNTIME_PATH) {
    DefaultOffsetBuffers.clear();
    const runtimeDecryptorFolder:string = join(runtimePath, DECRYPT_FOLDER_NAME);
    await cocoshield.utils.file.deleteAllFiles(runtimeDecryptorFolder);
}    


/**
 * 
 * @param folderPath 
 */
export async function encrypt(folderPath:string, config:IOptions){
    if(config.enableEncryption){
        const files = await cocoshield.utils.file.getAllImageFilePaths(folderPath, SUPPORT_ENCRYPTED_IMAGES);
        const encryptProgress:Promise<void>[] = [];
        // console.log('\n START convert ' ,files, '\n')
        files.forEach((file:string)=>{
            // const ext = path.extname(file).toLowerCase();
            // if (SUPPORT_ENCRYPTED_IMAGES.includes(ext)) {
                // console.log('|_____ Start Encrypts  ' + file)
                encryptProgress.push(encryptFile(file, file, config));
            // }
        })
        await Promise.all(encryptProgress);
    }
}


/**
 * 
 * @param filePath 
 * @param outputPath 
 */
async function encryptFile(filePath:string, outputPath:string, config:IOptions) {
    try{
        await encryptPartialFile(filePath, outputPath, config);
        // const uuid:string = path.basename(filePath).replace(/^(.*)\.[^.]+$/, "$1");
        // await Editor.Message.request('asset-db', 'query-url', uuid)
        console.log(`✓ Encrypted file "${filePath}" successfully`);
    }catch(err){
        console.error('❌ Encryption failure : ' + filePath)
    }
}

/**
 * @description Encrypts a file by applying a partial encryption algorithm and writing the result to the output path.
 * @param filePath The path of the file to be encrypted.
 * @param outputPath The path where the encrypted file will be saved.
 * @param config    
 */
async function encryptPartialFile(filePath:string, outputPath:string, config:IOptions) {
    const extKey:string = path.extname(filePath).toLowerCase();
    const offsetBuffer:Buffer = DefaultOffsetBuffers.get(extKey);
    const data:Buffer = await readFile(filePath);
    const wordArray = CryptoJS.lib.WordArray.create(data as Uint8Array);
    const partialRatio:number = config.encryptionLevel/100;
    wordArray.words = cocoshield.utils.array.shuffle(wordArray.words, {
        seed:config.seed,
        partialRatio:partialRatio
    });

    // const encrypted:string = CryptoJS.AES.encrypt(wordArray, config.password).toString();
    const encrypted:string = CryptoJS.enc.Base64.stringify(wordArray);

    const encryptedBuffer:Uint8Array<ArrayBuffer> = (new TextEncoder()).encode(encrypted);    
    const tmp:Uint8Array = new Uint8Array(offsetBuffer.byteLength + encryptedBuffer.byteLength);
    tmp.set(new Uint8Array(offsetBuffer), 0);
    tmp.set(encryptedBuffer, offsetBuffer.byteLength);

    await writeFile(outputPath, tmp, {encoding:'binary'});
    // console.log(`✅ Encrypted success: ${path.basename(filePath)}`);
    // console.log('   |__ Paths : ' + filePath);
    // console.log('   |__ Offset Bytes : ' + offsetBuffer.byteLength);
    // console.log('   |__ Encrypted Bytes : ' + encryptedBuffer.byteLength);
    // console.log('   |__ Total Bytes : ' + tmp.byteLength);
    // await writeFile(outputPath, new Uint8Array(data), {encoding:'binary'});
    
    // debugger;
}


