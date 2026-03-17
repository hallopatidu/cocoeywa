import { syncScenarioFolder } from "./tools/setup-project";



/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    showLog() {
        console.log('Hello World');
    },
};

export function load() {
    syncScenarioFolder();
    console.log('Load cocoeywa !!!')
}

/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
export function unload() { }


// --------------
/**
 * @en Get project name from package.json
 * @zh 从 package.json 获取项目名称
 */
// function getProjectName(): string {
//     try {
//         const packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json');
//         const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
//         return packageJson.name || 'project';
//     } catch (error) {
//         console.error('Failed to read package.json:', error);
//         return 'project';
//     }
// }