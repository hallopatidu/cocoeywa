import { join } from 'path';
import { existsSync, cpSync, mkdirSync } from 'fs';

/**
 * Hàm kiểm tra và copy Scenario Editor template từ Extension vào Project.
 */
export function syncScenarioFolder() {
    const sourceDir = join(Editor.Project.path, 'assets/scenario');
    const destDir = join(Editor.Project.path, 'extensions/cocoeywa/assets/scenario');

    try {
        // 1. Kiểm tra nếu thư mục đích trong Project (sourceDir) chưa tồn tại
        if (!existsSync(sourceDir)) {
            console.log(`[Extension] Thư mục ${sourceDir} không tồn tại. Đang tiến hành tạo và copy...`);

            // 2. Đảm bảo thư mục cha tồn tại và tạo sourceDir
            // recursive: true giúp tạo luôn cả các thư mục trung gian nếu cần
            mkdirSync(sourceDir, { recursive: true });

            // 3. Kiểm tra xem thư mục gốc trong Extension (destDir) có tồn tại để copy không
            if (existsSync(destDir)) {
                // cpSync với recursive: true sẽ copy toàn bộ file và folder con
                cpSync(destDir, sourceDir, { recursive: true, force: true });

                console.log('[Extension] Copy thành công!');

                // 4. Quan trọng: Thông báo cho Cocos Creator AssetDB để hiển thị file mới trên Editor
                Editor.Message.send('asset-db', 'refresh-asset', 'db://assets/scenario');
            } else {
                console.warn(`[Extension] Không tìm thấy thư mục gốc để copy tại: ${destDir}`);
            }
        } else {
            console.log('[Extension] Thư mục scenario đã tồn tại, bỏ qua bước copy.');
        }
    } catch (error) {
        console.error('[Extension] Lỗi trong quá trình xử lý file:', error);
    }
}
