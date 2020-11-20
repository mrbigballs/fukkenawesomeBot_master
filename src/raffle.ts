

export class Raffle{

    keyword: string;
    raffle_active: boolean = false;
    subscriberOnly: boolean;
    subscriberLuck = 0;
    timer: number = 300000; //5 min
    winner: string;
    participants: any[] = [];
    drawlist: any[] = [];
    raffleItems: any[];
    randomKeywordList: string[] = ['awesome', 'sus', 'mask', '2020', 'futile', 'lemonade', 'drunk', 'spike', 'gii', 'chance', 'duckling', 'toad', 'hamster'];
    automaticWhisperWinner: boolean = false;
    announceWinnerInChat: boolean = false;
    chatNotificationStart: boolean = false;
    chatNotificationReminder: boolean = false;
    tmiClient: any;
    store: any;
    raffleSettings = {
        automaticWhisperWinner: false,
        announceWinnerInChat: false,
        chatNotificationStart: false,
        chatNotificationReminder: false,
        raffle_notification_chat_start: "Congrats ##winner## you won!",
        raffle_notification_chat_start_timed: "",
        raffle_notification_chat_reminder: "",
        raffle_notification_chat_winner: "",
        raffle_notification_whisper: "Hey, ##winner## congratulations you won the raffle!!"
    }
    timed_raffle_timeout: any;
    ui_timer_interval: any;

    //load or init settings
    constructor(localStore: any, tmiClient: any) {
        this.tmiClient = tmiClient;
        this.store = localStore;
        if(this.store.has('raffle_settings')){
            this.raffleSettings.automaticWhisperWinner = JSON.parse(this.store.get('raffle_settings')).automaticWhisperWinner;
            this.raffleSettings.announceWinnerInChat = JSON.parse(this.store.get('raffle_settings')).announceWinnerInChat;
            this.raffleSettings.chatNotificationStart = JSON.parse(this.store.get('raffle_settings')).chatNotificationStart;
            this.raffleSettings.chatNotificationReminder = JSON.parse(this.store.get('raffle_settings')).chatNotificationReminder;
            this.raffleSettings.raffle_notification_chat_start = JSON.parse(this.store.get('raffle_settings')).raffle_notification_chat_start;
            this.raffleSettings.raffle_notification_chat_start_timed = JSON.parse(this.store.get('raffle_settings')).raffle_notification_chat_start_timed;
            this.raffleSettings.raffle_notification_chat_reminder = JSON.parse(this.store.get('raffle_settings')).raffle_notification_chat_reminder;
            this.raffleSettings.raffle_notification_chat_winner = JSON.parse(this.store.get('raffle_settings')).raffle_notification_chat_winner;
            this.raffleSettings.raffle_notification_whisper = JSON.parse(this.store.get('raffle_settings')).raffle_notification_whisper;
        }else{
            //init raffle settings
            this.store.set('raffle_settings', JSON.stringify(this.raffleSettings));
        }

        if(this.store.has('raffle_items')){
            this.raffleItems = JSON.parse(this.store.get('raffle_items'));
        }
        
      }

    addParticipant(userstate: any){
        if(this.subscriberOnly){
            if(userstate['subscriber']){
                for(var i = 0; i < this.participants.length; i++){
                    if(this.participants[i]['user-id'] == userstate['user-id']){
                        return;
                    }
                }
                this.participants.push(userstate);
                return userstate;
            }
        }else{
            for(var i = 0; i < this.participants.length; i++){
                if(this.participants[i]['user-id'] == userstate['user-id']){
                    return;
                }
            }
            this.participants.push(userstate);
            return userstate;
        }
        //this.participants.indexOf(displayName) === -1 ? this.participants.push(displayName) : console.log("This user " + displayName + " is already on the list.");
    }


    addUserToList(userstate: any){
       
    }

    updateUIList(){

    }

    drawWinner(){
        let winner: any;
        this.drawlist = [];
        console.log('lock' + this.subscriberLuck);
        if(typeof this.subscriberLuck == 'undefined' || this.subscriberLuck == 0){
            winner = this.participants[Math.floor(Math.random() * this.participants.length)];
        }else{
            for(var i = 0; i < this.participants.length; i++){
                if(this.participants[i]['subscriber']){
                    for(var j = 0; j < this.subscriberLuck; j++){
                        this.drawlist.push(this.participants[i]);
                    }
                }else{
                    this.drawlist.push(this.participants[i]); 
                }
            }
            console.log(JSON.stringify(this.drawlist));
            winner = this.drawlist[Math.floor(Math.random() * this.drawlist.length)];
        }
        console.log('WINNER::: ' + winner['display-name']);
        if(this.announceWinnerInChat){

        }
        if(this.automaticWhisperWinner){

        }
        return winner;
    }

    setKeyword(keyword: string){
        this.keyword = keyword;
    }

    

    startTimedRaffle(){
        this.timed_raffle_timeout = setTimeout(this.drawWinner, this.timer);
    }

    stopTimedRaffle(){
        clearTimeout(this.timed_raffle_timeout);
    }

    startUITimer(){
        this.ui_timer_interval = setInterval(function(){
            
        }, 500);
    }


    clearparticipants(){
        this.participants = [];
    }

    addRaffleItem(game: string, raffleKeyword: string, gameKey: string, winner: string, active: boolean, game_store: string){
        if(typeof  this.raffleItems == 'undefined'){
            this.raffleItems = [];
        }
        let raffleItem = {
            raffle_item: game,
            raffle_keyword: raffleKeyword,
            game_key: gameKey,
            raffle_winner: winner,
            item_active: active,
            store_type: game_store
        }
        this.raffleItems.push(raffleItem);
        this.store.set('raffle_items', JSON.stringify(this.raffleItems));
    }

