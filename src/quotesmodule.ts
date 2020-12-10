import { datepicker } from "jquery";
import { Quote } from "./quote";


var Datastore = require('nedb');
let quoteDB = new Datastore({
    filename: __dirname + '/../db/quotes.db', // provide a path to the database file 
    autoload: true, // automatically load the database
    timestampData: true // automatically add and manage the fields createdAt and updatedAt
  });


export class QuotesModule{

    current_quote: Quote;

    mapEntrytoQuote(quoteEntry: any){
        var current_quote =  new Quote(quoteEntry._id, quoteEntry.quote, quoteEntry.username, quoteEntry.date, quoteEntry.game);
        return current_quote;      
    }

    addQuoteToDB(_id: number, quote: string, username: string, date: string, game: string){
        var quote_entry = new Quote(_id, quote, username, new Date(), game);
        quoteDB.insert(quote_entry, function (err: Error, newDoc: any) {   // Callback is optional
            // newDoc is the newly inserted document, including its _id
            // newDoc has no key called notToBeSaved since its value was undefined
          });
    }
}