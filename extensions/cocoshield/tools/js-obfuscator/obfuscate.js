const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { SourceMapConsumer, SourceMapGenerator } = require('source-map');

/**
 * Extract source map URL from JS file content
 * @param {string} content - JS file content
 * @returns {string|null} - Source map file path or null if not found
 */
function extractSourceMapUrl(content) {
    const sourceMapRegex = /\/\/# sourceMappingURL=(.+)$/m;
    const match = content.match(sourceMapRegex);
    return match ? match[1].trim() : null;
}

/**
 * Compose two source maps using the compose logic from compose-map.js
 * @param {string} obfMapContent - Obfuscated source map content
 * @param {string} originalMapContent - Original source map content
 * @param {string} fileName - Output file name
 * @returns {string} - Composed source map content
 */
async function composeSourceMaps(obfMapContent, originalMapContent, fileName) {
    try {
        const obf = JSON.parse(obfMapContent);
        const original = JSON.parse(originalMapContent);

        const obfConsumer = await new SourceMapConsumer(obf);
        const originalConsumer = await new SourceMapConsumer(original);
        const generator = new SourceMapGenerator({
            file: fileName
        });

        const sourceContentMap = new Map();

        obfConsumer.eachMapping(function(mapping) {
            if (mapping.source == null) {
                return;
            }

            const orig = originalConsumer.originalPositionFor({
                line: mapping.originalLine,
                column: mapping.originalColumn
            });

            if (orig && orig.source) {
                generator.addMapping({
                    generated: {
                        line: mapping.generatedLine,
                        column: mapping.generatedColumn
                    },
                    original: {
                        line: orig.line,
                        column: orig.column
                    },
                    source: orig.source,
                    name: orig.name || mapping.name || undefined
                });
                
                if (!sourceContentMap.has(orig.source)) {
                    sourceContentMap.set(orig.source, mapping.source);
                }
            } else {
                const sourceToUse = mapping.source || original.file || fileName;
                generator.addMapping({
                    generated: {
                        line: mapping.generatedLine,
                        column: mapping.generatedColumn
                    },
                    original: {
                        line: mapping.originalLine,
                        column: mapping.originalColumn
                    },
                    source: sourceToUse,
                    name: mapping.name || undefined
                });
                
                if (!sourceContentMap.has(sourceToUse)) {
                    sourceContentMap.set(sourceToUse, mapping.source);
                }
            }
        });

        if (Array.isArray(original.sourcesContent) || Array.isArray(obf.sourcesContent)) {
            const allSourceContent = new Map();
            
            if (Array.isArray(original.sourcesContent)) {
                original.sources.forEach((source, idx) => {
                    const content = original.sourcesContent[idx];
                    if (content) {
                        allSourceContent.set(source, content);
                    }
                });
            }
            
            if (Array.isArray(obf.sourcesContent)) {
                obf.sources.forEach((source, idx) => {
                    const content = obf.sourcesContent[idx];
                    if (content) {
                        allSourceContent.set(source, content);
                    }
                });
            }

            const finalMap = JSON.parse(generator.toString());
            finalMap.sources.forEach(finalSource => {
                let content = allSourceContent.get(finalSource);
                
                if (!content) {
                    for (const [trackedSource, mappedSource] of sourceContentMap.entries()) {
                        if (trackedSource === finalSource) {
                            content = allSourceContent.get(mappedSource);
                            if (content) break;
                        }
                    }
                }
                
                if (content) {
                    generator.setSourceContent(finalSource, content);
                }
            });
        }

        const resultMap = generator.toString();
        obfConsumer.destroy();
        originalConsumer.destroy();
        
        return resultMap;
    } catch (error) {
        console.error('Error composing source maps:', error);
        return null;
    }
}

