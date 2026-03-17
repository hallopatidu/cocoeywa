import { ExecOptions, exec as run, spawn as produce } from 'child_process';
// import { error, log } from 'console';
import { readdir, rm, stat, unlink } from 'fs/promises';
import path, { join } from 'path';

export namespace ns540hz {
    export interface IResultCmd {
        data: any;
        err: any;
        isSuccess: boolean;
    }
    
    export type IShufferOption = {
        seed?: number,
        partialRatio?: number
        perms?:number[]
    }

    export namespace progress{
        /**
         * @description Execute command
         * @param cmd 
         * @param options 
         * @param isLog 
         * @returns 
         */
        export async function exec(cmd: string,  options?: ExecOptions, isLog = true) {
            return new Promise<IResultCmd>((resolve, reject) => {
                isLog && console.log(`Execute Command : ${cmd}`);
                let result = run(cmd, options, (err, stdout, stderr) => {
                    if (err) {
                        isLog && console.error(`Execute Command : ${cmd} fail`);
                        isLog && console.error("err", err);
                        isLog && console.error("stderr", stderr);
                        resolve({ isSuccess: false, data: stdout , err: err});
                    } else {
                        resolve({ isSuccess: true,  data: stdout , err: err});
                    }
                });
                result.stdout?.on("data", (data) => {
                    isLog && console.log(data)
                });
                result.stderr?.on("error", (data) => {
                    isLog && console.error(data);
                })
            })
        }

        /**
         * @description Spawn command
         * @param cmd 
         * @param args 
         * @param options 
         * @param isLog 
         * @returns 
         */
        export async function spawn(cmd: string, args: string[], options?: ExecOptions, isLog = true) {
            return new Promise<IResultCmd>((resolve, reject) => {
                isLog && console.log(`Execute Command cmd: ${cmd}`);
                isLog && console.log(`|___ Command args: ${args}`);

                let ls = produce(cmd, args, options);

                ls.stdout.on("data", (data:Buffer) => {
                    // Buffer to string
                    let str = data.toString();
                    isLog && console.log("data", str);
                });

                ls.stderr.on("data", (data) => {
                    let str = data.toString();
                    isLog && console.error("stderr", str);
                });

                ls.on("close", (code) => {
                    if (code == 0) {
                        resolve({ isSuccess: true, data: code, err: null });
                    } else {
                        resolve({ isSuccess: false, data: code, err: null });
                    }
                    !ls.killed && ls.kill();
                });

            })
        }

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

        
        export namespace string {
            export function random(length:number):string {
                const _keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.";
                let str = "";
                for (let i = 0; i < length; i++) {
                    str += _keys[Math.floor((_keys.length - 1) *Math.random())];
                }
                return str;
            }
        }
        
        export namespace number {
            export function randomInt(min: number, max: number): number {
                // Tạo số nguyên ngẫu nhiên từ min đến max (bao gồm cả min và max)
                return Math.floor(Math.random() * (Math.ceil(max) - Math.floor(min) + 1)) + min;
            }
        }

        export namespace array {
            const MAX_PERMU_NUMBER:number = 512;
            /**
             * @description Shuffle the first 10% of the array, leaving the rest unchanged
             * 
             * @param arr 
             * @param seed 
             * @param partialRatio 
             * @returns 
             */
            export function shuffle(arr: number[], option:IShufferOption ): number[] {
                const {seed, partialRatio, perms } = option;
                const count:number = Math.min( Math.max(1, Math.floor(arr.length * partialRatio)), MAX_PERMU_NUMBER);//seed: number = 6886,  partialRatio:number = 0.1
                const prefix:number[] = arr.slice(0, count);
                const rest:number[] = arr.slice(count);
                const perm:number[] = perms ? perms : math.getPermutation(count, seed);
                const shuffledPrefix: number[] = [];
                for (var i = 0; i < count; i++) {
                    shuffledPrefix[i] = prefix[perm[i]];
                }
                
                return shuffledPrefix.concat(rest);
            }

            /**
             * @description Restore the partially shuffled array to its original order
             * 
             * @param arr 
             * @param seed 
             * @returns 
             */
            export function unshuffle(arr: number[], option:IShufferOption): number[] {
                const {seed, partialRatio, perms } = option;
                const count:number = Math.min( Math.max(1, Math.floor(arr.length * partialRatio)), MAX_PERMU_NUMBER);//seed: number = 6886,  partialRatio:number = 0.1
                const shuffledPrefix:number[] = arr.slice(0, count);
                const rest:number[] = arr.slice(count);

                const perm:number[] = perms ? perms : math.getPermutation(count, seed);
                const inverse:number[] = math.getInversePermutation(perm);
                const restoredPrefix:number[] = [];

                for (var i = 0; i < count; i++) {
                    restoredPrefix[i] = shuffledPrefix[inverse[i]];
                }

                return restoredPrefix.concat(rest);
            }
        }

        export namespace file{

