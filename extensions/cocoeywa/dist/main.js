"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
const setup_project_1 = require("./tools/setup-project");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    /**
     * @en A method that can be triggered by message
     * @zh 通过 message 触发的方法
     */
    showLog() {
        console.log('Hello World');
    },
};
function load() {
    (0, setup_project_1.syncScenarioFolder)();
    console.log('Load cocoeywa !!!');
}
/**
 * @en Method triggered when uninstalling the extension
 * @zh 卸载扩展时触发的方法
 */
function unload() { }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWtCQSxvQkFHQztBQU1ELHdCQUE0QjtBQTNCNUIseURBQTJEO0FBSTNEOzs7R0FHRztBQUNVLFFBQUEsT0FBTyxHQUE0QztJQUM1RDs7O09BR0c7SUFDSCxPQUFPO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0osQ0FBQztBQUVGLFNBQWdCLElBQUk7SUFDaEIsSUFBQSxrQ0FBa0IsR0FBRSxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsTUFBTSxLQUFLLENBQUM7QUFHNUIsaUJBQWlCO0FBQ2pCOzs7R0FHRztBQUNILHNDQUFzQztBQUN0QyxZQUFZO0FBQ1osMEZBQTBGO0FBQzFGLHFGQUFxRjtBQUNyRixnREFBZ0Q7QUFDaEQsd0JBQXdCO0FBQ3hCLGdFQUFnRTtBQUNoRSw0QkFBNEI7QUFDNUIsUUFBUTtBQUNSLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzeW5jU2NlbmFyaW9Gb2xkZXIgfSBmcm9tIFwiLi90b29scy9zZXR1cC1wcm9qZWN0XCI7XHJcblxyXG5cclxuXHJcbi8qKlxyXG4gKiBAZW4gUmVnaXN0cmF0aW9uIG1ldGhvZCBmb3IgdGhlIG1haW4gcHJvY2VzcyBvZiBFeHRlbnNpb25cclxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG1ldGhvZHM6IHsgW2tleTogc3RyaW5nXTogKC4uLmFueTogYW55KSA9PiBhbnkgfSA9IHtcclxuICAgIC8qKlxyXG4gICAgICogQGVuIEEgbWV0aG9kIHRoYXQgY2FuIGJlIHRyaWdnZXJlZCBieSBtZXNzYWdlXHJcbiAgICAgKiBAemgg6YCa6L+HIG1lc3NhZ2Ug6Kem5Y+R55qE5pa55rOVXHJcbiAgICAgKi9cclxuICAgIHNob3dMb2coKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0hlbGxvIFdvcmxkJyk7XHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoKSB7XHJcbiAgICBzeW5jU2NlbmFyaW9Gb2xkZXIoKTtcclxuICAgIGNvbnNvbGUubG9nKCdMb2FkIGNvY29leXdhICEhIScpXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZW4gTWV0aG9kIHRyaWdnZXJlZCB3aGVuIHVuaW5zdGFsbGluZyB0aGUgZXh0ZW5zaW9uXHJcbiAqIEB6aCDljbjovb3mianlsZXml7bop6blj5HnmoTmlrnms5VcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bmxvYWQoKSB7IH1cclxuXHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLVxyXG4vKipcclxuICogQGVuIEdldCBwcm9qZWN0IG5hbWUgZnJvbSBwYWNrYWdlLmpzb25cclxuICogQHpoIOS7jiBwYWNrYWdlLmpzb24g6I635Y+W6aG555uu5ZCN56ewXHJcbiAqL1xyXG4vLyBmdW5jdGlvbiBnZXRQcm9qZWN0TmFtZSgpOiBzdHJpbmcge1xyXG4vLyAgICAgdHJ5IHtcclxuLy8gICAgICAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnLi4nLCAncGFja2FnZS5qc29uJyk7XHJcbi8vICAgICAgICAgY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYWNrYWdlSnNvblBhdGgsICd1dGYtOCcpKTtcclxuLy8gICAgICAgICByZXR1cm4gcGFja2FnZUpzb24ubmFtZSB8fCAncHJvamVjdCc7XHJcbi8vICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4vLyAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZWFkIHBhY2thZ2UuanNvbjonLCBlcnJvcik7XHJcbi8vICAgICAgICAgcmV0dXJuICdwcm9qZWN0JztcclxuLy8gICAgIH1cclxuLy8gfSJdfQ==