import { IOptions } from "../@types";
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
// import { asyncExec, asyncSpawn, ResultCmd } from './progress-runner';
import { ns540hz } from "./decorator";
import { EXTENSION_PATH, TOOLS_PATH } from "./global";

const TOOL_NAME: string = 'js-obfuscator';
const OBFUSCATE_APP = './obfuscate.js';
const PACKAGE_PATH: string = TOOLS_PATH + `/${TOOL_NAME}`;
const OBFUSCATE_OPTIONS_PATH: string = TOOLS_PATH + `/${TOOL_NAME}/options`;

/**
 * 
 * @param folderPath 
 * @param config 
 * @returns 
 */
export async function obfuscate(folderPath: string, config: IOptions, sourceMapPath: string): Promise<void> {
    console.log("obfuscate config", JSON.stringify(config), folderPath);
    if (!config.isObfuscate) {
        return;
    }
    // Check if the folder exists
    let obfuscateConfigPath = getObfuscateConfigPath(config);
    if (obfuscateConfigPath) {
        // Convert to absolute path
        console.log("Obfuscation configuration file path: ", obfuscateConfigPath.toString());

        //Check if the configuration file exists
        try {
            await stat(obfuscateConfigPath);
            console.log("The configuration file exists: ", obfuscateConfigPath);
        } catch (error) {
            console.error("The configuration file does not exist: ", obfuscateConfigPath);
            return;
        }
        const obfuscatePath:string = join(EXTENSION_PATH, PACKAGE_PATH, OBFUSCATE_APP);
        console.log("Run script obfuscate: ", obfuscatePath);
        let result = await ns540hz.progress.spawn(
            'node',
            // [join(PLUGIN_PATH, PACKAGE_PATH, OBFUSCATE_APP)],
            [obfuscatePath],
            {
                env: {
                    ...process.env,
                    LANG: 'en_US.UTF-8',
                    PATH_OBFUSCATE: folderPath,
                    CONFIG_OBFUSCATE: obfuscateConfigPath,
                    OUTPUT_SOURCEMAP_PATH: sourceMapPath
                }
            }
        );

        let success:boolean = result.isSuccess;
        let err = result.err;
        let data = result.data;

        console.log("Obfuscated code data", JSON.stringify(data));

        if (success && err == null) {
            console.log("Obfuscated code successfully");
        } else {
            console.error("Obfuscation code failed: ", JSON.stringify(err));
        }
    } else {
        console.error("Config do not exist !");
    }
}

/**
 * 
 * @param config 
 * The config parameter in your getObfuscateConfigPath function is typed as IOptions. This means it should be an object that follows the IOptions interface structure.
 * Based on your code, config is expected to have at least these properties:
 *  obSelect: a string that determines the obfuscation level or type. Possible values are "low", "medium", "high", or "config".
 *  obConfigPath: a string, used when obSelect is "config", representing the path to a custom obfuscation configuration file.
 * @returns 
 */
function getObfuscateConfigPath(config: IOptions): string {
    if (!config) {
        return null
    }
    const selectedOptionType: string = config.obSelect;
    switch (selectedOptionType) {
        case "low":
        case "medium":
        case "high":
            console.log(`Selected ${selectedOptionType} obfuscation`)
            return join(EXTENSION_PATH, OBFUSCATE_OPTIONS_PATH + `/${selectedOptionType}.json`);

        case "config":
            console.log("Selected custom obfuscation");
            return config.obConfigPath;
        default:
            console.error("Unknown obfuscation options");
            return null;
    }
}