    updateRaffleItem(index: number, game: string, raffleKeyword: string, gameKey: string, active: boolean, game_store: string){
        if(typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].raffle_item = game;
            this.raffleItems[index].raffle_keyword = raffleKeyword;
            this.raffleItems[index].game_key = gameKey;
            this.raffleItems[index].item_active = active;  
            this.raffleItems[index].store_type = game_store;  
            this.store.set('raffle_items', JSON.stringify(this.raffleItems));  
        }else{
            console.log('element ' + index + ' does not exist');
        }
    }

    deleteRaffleItemByIndex(index: number){
        console.log('index: ' +index);
        if(typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems.splice(index, 1);
            this.store.set('raffle_items', JSON.stringify(this.raffleItems));  
        }
    }

    updateRaffleItemPositionByIndex(from: number, to: number){
        console.log('index: ' +from);
        if(typeof this.raffleItems[from] != 'undefined') {
            //get element from list
            let moveitem = this.raffleItems.splice(from, 1);
            //move element to new position
            let realindex = this.raffleItems.length - to;
            this.raffleItems.splice(realindex, 0, moveitem[0]);
            this.store.set('raffle_items', JSON.stringify(this.raffleItems));  
        }
    }

    updateActiveStateByIndex(index: number, active: boolean){
        if(typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].item_active = active;
            this.store.set('raffle_items', JSON.stringify(this.raffleItems)); 
        }
    }

    updateActiveStateByRaffleItem(raffleItem: any, active: boolean){
        let currentRaffleItemIndex = this.getcurrentRaffleItemIndexByItem(raffleItem);

        if(currentRaffleItemIndex != -1){
            this.updateActiveStateByIndex(currentRaffleItemIndex, active);
        }
    }


    updateWinnerByIndex(index: number, winner: string){
        if(typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].raffle_winner = winner;
            this.store.set('raffle_items', JSON.stringify(this.raffleItems)); 
        }
    }

    updateWinnerByCurrentRaffleItem(raffleItem: any, winner: string){
       let currentRaffleItemIndex = this.getcurrentRaffleItemIndexByItem(raffleItem);

        if(currentRaffleItemIndex != -1){
            this.updateWinnerByIndex(currentRaffleItemIndex, winner);
        }
    }

    getcurrentRaffleItemIndexByItem(raffleItem: any){
        let currentRaffleItemIndex = -1;
        if(raffleItem.game_key != ''){
            for(var i = 0; i < this.raffleItems.length; i++){
               if( this.raffleItems[i].game_key == raffleItem.game_key ){
                    currentRaffleItemIndex = i;
                    break;
               }
            }
        }else if(raffleItem.store_type != '' && raffleItem.raffle_keyword != ''){
            for(var i = 0; i < this.raffleItems.length; i++){
                if( this.raffleItems[i].store_type == raffleItem.store_type &&  this.raffleItems[i].raffle_keyword == raffleItem.raffle_keyword && this.raffleItems[i].raffle_item == raffleItem.raffle_item){
                     currentRaffleItemIndex = i;
                     break;
                }
             }
        }else{
            for(var i = 0; i < this.raffleItems.length; i++){
                if( this.raffleItems[i].raffle_item == raffleItem.raffle_item ){
                     currentRaffleItemIndex = i;
                     break;
                }
             }
        }
        return currentRaffleItemIndex;
    }

    updateRaffleSettings(chatNotiStart: boolean, chatNotiRemind: boolean, chatNotiWinner: boolean, whisperNotiWinner: boolean,
        chatNotiStartMess: string,  chatNotiReminderMess: string,  chatNotiWinnerMess: string,  whisperNotiWinnerMess: string){
           
            this.raffleSettings.chatNotificationStart = chatNotiStart;
            this.raffleSettings.chatNotificationReminder = chatNotiRemind;
            this.raffleSettings.announceWinnerInChat = chatNotiWinner;
            this.raffleSettings.automaticWhisperWinner = whisperNotiWinner;
            this.raffleSettings.raffle_notification_chat_start = chatNotiStartMess;
            this.raffleSettings.raffle_notification_chat_reminder = chatNotiReminderMess;
            this.raffleSettings.raffle_notification_chat_winner = chatNotiWinnerMess;
            this.raffleSettings.raffle_notification_whisper = whisperNotiWinnerMess;

            this.store.set('raffle_settings', JSON.stringify(this.raffleSettings));

    }

    updateRaffleSettingsSimple(){
        this.store.set('raffle_settings', JSON.stringify(this.raffleSettings));
    }

    getRandomKeyword(){
        return this.randomKeywordList[Math.floor(Math.random() * this.randomKeywordList.length)];
    }

    generateMessage(message: string, replaceList: Map<string, string>){
        //var message = "bla bla ${test zwo} kawwabunga ${boi} whatever ${_hola}";
        //var replaceList = new Map<string, string>();
        //replaceList.set("test zwo", "hola");
        //var repMessage = "";
        var regex = /\${([^}]+)}/g; //regex for ${}
        var matchList: string[]  = message.match(regex);
        console.log(matchList);
        for(var i = 0; i < matchList.length; i++){
            var replacementWord = replaceList.get(matchList[i].replace('${', '').replace('}',''));
            console.log(replacementWord);
            if(replacementWord != 'undefined'){
                message = message.replace(matchList[i], replacementWord);
            }

        }
        console.log(message);
        return message;
    }
} 