            /**
             * Recursively get the addresses of all ['.png','.jpg', 'jpeg'] files
             * @param folderPath 
             * @param filePaths 
             * @returns 
             */
            export async function getAllImageFilePaths(folderPath: string, extensionFilters:string[], filePaths: string[] = []) {
                const files = await readdir(folderPath);
            
                for (const file of files) {
                    
                    const filePath = join(folderPath, file);
                    const fileStats = await stat(filePath);
                    if (fileStats.isDirectory()) {
                        await getAllImageFilePaths(filePath, extensionFilters, filePaths);
                    } else if (fileStats.isFile()) {
                        const ext:string = path.extname(file).toLowerCase();
                        // If it is a .js file, store its address in an array
                        if(extensionFilters.includes(ext)){
                            filePaths.push(filePath);
                        }
                    }
                }
            
                return filePaths;
            }

            /**
             * Recursively get the addresses of all .js files
             * @param folderPath 
             * @param jsFilePaths 
             * @returns 
             */
            export async function getAllJsFilePaths(folderPath: string, jsFilePaths: string[] = []) {
                const files = await readdir(folderPath);
            
                for (const file of files) {
                    const filePath = join(folderPath, file);
                    const fileStats = await stat(filePath);
            
                    if (fileStats.isDirectory()) {
                        if (file === 'cocos-js' || file === 'plugin' || file === 'jsb-adapter') {
                            // If the folder name is "cocos-js", skip processing
                            continue;
                        }
                        // If it is a subfolder, recursively process the files in the subfolder
                        await this.getAllJsFilePaths(filePath, jsFilePaths);
                    } else if (fileStats.isFile() && file.endsWith('.js')) {
                        // If it is a .js file, store its address in an array
                        jsFilePaths.push(filePath);
                    }
                }
            
                return jsFilePaths;
            }

            export  async function getBlobFromUrl(blobUrl:string):Promise<Blob> {
                const response = await fetch(blobUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch blob: ${response.statusText}`);
                }
                const blob = await response?.blob();
                return blob;
            }

            export async function getArrayBufferViewFromUrl(blobUrl:string|Blob):Promise<ArrayBufferView> {
                const blob:Blob = (typeof blobUrl == 'string') ? await getBlobFromUrl(blobUrl) : blobUrl;
                if(!blob){
                    throw new Error(`Failed to fetch buffer: ${blobUrl}`);
                }
                const arrayBuffer:ArrayBuffer = await blob.arrayBuffer();
                return new Uint8Array(arrayBuffer)
            }

            export async function createBitmapFromBlobURL(blobUrl: string): Promise<ImageBitmap> {
                // tải dữ liệu từ blob URL (chuyển về Blob)
                const response = await fetch(blobUrl);
                const blob = await response.blob();

                // tạo ImageBitmap trực tiếp
                const bitmap:ImageBitmap = await createImageBitmap(blob);
                return bitmap;
            }

            /**
             * Function to format file size bytes into human readable format
             * Eg, 12000 bytes => 11.7 KiB;
             * si = base unit 1000 or 1024 , true = 1000, false = 1024
             * @param bytes 
             * @param si 
             * @param dp 
             * @returns 
             */
            export function fileSizeInfo(bytes:number, si:boolean = true, dp:number = 1) {
                const thresh = si ? 1000 : 1024;
                if (Math.abs(bytes) < thresh) {
                    return bytes + ' B';
                }
                const units = si
                    ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
                    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
                let u = -1;
                const r = 10 ** dp;
                do {
                    bytes /= thresh;
                    ++u;
                } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
                return bytes.toFixed(dp) + ' ' + units[u];
            }

            export async function deleteAllFiles(folderPath: string) {
              try {
                const files = await readdir(folderPath);
                for (const file of files) {
                  const filePath = join(folderPath, file);
                  await unlink(filePath);
                  console.log(`Đã xóa: ${filePath}`);
                }
                console.log('✅ Đã xóa toàn bộ file trong thư mục ' + folderPath);
              } catch (err) {
                console.error('❌ Lỗi khi xóa file:', err);
              }
            }
            
            export async function removeFolder(folderPath: string) {
                try { 
                    await rm(folderPath, { recursive: true, force: true }); 
                    console.log(`Đã xóa thư mục: ${path}`); 
                } catch (err) {
                    console.error(`Lỗi khi xóa thư mục: ${err.message}`);
                }
            }

            /**
             * 
             * @param filename 
             * @returns 
             */
            export function removeMd5FromFilename(filename: string): string {
                // Regex: bắt toàn bộ tên gốc (có thể có nhiều dấu chấm),
                // bỏ đoạn MD5 (chuỗi không chứa dấu chấm) ngay trước extension
                const regex = /^(.+)\.[^.]+\.(\w+)$/;
                const match = filename.match(regex);
            
                if (match) {
                    const baseName = match[1];   // phần tên gốc trước MD5
                    const extension = match[2];  // phần extension
                    return `${baseName}.${extension}`;
                }
            
                // Nếu không khớp (không có MD5), giữ nguyên
                return filename;
            }

        }

        export namespace url{
            function getGameCodeFromBrowserUrl(): string | null {
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

                    // Lấy trường gameCode
                    return obj.gameCode ?? null;
                } catch (error) {
                    console.error("Error parsing data param:", error);
                    return null;
                }
            }
        }
    
    }
}
