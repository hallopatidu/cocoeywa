"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.load = load;
exports.unload = unload;
const fs = require('fs');
const path = require('path');
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
    // console.log('Extension loaded');    // const projectName = getProjectName();
    // const gameFolder = `assets/${projectName}`;
    // if (!fs.existsSync(gameFolder)) {
    //     fs.mkdirSync(gameFolder, { recursive: true });
    //     console.log(`Created folder: ${gameFolder}`);
    // } else {
    //     console.log(`Folder already exists: ${gameFolder}`);
    // }
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
function getProjectName() {
    try {
        const packageJsonPath = path.join(__dirname, '..', '..', '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.name || 'project';
    }
    catch (error) {
        console.error('Failed to read package.json:', error);
        return 'project';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWlCQSxvQkFTQztBQU1ELHdCQUE0QjtBQWhDNUIsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3Qjs7O0dBR0c7QUFDVSxRQUFBLE9BQU8sR0FBNEM7SUFDNUQ7OztPQUdHO0lBQ0gsT0FBTztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDL0IsQ0FBQztDQUNKLENBQUM7QUFFRixTQUFnQixJQUFJO0lBQ2hCLCtFQUErRTtJQUMvRSw4Q0FBOEM7SUFDOUMsb0NBQW9DO0lBQ3BDLHFEQUFxRDtJQUNyRCxvREFBb0Q7SUFDcEQsV0FBVztJQUNYLDJEQUEyRDtJQUMzRCxJQUFJO0FBQ1IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLE1BQU0sS0FBSyxDQUFDO0FBRzVCLGlCQUFpQjtBQUNqQjs7O0dBR0c7QUFDSCxTQUFTLGNBQWM7SUFDbkIsSUFBSSxDQUFDO1FBQ0QsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDL0UsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sV0FBVyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUM7SUFDekMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xyXG5cclxuLyoqXHJcbiAqIEBlbiBSZWdpc3RyYXRpb24gbWV0aG9kIGZvciB0aGUgbWFpbiBwcm9jZXNzIG9mIEV4dGVuc2lvblxyXG4gKiBAemgg5Li65omp5bGV55qE5Li76L+b56iL55qE5rOo5YaM5pa55rOVXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWV0aG9kczogeyBba2V5OiBzdHJpbmddOiAoLi4uYW55OiBhbnkpID0+IGFueSB9ID0ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gQSBtZXRob2QgdGhhdCBjYW4gYmUgdHJpZ2dlcmVkIGJ5IG1lc3NhZ2VcclxuICAgICAqIEB6aCDpgJrov4cgbWVzc2FnZSDop6blj5HnmoTmlrnms5VcclxuICAgICAqL1xyXG4gICAgc2hvd0xvZygpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnSGVsbG8gV29ybGQnKTtcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbG9hZCgpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKCdFeHRlbnNpb24gbG9hZGVkJyk7ICAgIC8vIGNvbnN0IHByb2plY3ROYW1lID0gZ2V0UHJvamVjdE5hbWUoKTtcclxuICAgIC8vIGNvbnN0IGdhbWVGb2xkZXIgPSBgYXNzZXRzLyR7cHJvamVjdE5hbWV9YDtcclxuICAgIC8vIGlmICghZnMuZXhpc3RzU3luYyhnYW1lRm9sZGVyKSkge1xyXG4gICAgLy8gICAgIGZzLm1rZGlyU3luYyhnYW1lRm9sZGVyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhgQ3JlYXRlZCBmb2xkZXI6ICR7Z2FtZUZvbGRlcn1gKTtcclxuICAgIC8vIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coYEZvbGRlciBhbHJlYWR5IGV4aXN0czogJHtnYW1lRm9sZGVyfWApO1xyXG4gICAgLy8gfVxyXG59XHJcblxyXG4vKipcclxuICogQGVuIE1ldGhvZCB0cmlnZ2VyZWQgd2hlbiB1bmluc3RhbGxpbmcgdGhlIGV4dGVuc2lvblxyXG4gKiBAemgg5Y246L295omp5bGV5pe26Kem5Y+R55qE5pa55rOVXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5sb2FkKCkgeyB9XHJcblxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS1cclxuLyoqXHJcbiAqIEBlbiBHZXQgcHJvamVjdCBuYW1lIGZyb20gcGFja2FnZS5qc29uXHJcbiAqIEB6aCDku44gcGFja2FnZS5qc29uIOiOt+WPlumhueebruWQjeensFxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0UHJvamVjdE5hbWUoKTogc3RyaW5nIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJy4uJywgJ3BhY2thZ2UuanNvbicpO1xyXG4gICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGFja2FnZUpzb25QYXRoLCAndXRmLTgnKSk7XHJcbiAgICAgICAgcmV0dXJuIHBhY2thZ2VKc29uLm5hbWUgfHwgJ3Byb2plY3QnO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVhZCBwYWNrYWdlLmpzb246JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiAncHJvamVjdCc7XHJcbiAgICB9XHJcbn0iXX0=