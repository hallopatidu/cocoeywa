
import { __private, AssetManager, assetManager, cclegacy, ImageAsset, SpriteFrame, sys, Texture2D } from "cc";
import { BUILD } from "cc/env";
import CryptoJS from 'crypto-js';

type FileProgressCallback = (loaded: number, total: number) => void;
type DomImageInputParams = (url: Blob, options: Record<string, any>, onComplete: ((err: Error | null, data?: HTMLImageElement | null) => void)) => HTMLImageElement;
type DownloadResponseType = { error: Error | null, data?: any };

const BUILD_VERSION:string = "test";
const ENABLE:boolean = true;
const PASSWORD:string = "zR8umDA";
const SEED:number = 13;
const PERMS:number[]|null = null;
const RATIO:number = 0.1;
const SIGBYTES:Record<string, number> = {".png":388,".jpg":524,".jpeg":524};
// const SIGBYTES:Record<string, number> = {".png":4857,".jpg":6973,".jpeg":6973};

// ----------------

namespace ns540hz {
    export type IShufferOption = {
        seed?: number,
        partialRatio?: number
        perms?:number[] | null
        invertPerms?:number[] | null
    }

    export namespace utils{
        export namespace math{

            /**
             * @description Create an array of numbers from 0 to n-1
             * @param n 
             * @param out 
             * @returns 
             */
            export function range(n: number, out:number[] = []): number[] {
                return (n > 0) && out.unshift(--n) ? range(n, out) : out;
            }

            /**
             * @description Generate a random number based on the seed (ES5-compatible)
             * @param seed 
             * @returns 
             */
            export function seededRandom(seed: number): () => number {
                return function () {
                    seed = (seed * 9301 + 49297) % 233280;
                    return seed / 233280;
                };
            }

            /**
             * @description Get the Fisher-Yates permutation array according to the seed. 
             * @param length 
             * @param seed 
             * @returns 
             */
            export function getPermutation(length: number, seed: number): number[] {
                const rand:()=>number = seededRandom(seed);
                const perm:number[] = range(length);
                let i:number = length - 1;
                while(i > 0){
                    const j:number = Math.floor(rand() * (i + 1));
                    const temp:number = perm[i];
                    perm[i] = perm[j];
                    perm[j] = temp;
                    i--;
                }
                return perm;
            }

            /**
             * @description Get the inverse permutation array
             * @param perm 
             * @returns 
             */
            export function getInversePermutation(perm: number[]): number[] {
                var inverse: number[] = [];
                for (var i = 0; i < perm.length; i++) {
                    inverse[perm[i]] = i;
                }
                return inverse;
            }
            
        }


        export namespace array {
            const MAX_PERMU_NUMBER:number = 512;
            /**
             * @description Restore the partially shuffled array to its original order
             * 
             * @param arr 
             * @param seed 
             * @returns 
             */
            export function unshuffle(arr: number[], option:IShufferOption): number[] {
                const {seed, partialRatio, perms } = option; 
                const count:number = Math.min( Math.max(1, Math.floor(arr.length * (partialRatio || RATIO))), MAX_PERMU_NUMBER);//seed: number = 6886,  partialRatio:number = 0.1
                const shuffledPrefix:number[] = arr.slice(0, count);
                const rest:number[] = arr.slice(count);

                const perm:number[] = perms && perms.length ? perms : math.getPermutation(count, seed || 6886);
                const inverse:number[] = math.getInversePermutation(perm);
                const restoredPrefix:number[] = [];

                for (var i = 0; i < count; i++) {
                    restoredPrefix[i] = shuffledPrefix[inverse[i]];
                }

                return restoredPrefix.concat(rest);
            }
        }
        
    }

    export namespace assets{
        async function downloadFile(
            url: string,
            options: Record<string, any>,
            onProgress: FileProgressCallback | null | undefined
        ): Promise<DownloadResponseType> {
            return await new Promise<DownloadResponseType>((resolve: (resp: DownloadResponseType) => void) => {
                // 
                const xhr = new XMLHttpRequest();
                const errInfo = `download failed: ${url}, status: `;
                const uncachedUrl = url.includes('?') ? `${url}&v_build=${BUILD_VERSION}` : `${url}?v_build=${BUILD_VERSION}`;
                xhr.open('GET', uncachedUrl, true);

                if (options.xhrResponseType !== undefined) { xhr.responseType = options.xhrResponseType as XMLHttpRequestResponseType; }
                if (options.xhrWithCredentials !== undefined) { xhr.withCredentials = options.xhrWithCredentials as boolean; }
                if (options.xhrMimeType !== undefined && xhr.overrideMimeType) { xhr.overrideMimeType(options.xhrMimeType as string); }
                if (options.xhrTimeout !== undefined) { xhr.timeout = options.xhrTimeout as number; }

                if (options.xhrHeader) {
                    for (const header in options.xhrHeader) {
                        xhr.setRequestHeader(header, options.xhrHeader[header] as string);
                    }
                }

                xhr.onload = (): void => {
                    if (xhr.status === 200 || xhr.status === 0) {
                        resolve({ error: null, data: xhr.response })
                    } else {
                        resolve({ error: new Error(`${errInfo}${xhr.status}(no response)`) })
                    }
                };

                if (onProgress) {
                    xhr.onprogress = (e): void => {
                        if (e.lengthComputable) {
                            onProgress(e.loaded, e.total);
                        }
                    };
                }

                xhr.onerror = (): void => resolve({ error: new Error(`${errInfo}${xhr.status}(error)`) });
                xhr.ontimeout = (): void => resolve({ error: new Error(`${errInfo}${xhr.status}(time out)`) });
                xhr.onabort = (): void => resolve({ error: new Error(`${errInfo}${xhr.status}(abort)`) });
                xhr.send(null);
            })

        }

