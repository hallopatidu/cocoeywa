

// import { AssetHandlers } from '../@types';
import { AssetHandlers } from '@cocos/creator-types/editor/packages/builder/@types/public';
import { outputFile } from 'fs-extra';
import { readdir, stat, unlink, rename, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { cocoshield } from './decorator';
import { IOptions } from '../@types';

export const compressTextures: AssetHandlers.compressTextures = async (tasks) => {
    console.debug(`Execute compress task ${tasks}`);
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (task.format !== 'jpg') {
            continue;
        }
        // task.dest should change suffix before compress
        task.dest = task.dest.replace('.png', '.jpg');
        await pngToJPG(task.src, task.dest, task.compressOptions.quality as number);
        // The compress task have done needs to be removed from the original tasks
        tasks.splice(i, 1);
        i--;
    }
};

async function pngToJPG(src: string, dest: string, quality: number) {
    const img = await getImage(src) as CanvasImageSource;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', quality / 100);
    await outputFile(dest, imageData);
    console.debug('pngToJPG', dest);
}

function getImage(path: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function (err) {
            reject(err);
        };
        img.src = path.replace('#', '%23');
    });
}

/**
 * Remove all source map files (*.js.map) from a given directory and its subdirectories
 * @param folderPath - The path to the folder to search for source map files
 * @returns Promise<{ removed: string[], errors: Array<{ file: string, error: string }> }>
 */
export async function removeAllSourceMaps(folderPath: string): Promise<{ removed: string[], errors: Array<{ file: string, error: string }> }> {
    const removedFiles: string[] = [];
    const errors: Array<{ file: string, error: string }> = [];

    try {
        // Check if the folder exists
        await stat(folderPath);
    } catch (error) {
        console.error(`Folder does not exist: ${folderPath}`);
        return { removed: removedFiles, errors: [{ file: folderPath, error: 'Folder does not exist' }] };
    }

    async function processDirectory(dirPath: string): Promise<void> {
        try {
            const items = await readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const fullPath = join(dirPath, item.name);

                if (item.isDirectory()) {
                    // Recursively process subdirectories
                    await processDirectory(fullPath);
                } else if (item.isFile()) {
                    if (item.name.endsWith('.js.map')) {
                        // Found a source map file, remove it
                        try {
                            await unlink(fullPath);
                            removedFiles.push(fullPath);
                            console.log(`Removed source map: ${fullPath}`);
                        } catch (deleteError) {
                            const errorMsg = deleteError instanceof Error ? deleteError.message : 'Unknown error';
                            errors.push({ file: fullPath, error: errorMsg });
                            console.error(`Failed to remove source map ${fullPath}:`, errorMsg);
                        }
                    } else if (item.name.endsWith('.js')) {
                        // Check and remove source map reference in JS file
                        try {
                            const content = await readFile(fullPath, 'utf8');
                            // Remove lines like //# sourceMappingURL=... or //@ sourceMappingURL=...
                            const newContent = content.replace(/^[ \t]*(\/\/[@#] sourceMappingURL=.*)$\r?$/gim, '').replace(/\n{2,}/g, '\n');
                            if (newContent !== content) {
                                await writeFile(fullPath, newContent, 'utf8');
                                removedFiles.push(fullPath + ' (sourceMappingURL reference removed)');
                                console.log(`Removed sourceMappingURL reference in: ${fullPath}`);
                            }
                        } catch (jsError) {
                            const errorMsg = jsError instanceof Error ? jsError.message : 'Unknown error';
                            errors.push({ file: fullPath, error: errorMsg });
                            console.error(`Failed to process JS file ${fullPath}:`, errorMsg);
                        }
                    }
                }
            }
        } catch (readError) {
            const errorMsg = readError instanceof Error ? readError.message : 'Unknown error';
            errors.push({ file: dirPath, error: errorMsg });
            console.error(`Failed to read directory ${dirPath}:`, errorMsg);
        }
    }

    await processDirectory(folderPath);

    console.log(`Source map cleanup complete. Removed ${removedFiles.length} files, ${errors.length} errors.`);
    return { removed: removedFiles, errors };
}


/**
 * Recursively list all files in a folder and save the list as removeCache.json in the input folder.
 * @param folderPath - The path to the folder to scan
 * @returns Promise<string[]> - The list of file paths (relative to the input folder)
 */
export async function getAllFilesPath(folderPath: string): Promise<string[]> {
    const filesList: string[] = [];
    const baseLen = folderPath.endsWith('/') || folderPath.endsWith('\\') ? folderPath.length : folderPath.length + 1;

    async function scan(dir: string) {
        const items = await readdir(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = join(dir, item.name);
            if (item.isDirectory()) {
                await scan(fullPath);
            } else if (item.isFile()) {
                // Save path relative to input folder
                filesList.push(fullPath.slice(baseLen).replace(/\\/g, '/'));
            }
        }
    }

    await scan(folderPath);
    const cachePath = join(folderPath, 'removeCache.json');
    await writeFile(cachePath, JSON.stringify(filesList, null, 2), 'utf8');
    return filesList;
}

/**
 * Hàm rename toàn bộ file trong folder,
 * chỉ xử lý những file có tên gốc nằm trong danh sách filesToClean
 * @param folderPath đường dẫn folder
 * @param filesToClean danh sách file gốc (chưa bị thêm MD5), ví dụ: ["cnf.json", "landingPage.jpg"]
 */
export async function renameMD5Files(folderPath: string, filesToClean: string[]): Promise<void> {
    const files = await readdir(folderPath);
    const cleanSet = new Set(filesToClean); // tối ưu tra cứu

    const renameTasks = files.map(async (file) => {
        const cleanedName = cocoshield.utils.file.removeMd5FromFilename(file);
        if (cleanSet.has(cleanedName) && cleanedName !== file) {
            const oldPath = join(folderPath, file);
            const newPath = join(folderPath, cleanedName);
            await rename(oldPath, newPath);
            console.log(`Renamed: ${file} -> ${cleanedName}`);
        }
    });

    await Promise.all(renameTasks);
}

export async function removeDevModeFolder(folderPath: string, config: IOptions): Promise<void> {
    if (config.environment == 'QA') {
        return;
    }
    const devModeFolderPath = join(folderPath, 'devmode');
    try {
        const stats = await stat(devModeFolderPath);
        if (stats.isDirectory()) {
            // remove folder
            await cocoshield.utils.file.removeFolder(devModeFolderPath);
            console.log(`Removed devmode folder: ${devModeFolderPath}`);
        }
    } catch (err) {
        // Folder does not exist, nothing to do
    }
}


