"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneScenarioFolderAction = cloneScenarioFolderAction;
const path_1 = require("path");
const fs_1 = require("fs");
function cloneScenarioFolderAction() {
    const sourceDir = (0, path_1.join)(Editor.Project.path, './assets/scenario');
    const destDir = (0, path_1.join)(__dirname, '../../../assets/scenario');
    if ((0, fs_1.existsSync)(sourceDir)) {
        (0, fs_1.cpSync)(sourceDir, destDir, { recursive: true, force: true });
        console.log('Scenario directory copied successfully');
    }
    else {
        console.log('Scenario directory does not exist');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC1hY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvdG9vbHMvcHJvamVjdC1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSw4REFTQztBQVpELCtCQUE0QjtBQUM1QiwyQkFBd0M7QUFFeEMsU0FBZ0IseUJBQXlCO0lBQ3JDLE1BQU0sU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDakUsTUFBTSxPQUFPLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLENBQUM7SUFDNUQsSUFBSSxJQUFBLGVBQVUsRUFBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQ3hCLElBQUEsV0FBTSxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUMxRCxDQUFDO1NBQU0sQ0FBQztRQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUNyRCxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZXhpc3RzU3luYywgY3BTeW5jIH0gZnJvbSAnZnMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lU2NlbmFyaW9Gb2xkZXJBY3Rpb24oKXtcclxuICAgIGNvbnN0IHNvdXJjZURpciA9IGpvaW4oRWRpdG9yLlByb2plY3QucGF0aCwgJy4vYXNzZXRzL3NjZW5hcmlvJyk7XHJcbiAgICBjb25zdCBkZXN0RGlyID0gam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi9hc3NldHMvc2NlbmFyaW8nKTtcclxuICAgIGlmIChleGlzdHNTeW5jKHNvdXJjZURpcikpIHtcclxuICAgICAgICBjcFN5bmMoc291cmNlRGlyLCBkZXN0RGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSwgZm9yY2U6IHRydWUgfSk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NjZW5hcmlvIGRpcmVjdG9yeSBjb3BpZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTY2VuYXJpbyBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QnKTtcclxuICAgIH1cclxufVxyXG4iXX0=