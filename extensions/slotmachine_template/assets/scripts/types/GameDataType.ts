import { BetRequestPayload, BetResponseType, FeaturePayloadType, GameInfoResponseType } from "./ServiceDataType";

export type ImageSlideShowDataType = { 
  currentIndex: unknown;
 };

export type IndicatorComponentDataType = { 
  currentIndex: unknown;
 };

export type ShowCaseCarouselViewDataType = { 
  ImageSlideShow: ImageSlideShowDataType;
  IndicatorComponent: IndicatorComponentDataType;
};
export type SlotMachineViewDataType = { 
  slotMachineMatrix:number[],
};
export type IGameData = { 
  gameInfo: GameInfoResponseType,
  betRequestPayLoad: BetRequestPayload,
  featurePayLoad:FeaturePayloadType,
  featureResponse: any,
  betResponse:BetResponseType,
  stake:number,
  balance:number,
  winAmount:number
  slotMachineMatrix:number[],
  SlotMachineView:{
    SlotMachineView:SlotMachineViewDataType
  }
  ShowCaseCarouselView: ShowCaseCarouselViewDataType;
};