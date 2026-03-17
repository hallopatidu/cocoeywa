import { join } from "path";

export const PACKAGE_NAME = 'cocoshield';
export const EXTENSION_PATH: string = join(__dirname, "..");
export const RUNTIME_PATH = join(EXTENSION_PATH, './runtime');

export const TOOLS_PATH = './tools';

// export const SUPPORT_ENCRYPTED_IMAGES:string[] = ['.png'];
export const SUPPORT_ENCRYPTED_IMAGES: string[] = ['.png', '.jpg', '.jpeg'];