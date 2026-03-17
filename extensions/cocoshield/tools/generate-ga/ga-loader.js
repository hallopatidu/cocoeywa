const { Project } = require("ts-morph");

// Khởi tạo project
(function () {
  try {
        // 
        function changeVariable(sourceFile, variableName, newValue) {
            const variableDeclaration = sourceFile.getVariableDeclaration(variableName);
            if (variableDeclaration) {
                const initializer = variableDeclaration.getInitializer();
                if (initializer) {
                    switch(typeof newValue){
                        case 'string':
                            initializer.replaceWithText(`"${newValue}"`);
                            break;
                        default:
                            initializer.replaceWithText(`${newValue}`);
                            break;
                    }
                }
            }
        }
        // 
        const PATCH_SCRIPT = process.env.PATCH_SCRIPT;
        const ENABLE = process.env.ENABLE == 'true' ? true : false;
        const GA_ENVIRONMENT = process.env.GA_ENVIRONMENT;
        const GA_KEY = process.env.GA_KEY;
        const project = new Project();
        // Thêm file vào project
        const sourceFile = project.addSourceFileAtPath(PATCH_SCRIPT)
        
        // Tìm khai báo biến có tên DSN
        changeVariable(sourceFile, "ENABLE", ENABLE);
        changeVariable(sourceFile, "GA_KEY", GA_KEY);
        changeVariable(sourceFile, "GA_ENVIRONMENT", GA_ENVIRONMENT);

        // Lưu lại file
        sourceFile.saveSync();
        console.error("✓ Modified GA codes successfully");
        process.exit(0);
  } catch (error) {
      console.error(`❌ Modified GA codes failed : `, error);
      process.exit(1);
  }
})();