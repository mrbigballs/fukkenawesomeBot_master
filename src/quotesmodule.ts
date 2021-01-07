import { datepicker } from "jquery";
import { Quote } from "./quote";
import { nSQL } from "@nano-sql/core";

/*
var Datastore = require('nedb');
let quoteDB = new Datastore({
    filename: __dirname + '/../db/quotes.db', // provide a path to the database file 
    autoload: true, // automatically load the database
    timestampData: true, // automatically add and manage the fields createdAt and updatedAt,
    corruptAlertThreshold: 1
  });
*/


nSQL().createDatabase({
    id: "quote_db", // can be anything that's a string
    mode: "PERM", // save changes to IndexedDB, WebSQL or SnapDB!
    tables: [ // tables can be created as part of createDatabase or created later with create table queries
        {
            name: "quotes",
            model: {
                "id:int": {pk: true, ai: true},
                "quote:string": {notNull: true},
                "created:date": {notNull: true},
                "creator:string": {notNull: true},
                "game:string": {}
            }
        }
    ],
    version: 3, // current schema/database version
    onVersionUpdate: (prevVersion) => { // migrate versions
         return new Promise((res, rej) => {
             switch(prevVersion) {
                 case 1:
                     // migrate v1 to v2
                    res(2);
                    break;
                 case 2:
                     // migrate v2 to v3
                     res(3);
                     break;
             }

         });

     }
}).then(() => {
    // ready to query!
}).catch(() => {
    // ran into a problem
})

export class QuotesModule{


    


    addQuoteToDB(quoteStr: string, username: string, gameStr: string){
        nSQL("quotes").query("upsert", {quote: quoteStr, created: new Date(), creator: username, game: gameStr}).exec();

    }

    getQuoteById(quote_id: number){
        nSQL("quotes").query("select").where(["id", "=", quote_id]).exec().then((rows) => {
            console.log(rows) // <= array of row objects
        });
    }

    printTable(){
        // Get all rows from the users table.
        nSQL("quotes").query("select").exec().then((rows) => {
            console.log(rows) // <= array of row objects
        });
    }

    /*
    current_quote: Quote;
    increment:number = -1;

    mapEntrytoQuote(quoteEntry: any){
        var current_quote =  new Quote(quoteEntry._id, quoteEntry.quote, quoteEntry.username, quoteEntry.date, quoteEntry.game);
        return current_quote;      
    }

    addQuoteToDB(quote: string, username: string, game: string){
        //this.getAutoIncrementId();
        var new_id = this.increment;
        console.log('newID: ' + new_id);
        var quote_entry = new Quote(new_id == -1 ? 1 : new_id, quote, username, new Date(), game);
        quoteDB.insert(quote_entry, function (err: Error, newDoc: any) {   // Callback is optional
            // newDoc is the newly inserted document, including its _id
            // newDoc has no key called notToBeSaved since its value was undefined
          });
          this.increment = -1;
    }


    checkIfDBisEmpty(){
        quoteDB.count({}, function (err: any, count: number) {
            console.log('Count: '  + count);
            if(count == 0){
                console.log("empty");
            }
          });
    }

    getAutoIncrementId(quote: string, username: string, game: string){
        quoteDB.count({}, function (err: any, count: number) {
            if(count != 0){
                quoteDB.find({}).sort({ _id: -1 }).limit(1).exec(function (err: any, docs: any) {
                    if(err){
                        throw err;
                        console.log('FUCKEN ERROR ' + err);
                        console.log(err);
                    }else{
                        console.log('FUCKEN DOCKS ' + docs);
                        if(typeof docs === 'undefined'){
                           
                        }else{
                            console.log(docs[0]);
                            var increment = docs[0]._id + 1;   
                            console.log('Crement: ' + this.increment);
                            var quote_entry = new Quote(increment == -1 ? 1 : increment, quote, username, new Date(), game);
                            quoteDB.insert(quote_entry, function (err: Error, newDoc: any) {   // Callback is optional
                                // newDoc is the newly inserted document, including its _id
                                // newDoc has no key called notToBeSaved since its value was undefined
                              });
                        }
                        
                        
                    }
                });
            }

        });   
            
          
    }
    

    getQuoteBySeqId(seqId: number){
        quoteDB.find({ seq: ''+ seqId }, function (err: Error, docs: any) {
            if(err){
                console.log('FUCKEN ERROR ' + err);
            }else{
                console.log('FUCKEN DOCKS ' + docs);
                this.mapEntrytoQuote(docs);
                
            }
          });
    }

    */
}