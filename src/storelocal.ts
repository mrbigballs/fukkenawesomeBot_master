const Store = require('electron-store');

const store = new Store();

export class StoreLocal{

    getLocalStore(){
        return store;
    }

    setKey(key: any, saveObject: any): void{
        console.log('fgdfhdf');
        store.set(key, saveObject); 
    }

    getKey(key: any): any{
        return store.get(key);
    }

    clearStore(): void{
        store.clear();
    }

}