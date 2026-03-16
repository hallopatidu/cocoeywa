import { _decorator, log, warn } from 'cc';

import { IGameData } from '../types/GameDataType';
import { IGameView } from '../types/GameViewType';
import { SlotMachineState } from '../constants/GameState';
import { scenario, ScenarioBlock } from 'db://cocoeywa/scripts/blocks/ScenarioBlock';
import { EDITOR } from 'cc/env';

const { ccclass, property } = _decorator;

@ccclass('LoadingSceneScenario')
export class LoadingSceneScenario extends ScenarioBlock<IGameData, IGameView> {

    @scenario.state({ key: SlotMachineState.INIT_GAME, priority: 0 })
    setupGame() {
        //// XỬ LÝ GAME DATA
        // Truy vấn thuộc tính của một component
        const prevIndex: number = this.data.ShowCaseCarouselView.ImageSlideShow.currentIndex as number;
        
        // Update thuộc tính cụ cho component.
        // this.data.ShowCaseCarouselView.ImageSlideShow.currentIndex = prevIndex + 1;

        //// LÊN KẾ HOẠCH CHẠY CÁC ACTION
        // Chay song song 2 tien trinh. connect server lay game info, load assets
        this.intent(this.view.GameServiceNetwork.joinGameServer, this.view.GameEntryView.startLoadingScene);
        //
        
        // Sau đó chạy tiếp tiến trình hiện nút start.
        this.intent(this.view.GameEntryView.showStartButton);
    }



    @scenario.state(SlotMachineState.JOIN_GAME)
    startGameClick() {
        // const gameInfo = this.data.gameInfo;
        this.intent(this.view.GameEntryView.jumpToNextScene);
    }
}


