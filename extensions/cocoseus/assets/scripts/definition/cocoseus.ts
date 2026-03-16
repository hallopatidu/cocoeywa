import { Constructor } from "cc";
import { cocoseus_types } from "./cocoseus_types";
import { cocoseus_classify } from "./cocoseus_classify";
import { cocoseus_cceditor } from "./cocoseus_cceditor";
import { cocoseus_utils } from "./cocoseus_utils";
import { cocoseus_widgets } from "./cocoseus.widgets";
import Pipelineify from "../intermediate/Pipelineify";

// const CCEditor = cocoseus_cceditor;

export namespace cocoseus {
    export const CCClassify = cocoseus_classify.make;
    export const utils = cocoseus_utils;
    export const CCEditor = cocoseus_cceditor;

    export const spineViewify = cocoseus_widgets.spineViewify;
    export const pipelinify = cocoseus_widgets.pipelinify;
    export namespace decorate {
        export const pipelinify = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => Pipelineify(constructor))
    }
}