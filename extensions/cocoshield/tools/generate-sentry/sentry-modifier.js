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
        const ENABLE_SENTRY_TELEMETRY = process.env.ENABLE_SENTRY_TELEMETRY == 'true' ? true : false;
        const DSN = process.env.DSN;
        const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;
        const SENTRY_RELEASE = process.env.SENTRY_RELEASE;
        const SENTRY_SAMPLE_RATE = process.env.SENTRY_SAMPLE_RATE;
        const SENTRY_TRACE_SAMPLE_RATE = process.env.SENTRY_TRACE_SAMPLE_RATE;
        const project = new Project();
        // Thêm file vào project
        const sourceFile = project.addSourceFileAtPath(PATCH_SCRIPT);
        
        // Tìm khai báo biến có tên DSN
        changeVariable(sourceFile, "ENABLE", ENABLE);
        changeVariable(sourceFile, "DSN", DSN);
        changeVariable(sourceFile, "SENTRY_ENVIRONMENT", SENTRY_ENVIRONMENT);
        changeVariable(sourceFile, "SENTRY_RELEASE", SENTRY_RELEASE);
        changeVariable(sourceFile, "SENTRY_SAMPLE_RATE", parseFloat(SENTRY_SAMPLE_RATE));
        changeVariable(sourceFile, "SENTRY_TRACE_SAMPLE_RATE", parseFloat(SENTRY_TRACE_SAMPLE_RATE));
        changeVariable(sourceFile, "ENABLE_SENTRY_TELEMETRY", ENABLE_SENTRY_TELEMETRY);

        // Lưu lại file
        sourceFile.saveSync();
        console.error("✓ Modified sentry code successfully");
        process.exit(0);

  } catch (error) {
      console.error("❌ Modified sentry code failed !", error );
      process.exit(1);
  }
})();