

export class Raffle{

    keyword: string;
    subscriberOnly: boolean;
    timer: number = 300000; //5 min
    winner: string;
    participants: string[];
    tmiClient: any;

    constructor(client: any){
        this.tmiClient = client;
    }

    addParticipant(displayName: string){
        this.participants.indexOf(displayName) === -1 ? this.participants.push(displayName) : console.log("This user " + displayName + " is already on the list.");
    }

    drawWinner(){
        return this.participants[Math.floor(Math.random() * this.participants.length)];
    }

    setKeyword(keyword: string){
        this.keyword = keyword;
    }

    startTimedRaffle(){

    }
} 