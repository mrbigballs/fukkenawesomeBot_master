import { ObsError } from "obs-websocket-js";

const OBSWebSocket = require('obs-websocket-js');

export class OBSConnection{

    obs: any = new OBSWebSocket();

    constructor(){
        this.obs.connect({ address: 'localhost:4444', password: '' });

        this.obs.on('SwitchScenes', (data: IntersectionObserverCallback) => {
            console.log('No IDEA Waht im doing');
            console.log('SwitchScenes', data);
          });

          this.obs.on('error', (err: ObsError) => {
            console.error('socket error:', err);
        });
    }

    



}


