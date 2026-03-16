import { _decorator, Component, error, Node, warn } from 'cc';
const { ccclass, property } = _decorator;


export type GameMetaData = {
    api: string;
    currency: string;
    env: string;
    gameCode: string;
    gameId: number;
    ip: string;
    language: string;
    operator?: string;
    playmode?: string;
    returnUrl: string;
    server: string;
    signature?: string;
    staticUrl: string;
    subpath: string;
    timestamp?: number;
    token: string;
    username: string;
    zone: string;
    version?: string;
}

@ccclass('TokenURLVariable')
export class TokenURLVariable extends Component {

    protected _token:string = null;
    get token():string{
        if(!this._token){
            let url = new URL(window.location.href);
            this._token = url.searchParams.get("data");
            if(!this._token || !this._token.length){
                throw new Error('Token invalid : Do not get token from url !');
            }
        }
        return this._token;
    }

    private _meta: GameMetaData;
    get meta(): GameMetaData {
        if(!this._meta){            
            const token:string = this.token
            if(token){
                const dataDecode:string = atob(token);
                this._meta = JSON.parse(dataDecode);
            }            
        }
        return this._meta;
    }

    protected captureError(err:Error){
        warn(err)
    }
    
}


