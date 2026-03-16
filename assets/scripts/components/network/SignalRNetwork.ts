
import * as signalRModule from '@microsoft/signalr';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import * as msgpack from '@msgpack/msgpack';
import { _decorator, Component, director, Enum, log, Node } from 'cc';
import { TokenURLVariable } from './TokenURLVariable';
import { DEV } from 'cc/env';

const { ccclass, property, executeInEditMode } = _decorator;

// SignalR uses cjs to package module. DKM
const {HubConnectionBuilder, HttpTransportType, HubConnectionState, HubConnection} = signalRModule['default'];
const {MessagePackHubProtocol} = signalRMsgPack['default'];
const {encode} = msgpack['default'];

export enum RequestMethodEnum {
    GET,
    SET
}

type PromiseAbortTask<T = unknown> = {
    token:string,
    resolve?:(...args:T[])=>void
    reject?:(...args:T[])=>void
}

type HubConnectionType = typeof HubConnection

const SignalRVariable = {
    GameCode:'gameCode'
}

const INVOKE_EVENT = {
    X:"x",
}




@ccclass('NetworkVariable')
class NetworkVariable {    
    @property({
        type:Enum(RequestMethodEnum),
        visible:true
    })
    type:RequestMethodEnum = RequestMethodEnum.GET;
    
    @property
    key:string = 'gameCode'
    @property
    value:string = ''

    toString():string{
        return `${this.key.trim()}=${this.value.trim()}`
    }
}

/**
 * Mỗi lần chỉ gọi một event
 * 
 */
@ccclass('SignalRNetwork')
export class SignalRNetwork extends Component {
    @property({
        visible() {
            return !this.metaInfo.enabled;
        }
    })
    private _server: string = '';
    protected get server(): string {
        return !this.metaInfo.enabled || !this.metaInfo.meta ? this._server : this.metaInfo.meta.server;
    }
    protected set server(value: string) {
        this._server = value;
    }
    
    @property
    protected path:string = 'ws/gamehub' 

    @property({
        type:[NetworkVariable]
    })
    protected variables:NetworkVariable[] = [];

    @property({displayName:'Ping Step'})
    pingStep:number = 2;

    @property({displayName:'Ping Timeout'})
    pingTimeout:number = 6;

    @property({displayName:'Event Timeout'})
    eventTimeout:number = 3;

    private _metaInfo:TokenURLVariable = null
    protected get metaInfo():TokenURLVariable{
        if(!this._metaInfo){
            this._metaInfo = this.getComponent(TokenURLVariable);
        }
        return this._metaInfo
    }

    private _token: string = '';
    protected get token(): string {
        if(!this._token || !this.token.length){
            this._token = this.metaInfo.token;
        }
        return this._token;
    }


    private _connection: HubConnectionType = null;    
    protected get connection(): HubConnectionType {
        if(!this._connection){
            this._connection = this.createHubConnection();
        }
        return this._connection;
    }



    protected _gameCode:string =''
    get gameCode():string {
        if(!this._gameCode){
            const variable:NetworkVariable = this.variables.find((variable:NetworkVariable)=>variable.key == SignalRVariable.GameCode)
            this._gameCode = variable.value
        }
        return this._gameCode;
    }

    protected _eventTasks:Map<string, PromiseAbortTask> = new Map<string, PromiseAbortTask>()
    // protected _eventTasks:Map<string, SettedPromiseTask> = new Map<string, SettedPromiseTask>()

    // ----------------------------

    protected onDestroy(): void {
        
        this._connection.close();
        this._connection = null;
    }

    // -------------- Public ---------------------

    public async connect():Promise<void>{
        try {
            if (
                this.connection.state === HubConnectionState.Connected ||
                this.connection.state === HubConnectionState.Connecting
            ) {
                await this.connection.stop();
            }

            await this.connection.start();

            if (this.connection.state !== HubConnectionState.Connected) {
                throw new Error("Socket not in Connected state");
            }

        } catch (error) {            
            this.broadcastError("Connection error:", error)
        }
    }