(async function () {
    const jsDir = path.join(`${[process.env.PATH_OBFUSCATE]}/main`);
    const outputSourceMapDir = process.env.OUTPUT_SOURCEMAP_PATH;
    
    if (!fs.existsSync(jsDir)) {
        console.error(`Directory not found: ${jsDir}`);
        return;
    }
    
    // Ensure output source map directory exists
    if (outputSourceMapDir && !fs.existsSync(outputSourceMapDir)) {
        try {
            fs.mkdirSync(outputSourceMapDir, { recursive: true });
            console.log(`Created output source map directory: ${outputSourceMapDir}`);
        } catch (error) {
            console.error(`Failed to create output source map directory: ${outputSourceMapDir}`, error);
        }
    }

    const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    const configObfuscate = fs.readFileSync(path.join(process.env.CONFIG_OBFUSCATE), 'utf8');
    const obfuscateConfig = JSON.parse(configObfuscate);
    
    obfuscateConfig.sourceMap = true;
    obfuscateConfig.sourceMapMode = 'separate';
    
    for (const file of jsFiles) {
        const filePath = path.join(jsDir, file);
        try {
            console.log(`Processing ${file}...`);
            const code = fs.readFileSync(filePath, 'utf8');
            
            const originalSourceMapUrl = extractSourceMapUrl(code);
            let originalSourceMapContent = null;
            let originalSourceMapPath = null;
            
            if (originalSourceMapUrl) {
                originalSourceMapPath = path.resolve(path.dirname(filePath), originalSourceMapUrl);
                if (fs.existsSync(originalSourceMapPath)) {
                    originalSourceMapContent = fs.readFileSync(originalSourceMapPath, 'utf8');
                    console.log(`Found original source map: ${originalSourceMapPath}`);
                } else {
                    console.warn(`Original source map not found: ${originalSourceMapPath}`);
                }
            } else {
                console.log(`No source map URL found in ${file}`);
            }

            const codeWithoutSourceMap = code.replace(/\/\/# sourceMappingURL=.+$/m, '');
            
            const obfuscationResult = JavaScriptObfuscator.obfuscate(codeWithoutSourceMap, obfuscateConfig);
            const obfuscatedCode = obfuscationResult.getObfuscatedCode();
            const obfuscatedSourceMap = obfuscationResult.getSourceMap();

            let finalSourceMap = obfuscatedSourceMap;
            const sourceMapFileName = `${file}.map`;
            
            const sourceMapPath = outputSourceMapDir 
                ? path.join(outputSourceMapDir, sourceMapFileName)
                : path.join(jsDir, sourceMapFileName);
            
            if (originalSourceMapContent && obfuscatedSourceMap) {
                console.log(`Composing source maps for ${file}...`);
                const composedMap = await composeSourceMaps(obfuscatedSourceMap, originalSourceMapContent, file);
                if (composedMap) {
                    finalSourceMap = composedMap;
                    console.log(`Successfully composed source maps for ${file}`);
                } else {
                    console.warn(`Failed to compose source maps for ${file}, using obfuscated source map only`);
                }
            }

            const obfuscatedCodeWithSourceMap = obfuscatedCode + `\n//# sourceMappingURL=${sourceMapFileName}`;
            fs.writeFileSync(filePath, obfuscatedCodeWithSourceMap, 'utf8');
            const destJsPath = path.join(outputSourceMapDir, file);
            //fs.copyFileSync(filePath, destJsPath);
            
            fs.writeFileSync(sourceMapPath, finalSourceMap, 'utf8');
            fs.writeFileSync(destJsPath, obfuscatedCodeWithSourceMap, 'utf8');
            console.log(`Source map written to: ${sourceMapPath}`);

            try {

                const injectPath = outputSourceMapDir || jsDir;
                console.log(`\nInjecting Sentry debug IDs in: ${injectPath}`);
                const { execSync } = require('child_process');
                execSync(`sentry-cli sourcemaps inject "${injectPath}"`, { stdio: 'inherit' });
                console.log('Sentry debug ID injection complete.');

                // After injection, copy JS file with injected debug ID back to original path, but remove sourceMappingURL
                const injectedJsPath = path.join(injectPath, file);
                try {
                    let injectedCode = fs.readFileSync(injectedJsPath, 'utf8');
                    // Remove any sourceMappingURL comment
                    injectedCode = injectedCode.replace(/\n?\/\/\# sourceMappingURL=.+$/m, '');
                    fs.writeFileSync(filePath, injectedCode, 'utf8');
                    console.log(`Copied JS with injected debug ID (without sourceMappingURL) back to original: ${filePath}`);
                } catch (copyError) {
                    console.warn(`Failed to copy JS with injected debug ID back to original:`, copyError.message);
                }
            } catch (err) {
                console.warn('Failed to inject Sentry debug IDs:', err.message);
            }

            
            if (originalSourceMapPath && originalSourceMapContent && 
                path.resolve(originalSourceMapPath) !== path.resolve(sourceMapPath)) {
                try {
                    fs.unlinkSync(originalSourceMapPath);
                    console.log(`Deleted original source map: ${originalSourceMapPath}`);
                } catch (deleteError) {
                    console.warn(`Failed to delete original source map ${originalSourceMapPath}:`, deleteError.message);
                }
            }
            
            console.log(`✓ Successfully obfuscated ${file} with source map`);
            
        } catch (err) {
            
            console.error(`❌ Obfuscation failed for ${filePath}:`, err);
        }
    }
    
})();
