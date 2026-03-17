import { join } from 'path';
import { BuildPlugin } from '../@types';
import { PACKAGE_NAME } from './global';

export const load: BuildPlugin.load = function() {
    console.debug(`${PACKAGE_NAME} load`);
};
export const unload: BuildPlugin.load = function() {
    console.debug(`${PACKAGE_NAME} unload`);
};

// const complexTestItems = {
//     number: {
//         label: `i18n:${PACKAGE_NAME}.options.complexTestNumber`,
//         description: `i18n:${PACKAGE_NAME}.options.complexTestNumber`,
//         default: 80,
//         render: {
//             ui: 'ui-num-input',
//             attributes: {
//                 step: 1,
//                 min: 0,
//             },
//         },
//     },
//     string: {
//         label: `i18n:${PACKAGE_NAME}.options.complexTestString`,
//         description: `i18n:${PACKAGE_NAME}.options.complexTestString`,
//         default: 'cocos',
//         render: {
//             ui: 'ui-input',
//             attributes: {
//                 placeholder: `i18n:${PACKAGE_NAME}.options.enterCocos`,
//             },
//         },
//         verifyRules: ['ruleTest'],
//     },
//     boolean: {
//         label: `i18n:${PACKAGE_NAME}.options.complexTestBoolean`,
//         description: `i18n:${PACKAGE_NAME}.options.complexTestBoolean`,
//         default: true,
//         render: {
//             ui: 'ui-checkbox',
//         },
//     },
// };

export const configs: BuildPlugin.Configs = {
    '*': {
        hooks: './hooks',
        options: {
            environment:{
                label: `i18n:${PACKAGE_NAME}.options.environment`,
                default: 'QA',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: `i18n:${PACKAGE_NAME}.options.QA`,
                            value: 'QA',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.Production`,
                            value: 'Production',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.Staging`,
                            value: 'Staging',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.Release`,
                            value: 'Release',
                        }
                    ],
                },
            },
            enableGA: {
                label: `i18n:${PACKAGE_NAME}.options.enableGA`,
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
            gaKey: {
                label: `i18n:${PACKAGE_NAME}.options.gaKey`,
                default: '',
                render: {
                    ui: `ui-input`,
                    attributes: {
                        placeholder: `i18n:${PACKAGE_NAME}.options.gaPlaceHolder`
                    }
                }
            },
            enableSentry:{
                label: `i18n:${PACKAGE_NAME}.options.enableSentry`,
                default:false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
            enableSentryTelemetry:{
                label: `i18n:${PACKAGE_NAME}.options.enableSentryTelemetry`,
                default:false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
            sentryDSN:{
                label: `i18n:${PACKAGE_NAME}.options.sentryDsn`,
                default:'',
                render:{
                    ui:`ui-input`,
                    attributes:{
                        placeholder:`i18n:${PACKAGE_NAME}.options.dsnPlaceHolder`
                    }
                }
            },
            sentryRelease:{
                label: `i18n:${PACKAGE_NAME}.options.sentryRelease`,
                default:'test',
                render:{
                    ui:`ui-input`,
                    attributes:{
                        placeholder:`i18n:${PACKAGE_NAME}.options.sentryReleasePlaceHolder`
                    }
                }
            },
            sentrySampleRate:{
                label: `i18n:${PACKAGE_NAME}.options.sentrySampleRate`,
                default:0.1,
                render: {
                    ui: 'ui-slider',
                    attributes:{
                        step:0.01,
                        min:0,
                        max:1
                    }
                },
            },
            sentryTraceSampleRate:{
                label: `i18n:${PACKAGE_NAME}.options.sentryTraceSampleRate`,
                default:0.1,
                render: {
                    ui: 'ui-slider',
                    attributes:{
                        step:0.01,
                        min:0,
                        max:1
                    }
                },
            },
            isObfuscate: {
                label: `i18n:${PACKAGE_NAME}.options.isObfuscate`,
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
            obSelect:{
                label: `i18n:${PACKAGE_NAME}.options.obSelect`,
                default: 'low',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: `i18n:${PACKAGE_NAME}.options.low`,
                            value: 'low',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.medium`,
                            value: 'medium',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.high`,
                            value: 'high',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.config`,
                            value: 'config',
                        }
                    ],
                },
            },
            obConfigPath: {
                label: `i18n:${PACKAGE_NAME}.options.obConfigPath`,
                render: {
                    ui: 'ui-file'
                },
                verifyRules: [],
            },
            enableEncryption:{
                label: `i18n:${PACKAGE_NAME}.options.enableEncryption`,
                default:false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
            encryptionLevel:{
                label: `i18n:${PACKAGE_NAME}.options.encryptionLevel`,
                default:10,
                render: {
                    ui: 'ui-slider',
                    attributes:{
                        step:1,
                        min:0,
                        max:100
                    }
                },
            },
            securityOption:{
                label: `i18n:${PACKAGE_NAME}.options.securityOption`,
                default: 'Auto',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: `i18n:${PACKAGE_NAME}.options.autoEncryption`,
                            value: 'Auto',
                        },
                        {
                            label: `i18n:${PACKAGE_NAME}.options.manualEncryption`,
                            value: 'Manual',
                        }
                    ],
                },
            },
            password:{
                label: `i18n:${PACKAGE_NAME}.options.password`,
                default:'coco.magic',
                render:{
                    ui:`ui-input`,
                    attributes:{
                        placeholder:`i18n:${PACKAGE_NAME}.options.pwPlaceHolder`
                    }
                }
            },
            seed:{
                label: `i18n:${PACKAGE_NAME}.options.seed`,
                default:'6886',
                render:{
                    ui:`ui-input`,
                },
                
            },
        },
        // panel: './panel',
        verifyRuleMap: {
            ruleTest: {
                message: `i18n:${PACKAGE_NAME}.ruleTest_msg`,
                func(val, buildOptions) {
                    if (val === 'cocos') {
                        return true;
                    }
                    return false;
                },
            },
        },
    },
};

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
