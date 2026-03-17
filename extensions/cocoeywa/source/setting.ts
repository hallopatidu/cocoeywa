import path from "path";
import fs from "fs";

export const ProjectName: string = (function () {
    if (!Editor.Project.path) {
        return '';
    }
    const packageJsonPath = path.join(Editor.Project.path, 'package.json');
    const data = fs.readFileSync(packageJsonPath, 'utf-8');
    const projectConfig = JSON.parse(data);
    return projectConfig.name;
})()