        async function createDomImage(blob: Blob, options: Record<string, any>, onComplete: ((err: Error | null, data?: any | null) => void)): Promise<HTMLImageElement> {
            // 
            try{
                const imgBitmap: ImageBitmap = await createImageBitmap(blob);
                if (onComplete) {
                    if(imgBitmap){
                        onComplete(null, imgBitmap);
                        return null as unknown as HTMLImageElement;
                    }else{
                        onComplete(new Error('Do not create image !')); 
                    }
                }
            }catch(error:any){
                // console.log()
                if (onComplete) { onComplete(error); }
            }

            return null as unknown as HTMLImageElement;
        }

        async function decryptImage(encryptedBlob:Blob, options:{startByte:number, password:string}):Promise<Blob> {
            // SIGBYTES
            const {startByte, password} = options;
            const imageType:string = encryptedBlob.type;//extension.replace(/^\./, 'image/');
            const trimmedBlob:Blob = encryptedBlob.slice(startByte);

            // // Bước 1: Chuyển Blob sang ArrayBuffer
            const arrayBuffer:ArrayBuffer = await trimmedBlob.arrayBuffer()
            // const uint8View = new Uint8Array(arrayBuffer);
            const decoder:TextDecoder = new TextDecoder('utf-8');
            const encryptedText:string = decoder.decode(arrayBuffer);
            const decrypted:CryptoJS.lib.WordArray = CryptoJS.enc.Base64.parse(encryptedText);
            // Chuyển về WordArray rồi sang Uint8Array
            const words = ns540hz.utils.array.unshuffle(decrypted.words, {
                seed: SEED,
                perms:PERMS?.length ? PERMS : null,
                partialRatio: RATIO
            });
            const sigBytes = decrypted.sigBytes;
            const u8 = new Uint8Array(sigBytes);
            for (let i = 0; i < sigBytes; i++) {
                u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            }
            // Tạo blob ảnh
            const decryptedBlob = new Blob([u8], { type: imageType });
            return decryptedBlob;
        }

        async function downloadEncryptedBlob (url: string, options: Record<string, any>, onComplete: ((err: Error | null, data?: any) => void)): Promise<void> {
            try{
                options.xhrResponseType = 'blob';
                const response: DownloadResponseType = await downloadFile(url, options, options.onFileProgress as FileProgressCallback);
                const extKey:string = ns540hz.assets.getFileExtension(url);
                const sigBytes:number = SIGBYTES[extKey];
                const decryptedBlob: Blob = await decryptImage(response.data,{
                  startByte:sigBytes,
                  password:PASSWORD
                });
                const imageUrl = URL.createObjectURL(decryptedBlob);
                URL.revokeObjectURL(imageUrl);
                onComplete(response.error, response.data);
            }catch(error:any){
                console.error('URL: ', url , error);
                onComplete(error, null);
            }
        };

        async function downloadEncryptedDomImage (url: string, options: Record<string, any>, onComplete: ((err: Error | null, data?: HTMLImageElement | ImageBitmap | null) => void)): Promise<void> {
            options.xhrResponseType = 'blob';
            // options.xhrResponseType = 'arraybuffer';
            // Download file
            try{
                const response = await downloadFile(url, options, options.onFileProgress as FileProgressCallback);
                if(!response){
                    throw new Error('Do not download image : ' + url);
                }
                // Decrypt file
                const extKey:string = ns540hz.assets.getFileExtension(url);
                const sigBytes:number = SIGBYTES[extKey];
                const decryptedBlob: Blob = await decryptImage(response.data,{
                  startByte:sigBytes,
                  password:PASSWORD
                });
                if(decryptedBlob){
                    await createDomImage(decryptedBlob, options, (...arg)=>{ 
                        URL.revokeObjectURL(url);
                        if(arg[0]){
                            console.error('Error Create Image:: ' + url)
                        }
                        onComplete(...arg) 
                    });
                }else {
                    throw new Error('Do not decrypt image : ' + url)
                }
            }catch(error:any){
                onComplete(error, null);
            }
        }
        
        export function downloadAndDecryptImage(url: string, options: Record<string, any>, onComplete: ((err: Error | null, data?: any) => void)): void {
            // if createImageBitmap is valid, we can transform blob to ImageBitmap. Otherwise, just use HTMLImageElement to load
            const allowImageBitmap: boolean = sys.hasFeature(sys.Feature.IMAGE_BITMAP) && cclegacy.assetManager.allowImageBitmap;
            if (allowImageBitmap) {
                downloadEncryptedBlob(url, options, onComplete);
            } else {
                downloadEncryptedDomImage(url, options, onComplete);
            }
        };

        /**
         * 
         * @param filePath 
         * @returns example '.png'
         */
        export function getFileExtension(filePath:string):string {
            const match = filePath.match(/(\.[^/.]+)$/);
            return match ? match[1] : '';
        }

    }
    
}

if(BUILD && ENABLE){
    const keys:string[] = Object.keys(SIGBYTES);
    keys.forEach((extKey:string)=>{
        assetManager.downloader.register(extKey, ns540hz.assets.downloadAndDecryptImage);    
    })
}

// Register image extension for decryption
// BUILD && assetManager.downloader.register('.png', ns540hz.assets.downloadAndDecryptImage);
// BUILD && assetManager.downloader.register('.jpg', ns540hz.assets.downloadAndDecryptImage);
// BUILD && assetManager.downloader.register('.jpeg', ns540hz.assets.downloadAndDecryptImage);
