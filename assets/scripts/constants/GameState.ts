import { DefaultScenarioState } from "db://cocoeywa/scripts/blocks/ScenarioBlock";

export const SlotMachineState = {
    INIT_GAME: DefaultScenarioState.INIT_GAME,
    GET_GAME_INFO: DefaultScenarioState.GET_GAME_INFO,
    JOIN_GAME: DefaultScenarioState.JOIN_GAME,
    READY_TO_PLAY: DefaultScenarioState.READY_TO_PLAY,
    
    SPIN_CLICK:'SPIN_CLICK',
    REQUEST_BET:'REQUEST_BET',
    SPINNING:'SPINNING',
    STOP_SPINNING:'STOP_SPINNING',
    SUDDEN_STOP_SPINNING:'SUDDEN_STOP_SPINNING',
    SHOW_RESULT:'SHOW_RESULT',
    // SHOW_BIGWIN: 'SHOW_BIGWIN',
    // SHOW_TOTALWIN: 'SHOW_TOTALWIN',

    CHANGE_BET:'CHANGE_BET',
    BUY_BONUS_CLICK:'BUY_BONUS_CLICK',
    SHOW_BONUS_POPUP: 'SHOW_BONUS_POPUP',
    REQUEST_BONUS:'REQUEST_BONUS',
}

