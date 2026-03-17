"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectName = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.ProjectName = (function () {
    if (!Editor.Project.path) {
        return '';
    }
    const packageJsonPath = path_1.default.join(Editor.Project.path, 'package.json');
    const data = fs_1.default.readFileSync(packageJsonPath, 'utf-8');
    const projectConfig = JSON.parse(data);
    return projectConfig.name;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9zZXR0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQUF3QjtBQUN4Qiw0Q0FBb0I7QUFFUCxRQUFBLFdBQVcsR0FBVyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUNELE1BQU0sZUFBZSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDdkUsTUFBTSxJQUFJLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUM7QUFDOUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBQcm9qZWN0TmFtZTogc3RyaW5nID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghRWRpdG9yLlByb2plY3QucGF0aCkge1xyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHBhdGguam9pbihFZGl0b3IuUHJvamVjdC5wYXRoLCAncGFja2FnZS5qc29uJyk7XHJcbiAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHBhY2thZ2VKc29uUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICBjb25zdCBwcm9qZWN0Q29uZmlnID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgIHJldHVybiBwcm9qZWN0Q29uZmlnLm5hbWU7XHJcbn0pKClcclxuXHJcbiJdfQ==