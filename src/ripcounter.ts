export class RipCounter{

    game: string;
    store: any;
    RipCounterMap: Map<string, number[]>;


    constructor(localStore: any) {
        this.store = localStore;
        if(this.store.has('ripmap')){
            this.RipCounterMap = new Map(JSON.parse(this.store.get('ripmap')));
        }else{
            this.RipCounterMap = new Map();
        }
        
      }

    addRip(currentGame: string, type: string){
        //game already on list
        if(this.RipCounterMap.has(currentGame)){
           let rip = this.RipCounterMap.get(currentGame)[0];
           let grip = this.RipCounterMap.get(currentGame)[1];
           rip++;
           if(type == 'grip'){
               grip++;
           }
           this.RipCounterMap.get(currentGame)[0] = rip;
           this.RipCounterMap.get(currentGame)[1] = grip;
           this.saveRipMap();
        }else{//game not on list
            if(type == 'grip'){
                this.RipCounterMap.set(currentGame, [1,1]);
            }else{
                this.RipCounterMap.set(currentGame, [1,0]);
            }
            this.saveRipMap();
        }
    }

    setRip(currentGame: string, type: string, ripcount: number){
        if(this.RipCounterMap.has(currentGame)){
            if(type == 'grip'){
                this.RipCounterMap.get(currentGame)[1] = ripcount;
            }else{
                this.RipCounterMap.get(currentGame)[0] = ripcount;
            }
            this.saveRipMap();
         }else{//game not on list
             if(type == 'grip'){
                 this.RipCounterMap.set(currentGame, [0,ripcount]);
             }else{
                 this.RipCounterMap.set(currentGame, [ripcount,0]);
             }
             this.saveRipMap();
         }
    }

    getRip(currentGame: string): number[]{
        if(this.RipCounterMap.has(currentGame)){
            return this.RipCounterMap.get(currentGame);
        }else{
            return [0,0];
        }
    }

    saveRipMap(){
        this.store.set('ripmap',JSON.stringify(this.RipCounterMap));
    }

}