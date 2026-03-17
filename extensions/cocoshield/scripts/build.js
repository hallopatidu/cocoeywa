// build.js (CommonJS version)
const { execSync, spawnSync } = require("child_process");
const { minify } = require("terser");
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require("fs");
const path = require("path");
const { MODE, PLATFORM } = process.env;
const DIST_DIR = "dist";

const ENV_MODE = {
  DEBUG: 'debugging',
  DEBUG_HIDE: 'debugging_hide',
  PROD: 'production',
  DEV: 'development',
  DEV_HIDE: 'development_hide'
}

const EnableReopenEditor = MODE !== ENV_MODE.PROD;
const EnableObfuscateCode = MODE == ENV_MODE.PROD || MODE == ENV_MODE.DEV
const BuildAppInBackground = MODE == ENV_MODE.DEBUG_HIDE || MODE == ENV_MODE.DEV_HIDE
const BUILD_PLATFORM = PLATFORM || 'web-mobile';

const ObfuscationOptions = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: true,
  identifierNamesGenerator: "hexadecimal",
  log: false,
  numbersToExpressions: false,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: false,
  stringArray: true,
  stringArrayCallsTransform: false,
  stringArrayEncoding: [],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 1,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 2,
  stringArrayWrappersType: "variable",
  stringArrayThreshold: 0.75,
  unicodeEscapeSequence: false
};// low
// const ObfuscationOptions = {
//     compact: true,
//     controlFlowFlattening: true,
//     controlFlowFlatteningThreshold: 1,
//     deadCodeInjection: true,
//     deadCodeInjectionThreshold: 1,
//     debugProtection: false,                 // true
//     debugProtectionInterval: 4000,
//     disableConsoleOutput: true,
//     identifierNamesGenerator: "hexadecimal",
//     log: false,
//     numbersToExpressions: true,
//     renameGlobals: false,
//     selfDefending: true,
//     simplify: true,
//     splitStrings: true,
//     splitStringsChunkLength: 5,
//     stringArray: true,
//     stringArrayCallsTransform: true,
//     stringArrayEncoding: ["rc4"],
//     stringArrayIndexShift: true,
//     stringArrayRotate: true,
//     stringArrayShuffle: true,
//     stringArrayWrappersCount: 5,
//     stringArrayWrappersChainedCalls: true,
//     stringArrayWrappersParametersMaxCount: 5,
//     stringArrayWrappersType: "function",
//     stringArrayThreshold: 1,
//     transformObjectKeys: true,
//     unicodeEscapeSequence: false
// };
// 
// Đường dẫn đến file package.json trong dự án Cocos Creator
const packageJsonPath = path.join(__dirname, '../package.json');//package.json//C:\Projects\cc-build-project\extensions\cocoshield\package.json
console.log("packageJsonPath: " + packageJsonPath);
const data = fs.readFileSync(packageJsonPath, { encoding: 'utf-8' });

let PROJECT_DIR = path.join(__dirname, '../../../')
let PUBLISH_DIR = path.join(PROJECT_DIR, 'build', BUILD_PLATFORM);
let COCOS_CREATOR_PATH;

// if(EnableReopenEditor){
try {
  const packageData = JSON.parse(data);

  // Thông tin phiên bản editor thường nằm trong trường 'editorVersion'
  const editorVersion = packageData.editor;

  if (editorVersion) {
    const match = editorVersion.match(/(\d+\.\d+\.\d+)/);
    console.log('Editor Version:', match[1]);
    COCOS_CREATOR_PATH = `C:\\ProgramData\\cocos\\editors\\Creator\\${match[1]}\\CocosCreator.exe`;

  } else {
    console.log('Không tìm thấy thông tin editor version trong package.json');
  }
} catch (parseError) {
  console.error('Lỗi phân tích cú pháp JSON:', parseError);
}
// }

// 🧹 Xoá thư mục dist cũ
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  console.log("🧹 Đã xoá thư mục dist cũ");
}

// 🧱 Biên dịch TypeScript sang JavaScript
console.log("🛠  Đang biên dịch TypeScript...");

if (EnableReopenEditor && !BuildAppInBackground) {
  try {
    execSync("taskkill /F /IM CocosCreator.exe >nul 2>&1");
  } catch (err) {
    // console.log('Erro :: ', err);
  }
}
// 
execSync("npx tsc", { stdio: "inherit" });



// 🧠 Lấy danh sách file .js và minify từng file
(async () => {
  if (EnableObfuscateCode) {
    // 🧩 Hàm duyệt tất cả file trong thư mục
    function getAllJsFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);

      list.forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(getAllJsFiles(fullPath));
        } else if (file.endsWith(".js")) {
          results.push(fullPath);
        }
      });

      return results;
    }
    // 
    console.log("⚡ Đang minify các file JS...");
    // 
    const jsFiles = getAllJsFiles(DIST_DIR);

    for (const file of jsFiles) {
      const code = fs.readFileSync(file, "utf8");

      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, ObfuscationOptions).getObfuscatedCode();

      const result = await minify(obfuscatedCode, {
        compress: true,
        mangle: true,
        sourceMap: false // bật true nếu bạn muốn tạo sourcemap
      });

      if (result.code) {
        fs.writeFileSync(file, result.code, "utf8");
        console.log(`✅ Minified: ${file}`);
      }
    }

    console.log("\n🎉 Build hoàn tất! TypeScript đã được compile và minify xong.");
  } else {
    console.log("\n🎉 Build hoàn tất! TypeScript đã được compile.");
  }

  if (EnableReopenEditor && !BuildAppInBackground) {
    execSync(`@echo off & start "" ${COCOS_CREATOR_PATH} --nologin --project ${PROJECT_DIR} & exit`)
  } else if (BuildAppInBackground) {
    console.log("\n🧩 Đang âm thầm build game, chờ tí đuê ! ...");
    execSync(`@echo off & start "" ${COCOS_CREATOR_PATH} --nologin --project ${PROJECT_DIR} --build='platform=${BUILD_PLATFORM}' & exit`)
    console.log("\n🎉 Build hoàn tất!.");
  }



})();