    public async close(): Promise<void> {
        this.closeAllTasks();
        await this.connection.stop();
    }

    // public async sendEvent<T = unknown>(event:string, data?:T):Promise<unknown>{
    //     return await this.asyncInvoke(event, data)
    // }

    
    /**
     * 
     * @param event 
     * @param data 
     * @returns 
     */
    public async asyncInvoke<T = unknown>(event:string, data?:unknown):Promise<T>{
        const dataToSend:unknown = data ? encode(data) : null;
        try{
            const task:PromiseAbortTask = this.openTask(event);
            const result:T = await this.callWithTimeout<T>(this.invokeSending.bind(this),this.eventTimeout, task.token, event, dataToSend);
            this.closeTask(event);
            return result;

        }catch(err){
            this.broadcastError(`Invoke failed: ${event}`, err);
            return null;
        }
    }

    public async asyncPing(){
        try{

        }catch(err){

        }
    }

    
    public clearEventMap(): void {
        const methods = this.connection['_methods'];
        if (methods) {
            for (const methodName in methods) {
                if (methods.hasOwnProperty(methodName)) {
                methods[methodName] = [];
                }
            }
        }
    }

    public subscribeEvent(event: string, callback: (...args: any[]) => void): void {
        this.connection.on(event, callback);
    }

    public unsubscribeEvent(event: string): void {
        this.connection.off(event);
    }

    public registerOnClose(callback: (error: any) => void): void {
        this.connection.onclose((error) => {            
            this.logEvent("[SignalR] Connection closed:", error)
            callback(error);
        });
    }

    public registerOnReconnecting(callback: (error: any) => void): void {
        this.connection.onreconnecting((error) => {
            this.logEvent("[SignalR] Reconnecting:", error)
            callback(error);
        });
    }

    public registerOnReconnected(callback: (connectionId: any) => void): void {
        this.connection.onreconnected((connectionId) => {            
            this.logEvent("[SignalR] Reconnected with id:", connectionId)
            callback(connectionId);
        });
    }

    // ------------------------------------

    protected broadcastError(message:string, error:Error){
        DEV && console.error(`⚠ [SignalR] ${message}`, error);
    }

    protected logEvent(...args:unknown[]){
        args.unshift('✓ [SignalR] ')
        log(...args)
    }

    // ------------------ Custom Abort Controller ------------------

    /**
     * 
     * @param event 
     * @param reason 
     * @param args 
     */
    private closeTask(event:string, reason?:'reject'|'resolve', ...args:unknown[]){
        const task:PromiseAbortTask = this._eventTasks.get(event);
        if(task){
            this.connection.off(event);
            if(reason){
                task[reason](...args);
            }
            task.reject = null;
            task.resolve = null;
            this._eventTasks.delete(event);
        }
    }

    /**
     * 
     * @param event 
     * @returns 
     */
    private openTask(event:string):PromiseAbortTask{
        if(this._eventTasks.has(event) ){
            // 
            this.closeTask(event);
        }
        const promiseTask:PromiseAbortTask = Object.create(null);
        promiseTask.token = this.generateToken(event, (new Date()).getTime());
        this._eventTasks.set(event, promiseTask);
        return promiseTask
    }

    private getTask(event:string):PromiseAbortTask{
        return this._eventTasks.get(event);
    }

    /**
     * 
     */
    private closeAllTasks(){                  
        const entries:MapIterator<[string, PromiseAbortTask<unknown>]> = this._eventTasks.entries();
        for (const [key, value] of entries) {             
            this.closeTask(key, 'reject', null);
        }
    }

    // -----------------------------------------------

