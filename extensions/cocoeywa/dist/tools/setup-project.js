"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncScenarioFolder = syncScenarioFolder;
const path_1 = require("path");
const fs_1 = require("fs");
/**
 * Hàm kiểm tra và copy Scenario Editor template từ Extension vào Project.
 */
function syncScenarioFolder() {
    const sourceDir = (0, path_1.join)(Editor.Project.path, 'assets/scenario');
    const destDir = (0, path_1.join)(Editor.Project.path, 'extensions/cocoeywa/assets/scenario');
    try {
        // 1. Kiểm tra nếu thư mục đích trong Project (sourceDir) chưa tồn tại
        if (!(0, fs_1.existsSync)(sourceDir)) {
            console.log(`[Extension] Thư mục ${sourceDir} không tồn tại. Đang tiến hành tạo và copy...`);
            // 2. Đảm bảo thư mục cha tồn tại và tạo sourceDir
            // recursive: true giúp tạo luôn cả các thư mục trung gian nếu cần
            (0, fs_1.mkdirSync)(sourceDir, { recursive: true });
            // 3. Kiểm tra xem thư mục gốc trong Extension (destDir) có tồn tại để copy không
            if ((0, fs_1.existsSync)(destDir)) {
                // cpSync với recursive: true sẽ copy toàn bộ file và folder con
                (0, fs_1.cpSync)(destDir, sourceDir, { recursive: true, force: true });
                console.log('[Extension] Copy thành công!');
                // 4. Quan trọng: Thông báo cho Cocos Creator AssetDB để hiển thị file mới trên Editor
                Editor.Message.send('asset-db', 'refresh-asset', 'db://assets/scenario');
            }
            else {
                console.warn(`[Extension] Không tìm thấy thư mục gốc để copy tại: ${destDir}`);
            }
        }
        else {
            console.log('[Extension] Thư mục scenario đã tồn tại, bỏ qua bước copy.');
        }
    }
    catch (error) {
        console.error('[Extension] Lỗi trong quá trình xử lý file:', error);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtcHJvamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS90b29scy9zZXR1cC1wcm9qZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBTUEsZ0RBK0JDO0FBckNELCtCQUE0QjtBQUM1QiwyQkFBbUQ7QUFFbkQ7O0dBRUc7QUFDSCxTQUFnQixrQkFBa0I7SUFDOUIsTUFBTSxTQUFTLEdBQUcsSUFBQSxXQUFJLEVBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMvRCxNQUFNLE9BQU8sR0FBRyxJQUFBLFdBQUksRUFBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO0lBRWpGLElBQUksQ0FBQztRQUNELHNFQUFzRTtRQUN0RSxJQUFJLENBQUMsSUFBQSxlQUFVLEVBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixTQUFTLCtDQUErQyxDQUFDLENBQUM7WUFFN0Ysa0RBQWtEO1lBQ2xELGtFQUFrRTtZQUNsRSxJQUFBLGNBQVMsRUFBQyxTQUFTLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUUxQyxpRkFBaUY7WUFDakYsSUFBSSxJQUFBLGVBQVUsRUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN0QixnRUFBZ0U7Z0JBQ2hFLElBQUEsV0FBTSxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUU3RCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBRTVDLHNGQUFzRjtnQkFDdEYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQzdFLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25GLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsNERBQTRELENBQUMsQ0FBQztRQUM5RSxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hFLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCBjcFN5bmMsIG1rZGlyU3luYyB9IGZyb20gJ2ZzJztcclxuXHJcbi8qKlxyXG4gKiBIw6BtIGtp4buDbSB0cmEgdsOgIGNvcHkgU2NlbmFyaW8gRWRpdG9yIHRlbXBsYXRlIHThu6sgRXh0ZW5zaW9uIHbDoG8gUHJvamVjdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzeW5jU2NlbmFyaW9Gb2xkZXIoKSB7XHJcbiAgICBjb25zdCBzb3VyY2VEaXIgPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdhc3NldHMvc2NlbmFyaW8nKTtcclxuICAgIGNvbnN0IGRlc3REaXIgPSBqb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdleHRlbnNpb25zL2NvY29leXdhL2Fzc2V0cy9zY2VuYXJpbycpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gMS4gS2nhu4NtIHRyYSBu4bq/dSB0aMawIG3hu6VjIMSRw61jaCB0cm9uZyBQcm9qZWN0IChzb3VyY2VEaXIpIGNoxrBhIHThu5NuIHThuqFpXHJcbiAgICAgICAgaWYgKCFleGlzdHNTeW5jKHNvdXJjZURpcikpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtFeHRlbnNpb25dIFRoxrAgbeG7pWMgJHtzb3VyY2VEaXJ9IGtow7RuZyB04buTbiB04bqhaS4gxJBhbmcgdGnhur9uIGjDoG5oIHThuqFvIHbDoCBjb3B5Li4uYCk7XHJcblxyXG4gICAgICAgICAgICAvLyAyLiDEkOG6o20gYuG6o28gdGjGsCBt4bulYyBjaGEgdOG7k24gdOG6oWkgdsOgIHThuqFvIHNvdXJjZURpclxyXG4gICAgICAgICAgICAvLyByZWN1cnNpdmU6IHRydWUgZ2nDunAgdOG6oW8gbHXDtG4gY+G6oyBjw6FjIHRoxrAgbeG7pWMgdHJ1bmcgZ2lhbiBu4bq/dSBj4bqnblxyXG4gICAgICAgICAgICBta2RpclN5bmMoc291cmNlRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIDMuIEtp4buDbSB0cmEgeGVtIHRoxrAgbeG7pWMgZ+G7kWMgdHJvbmcgRXh0ZW5zaW9uIChkZXN0RGlyKSBjw7MgdOG7k24gdOG6oWkgxJHhu4MgY29weSBraMO0bmdcclxuICAgICAgICAgICAgaWYgKGV4aXN0c1N5bmMoZGVzdERpcikpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNwU3luYyB24bubaSByZWN1cnNpdmU6IHRydWUgc+G6vSBjb3B5IHRvw6BuIGLhu5kgZmlsZSB2w6AgZm9sZGVyIGNvblxyXG4gICAgICAgICAgICAgICAgY3BTeW5jKGRlc3REaXIsIHNvdXJjZURpciwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXh0ZW5zaW9uXSBDb3B5IHRow6BuaCBjw7RuZyEnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyA0LiBRdWFuIHRy4buNbmc6IFRow7RuZyBiw6FvIGNobyBDb2NvcyBDcmVhdG9yIEFzc2V0REIgxJHhu4MgaGnhu4NuIHRo4buLIGZpbGUgbeG7m2kgdHLDqm4gRWRpdG9yXHJcbiAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5zZW5kKCdhc3NldC1kYicsICdyZWZyZXNoLWFzc2V0JywgJ2RiOi8vYXNzZXRzL3NjZW5hcmlvJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtFeHRlbnNpb25dIEtow7RuZyB0w6xtIHRo4bqleSB0aMawIG3hu6VjIGfhu5FjIMSR4buDIGNvcHkgdOG6oWk6ICR7ZGVzdERpcn1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXh0ZW5zaW9uXSBUaMawIG3hu6VjIHNjZW5hcmlvIMSRw6MgdOG7k24gdOG6oWksIGLhu48gcXVhIGLGsOG7m2MgY29weS4nKTtcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tFeHRlbnNpb25dIEzhu5dpIHRyb25nIHF1w6EgdHLDrG5oIHjhu60gbMO9IGZpbGU6JywgZXJyb3IpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==