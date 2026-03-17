const { Project } = require("ts-morph");
// Khởi tạo project
(function () {
  try {

      function changeVariable(sourceFile, variableName, newValue) {
          const variableDeclaration = sourceFile.getVariableDeclaration(variableName);
          if (variableDeclaration) {
            const initializer = variableDeclaration.getInitializer();
            if (initializer) {
                if(typeof newValue === 'string'){
                    initializer.replaceWithText(`"${newValue}"`);
                }else if(typeof newValue === 'number'){
                    initializer.replaceWithText(`${newValue}`);
                }else if(typeof newValue === 'boolean'){
                    initializer.replaceWithText(`${newValue.toString()}`);
                }else if(typeof newValue == 'array'){
                    initializer.replaceWithText(`${newValue}`)
                }else if(typeof newValue == 'object'){
                    initializer.replaceWithText(`${JSON.stringify(newValue)}`)
                }else{
                    initializer.replaceWithText(`${newValue}`)
                }
                // switch(typeof newValue){
                //     case 'string':
                //         initializer.replaceWithText(`"${newValue}"`);
                //         break;
                //     default:
                //         initializer.replaceWithText(`${JSON.stringify(newValue)}`);
                //         break;
                // }
                
            }
          }
      }
      // 
      const PATCH_SCRIPT = process.env.PATCH_SCRIPT || 'runtime/decryptor/index.ts';
      const BUILD_VERSION = process.env.BUILD_VERSION || '1.0.0';
      const ENABLE = process.env.ENABLE == 'true' ? true:false;
      const PASSWORD = process.env.PASSWORD || "coco.magic";
      const SEED = parseInt(process.env.SEED || "6969");
      const SIGBYTES = JSON.parse(process.env.SIGBYTES);
      const RATIO = parseFloat(process.env.RATIO || "0.1");
      const PERMS = process.env.PERMS ? JSON.parse(process.env.PERMS) : null;
      // 
      const project = new Project();
      // Thêm file vào project
      const sourceFile = project.addSourceFileAtPath(PATCH_SCRIPT);
      
      // Tìm khai báo biến có tên PASSWORD
      changeVariable(sourceFile, "ENABLE", ENABLE);
      changeVariable(sourceFile, "BUILD_VERSION", BUILD_VERSION);
      changeVariable(sourceFile, "PASSWORD", PASSWORD);
      changeVariable(sourceFile, "SIGBYTES", SIGBYTES);
      changeVariable(sourceFile, "SEED", SEED);
      changeVariable(sourceFile, "PERMS", PERMS);
      changeVariable(sourceFile, "RATIO", RATIO);
      // Lưu lại file
      sourceFile.saveSync();
      console.error("✓ Modified Decryption codes successfully");
      process.exit(0);
      // 
  } catch (error) {      
      console.error(`❌ Modified Decryption codes failed - File path: ${filePath}:`, ` -Build version: ${process.env.BUILD_VERSION}`, error);
      process.exit(1);
  }
})();