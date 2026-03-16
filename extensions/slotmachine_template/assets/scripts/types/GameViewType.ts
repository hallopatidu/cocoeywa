 export type GameEntryViewType = {
  startLoadingScene: string;
  showStartButton: string;
  jumpToNextScene:string;
};

export type GameServiceNetworkType = {
  joinGameServer: string;
  requestBet: string,
  requestFeature: string
};

export type SlotMachineViewType = {
  startSpinning: string,
  stopSpinning: string,
  suddenStopSpinning:string
};

export type ControlViewType = {
  showReadyState: string,
  showStopState: string,
  showFreeSpinState: string
};

export type BetInfoViewType = {
  updateLabels: string
};

export type IGameView = {
  GameEntryView: GameEntryViewType;
  GameServiceNetwork: GameServiceNetworkType;
  SlotMachineView:SlotMachineViewType;
  ControlView:ControlViewType;
  BetInfoView:BetInfoViewType
};