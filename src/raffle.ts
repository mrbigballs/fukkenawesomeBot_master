

export class Raffle{

    keyword: string;
    subscriberOnly: boolean;
    timer: number = 300000; //5 min
    winner: string;
    participants: string[];
    raffleItems: any[];
    automaticWhisperWinner: boolean = false;
    announceWinnerInChat: boolean = false;
    tmiClient: any;
    store: any;
    raffleSettings = {
        automaticWhisperWinner: "false",
        announceWinnerInChat: "false",
        timer: 300000,
        raffle_notification_chat: "Congrats ##winner## you won!",
        raffle_notification_whsiper: "Hey, ##winner## congratulations you won the raffle!!",
        raffle_notification_game_key: "Here is your key for ##item## ##game_platform##-Key: ##game_key"

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
            this.raffleSettings.timer = JSON.parse(this.store.get('raffle_settings')).timer;
        }else{
            //init raffle settings
            this.store.set('raffle_settings', JSON.stringify(this.raffleSettings));
        }
        
      }

    addParticipant(displayName: string){
        this.participants.indexOf(displayName) === -1 ? this.participants.push(displayName) : console.log("This user " + displayName + " is already on the list.");
    }

    drawWinner(){
        let winner = this.participants[Math.floor(Math.random() * this.participants.length)];
        if(this.announceWinnerInChat){

        }
        if(this.automaticWhisperWinner){

        }
    }

    setKeyword(keyword: string){
        this.keyword = keyword;
    }

    

    startTimedRaffle(){
        this.timed_raffle_timeout = setTimeout(function(){
            console.log('timed raffle');
            this.drawWinner();
        }, this.timer);
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

    addRaffleItem(game: string, raffleKeyword: string, gameKey: string, winner: string){
        let raffleItem = {
            raffle_item: game,
            raffle_keyword: raffleKeyword,
            game_key: gameKey,
            raffle_winnder: winner
        }
        this.raffleItems.push(raffleItem);
    }

    updateRaffleItem(index: number, game: string, raffleKeyword: string, gameKey: string, winner: string){
        if(typeof this.raffleItems[index] != 'undefined') {
            this.raffleItems[index].raffleItem.raffle_item = game;
            this.raffleItems[index].raffleItem.raffle_keyword = raffleKeyword;
            this.raffleItems[index].raffleItem.game_key = gameKey;
            this.raffleItems[index].raffleItem.raffle_winnder = winner;    
        }else{
            console.log('element ' + index + ' does not exist');
        }
    }
} 