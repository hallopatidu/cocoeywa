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
        const TELEMETRY_ENVIRONMENT = process.env.TELEMETRY_ENVIRONMENT;
        const project = new Project();
        // Thêm file vào project
        const sourceFile = project.addSourceFileAtPath(PATCH_SCRIPT);
        // 
        changeVariable(sourceFile, "TELEMETRY_ENVIRONMENT", TELEMETRY_ENVIRONMENT);

        // Lưu lại file
        sourceFile.saveSync();
        console.error("✓ Modified Telemetry code successfully");
        process.exit(0);
  } catch (error) {
      console.error("❌ Modified Telemetry code failed !", error );
      process.exit(1);
  }
})();