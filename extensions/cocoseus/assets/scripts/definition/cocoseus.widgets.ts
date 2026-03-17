import Pipelineify from "../intermediate/Pipelineify";
import SpineView from "../widgets/spines/SpineView";
import { cocoseus_cceditor } from "./cocoseus_cceditor";


export namespace cocoseus_widgets {   
   
    export const spineViewify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => SpineView(constructor));
    export const pipelinify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => Pipelineify(constructor));
}