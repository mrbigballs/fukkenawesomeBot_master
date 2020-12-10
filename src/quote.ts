export class Quote{


    //Basics
    _id: number;
    quote: string;
    contributer_name: string;
    date: Date;
    
    //optional
    game: string | null;
    
    constructor(_id: number, quote: string, username: string, date: Date, game: string){
        this._id = _id;
        this.quote = quote;
        this.contributer_name = username;
        this.date = date;
        this.game = game;
    }



}