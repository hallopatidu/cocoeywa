import Pipelineify from "../intermediate/Pipelineify";
import SpineView from "../widgets/SpineView";
import { cocoseus_cceditor } from "./cocoseus_cceditor";


export namespace cocoseus_widgets {   
    export namespace decorate {
        export const pipelinify = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => Pipelineify(constructor))
    }
    export const spineViewify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => SpineView(constructor));
    export const pipelinify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => Pipelineify(constructor));
}