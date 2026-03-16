import { info } from "console";

export type GameInfoPendingType = {//
  luckyMultiplier: number;        // win nhan them bao nhieu lan 1,3,12
  tryLuckySpin: boolean;
  refId: null;
  roundId: null;
  freeSpins: number;
  stake: number;
  accumulatedWinAmount: number;
  gameState: number;
};

export type SettingsType = {
  minBet: number;
  maxBet: number;
  denominations: number[];    // List stakes 
  defaultBetLevel: number;    // neu la 1 thi stake la denominations[0]
  maxPayout: number;
  maxMultiplier: number;
};

export interface FreeSpinPackageType {
    id: number;
    name: string;
    freeSpins: number;
    price: number;
}

export type GameInfoResultType = {
  pending: GameInfoPendingType;     // luon co, 
  luckyMultipliers: number[];
  defaultLuckyMultiplier: number;
  username: string;
  currency: string;
  balance: number;
  settings: SettingsType;
  betlines: number;
  currentFreeSpinPackage: FreeSpinPackageType;
  freeSpinPackages: FreeSpinPackageType[];
  paytable: object[];
  needToStartPromo: boolean;
  promo: null;
};

export type GameInfoResponseType = {
  status: number;
  code: number;
  msg: string;
  timestamp: number;
  result: GameInfoResultType;
};

export type SpinViewResult = {
    /** result before expand wild */
    rawViews: { id: number; value: number[]; }[];
    /** result after expand wild */
    views: { id: number; value: number[]; }[];
}


export interface SpinPayline {
    symbols: number[];      // index cua cac
    payline: number;
    payoutRate: number;
    winType: string;
}

export type BetResponseResultType = {  
  result: SpinViewResult; 
  freeSpins: number; 
  totalFreeSpin: number;        // So freespin trigger duoc trong round co nhieu bets
  totalFreeSpinPayout: number;  // Tong payout cua cac freespin
  multiplier: number;           // multiplier = payout / baseStake
  luckyMultiplier: number; 
  scatterMultiplier: number;    // duy nhat
  paylines: SpinPayline[];              // 
  id: string; 
  refId: string; 
  roundId: string; 
  baseStake: number; 
  stake: number; 
  rawPayout: number; 
  payout: number;               // win trong betInfoView cua tung bet 
  accumulatedWinAmount: number; // win trong betInfoView khi co freespin
  winlose: number;              // winlose = payout - stake
  betTime: number; 
  processedTime: number; 
  settledTime: number;  
  betLines: number;            // So line cua game vi du 20 
  jackpot: number; 
  balance: number; 
  hasReachedMaxWin: boolean;  // 
  maxWin: number;             // 
  gameState: number;          // 
  promoResult: null; 
}; 

export type BetResponseType = {  
  status: number; 
  code: number;
  msg: string; 
  timestamp: number; 
  result: BetResponseResultType; 
}; 

export type FeatureResponseResultType = {  
  freeSpins: number;
  luckyMultiplier: number;
  paylines: any[];
  id: string;
  refId: string;
  roundId: string;
  playType: string;
  stake: number;
  payout: number;
  winlose: number;
  result: SpinViewResult;
  betTime: number;
  processedTime: number;
  settledTime: number;
  betLines: number;
  balance: number;
  freeSpinPackage: FreeSpinPackageType;
}

export type FeatureResponseType = {  
  status: number; 
  code: number;
  msg: string; 
  timestamp: number; 
  result: FeatureResponseResultType; 
}; 

// ----------- Payload -------------

export type FeaturePayloadType = {
  info:{
    stake:number,
    tryLuckySpin: boolean,
    [n:string]: unknown
  }
  event:string
}

export type BetRequestPayload = {
    info: { 
      stake: number,      // lay denom
      betLines: number 
    };
    time: number;
}

export interface BuyBonusPayload {
    info: { 
      stake: number, 
      packageName: string, 
      tryLuckySpin?: boolean // false
    }
}

// --------------------------------