    /**
     * 
     * @param input 
     * @param seed 
     * @returns 
     */
    private generateToken(input: string, seed: number): string {
        let hash = seed >>> 0; // đảm bảo uint32

        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 16777619); // FNV-like
        }

        // chuyển sang base36 cho ngắn
        return hash.toString(36);
    }

    /**
     * 
     * @param event 
     * @param requestToken 
     * @returns true : token hop le, false: ko hop le.
     */
    private isValidToken(event:string, requestToken:string):boolean{        
        const task:PromiseAbortTask = this.getTask(event);        
        return (!task || (task.token !== requestToken)) ? false : true;
    }

    /**
     * 
     * @param func 
     * @param requestToken 
     * @param event 
     * @param data 
     * @returns 
     */
    private async callWithTimeout<T = unknown>(func: (...args: unknown[]) => Promise<T>, timeout:number, requestToken:string, event:string, data:unknown):Promise<T>{
        let id:unknown;
        const timeoutPromise = new Promise<T>((_, reject) => {
            const currentTimeout:number = timeout || this.eventTimeout;
            id = setTimeout(() => { 
                clearTimeout(id as number);                
                reject(new Error("Event '" + event + "' was aborted due to timeout " + currentTimeout + " seconds")); 
                this.closeTask(event, "reject", null);
            }, (timeout || this.eventTimeout)*1000); 
        });
        // Promise thực thi hàm 
        try{
            const taskPromise = func(requestToken, event, data); // Đua giữa hai promise 
            const result:T = await Promise.race([taskPromise, timeoutPromise]);
            clearTimeout(id as number);
            return result;
        }catch(err){
            this.closeTask(event, "reject", err);
            clearTimeout(id as number);
            return err            
        }
    }

    private async invokePing<T = unknown|null>(token:string, event:string, data:T):Promise<T>{
        return
    }

    /**
     * Kiem tra co token de chay ko.
     * Neu khong co token hoac token khac thi reject
     * @param requestToken 
     * @param event 
     * @param data 
     * @returns 
     */
    private async invokeSending<T = unknown|null>(requestToken:string, event:string, data:T):Promise<T>{
        try{            
            const currentToken:string = requestToken;
            if(!this.isValidToken(event, currentToken)){
                throw new Error('Reject promise when meet these double tokens are runnning: ' + requestToken);
            }
            const result:T = await Promise.all([
                new Promise<T>((resolve:Function, reject:Function)=>{ 
                    const task:PromiseAbortTask = this.getTask(event);
                    task.reject = (err:Error)=>{
                        reject(null);
                    }
                    task.resolve = (data:unknown)=>{
                        resolve(data);
                    }
                    // if(!this.isValidToken(event, currentToken)){
                    //     throw new Error('Reject promise when meet these double tokens are runnning: ' + token);
                    // }
                    this.connection.on(event, (response:string|null)=>{
                        this.closeTask(event, 'resolve', response)
                    })
                    
                }),
                this.connection.invoke("x", this.gameCode, event, data)
            ])
            return result[0];
        }catch( err){
            // this.broadcastError('Reject promise when meet these double tokens are runnning: ' + token, err);            
            this.closeTask(event, 'reject', err);
            return null
        }
    }

    /**
     * 
     * @returns 
     */
    private createUrl():string{
        let url:string = `${this.server}/${this.path}`;

        const variableString:string = this.variables.reduce((stringVariable:string , variable:NetworkVariable)=>{
            let variableCode:string
            if(variable.type == RequestMethodEnum.GET){
                variableCode = (stringVariable.length > 0) ? '&':'';
            }
            return stringVariable + variableCode + variable.toString();
        }, '')
        return url + '?' + variableString;
    }

    // 
    /**
     * 
     * @param url 
     * @returns 
     */
    private createHubConnection(url?:string):HubConnectionType{
        url = url || this.createUrl();
        const token:string = this.token;    // Game token
        // const url = `${server}/ws/gamehub?gamecode=${gameCode}`;
        try{
            if(!token){
                this.broadcastError("Create connection ", new Error('Game Token invalid !'))
                return;
            }
            const connection:HubConnectionType = (new HubConnectionBuilder()).withUrl(url, {
                accessTokenFactory:async():Promise<string>=>{
                    return token;
                },
                transport: HttpTransportType.WebSockets
            })
            .withHubProtocol(new MessagePackHubProtocol())
            .withAutomaticReconnect([0, 1000, 5000, null])
            .build();
            return connection;
        }catch(err){
            this.broadcastError("Create connection Error ", err)
        }
        
    }

    

}


