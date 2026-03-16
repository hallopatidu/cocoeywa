

// ------------- Enum --------------
export enum PropertyStashInternalFlag {
    CUSTOME = 1 << -1,  // custome property decorators. this Internal flag made by cocoseus.
    /**
     * Indicates this property is reflected using "standalone property decorators" such as
     * `@editable`, `@visible`, `serializable`.
     * All standalone property decorators would set this flag;
     * non-standalone property decorators won't set this flag.
     */
    STANDALONE = 1 << 0,

    /**
     * Indicates this property is visible, if no other explicit visibility decorators(`@visible`s) are attached.
     */
    IMPLICIT_VISIBLE = 1 << 1,

    /**
     * Indicates this property is serializable, if no other explicit visibility decorators(`@serializable`s) are attached.
     */
    IMPLICIT_SERIALIZABLE = 1 << 2,
}

export enum CoreError{
    INVALID_NODE,
    INVALID_STATE_DATA
}

// ------------ CONSTANCE -----------
export const CACHE_KEY = '__ccclassCache__';
export const CoreErrorMessage = {
    get [CoreError.INVALID_STATE_DATA]():string{ return 'Invalid StateData. \n'},    
    get [CoreError.INVALID_NODE]():string{ return `The node path does not exist or is not yet created.` }
}

//-------------- Events ---------------
export const ConnectorEvent = {
    NETWORK_CONNECTED:'connector_network_connected_event',
    CONNECTOR_REGISTERED: 'connector_registered_event',
    CONNECTOR_REMOVED : 'connector_removed_event',
    BROADCAST_DATA : 'connector_broadcast_data_event'
}

//--------------- Default Game State ---------------




// ---------- Deprecated ------------
export const StateDataEvent = {
    UPDATE_DATA:'statedata_update_data_event'
}
