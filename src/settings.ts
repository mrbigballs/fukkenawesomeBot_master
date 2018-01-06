

export class Settings{


  //Connection settings
  streamerUserName: string;
  streamerOAuthkey: string;
  //channel
  channel: string;
  //autoconnect
  autoconnect:boolean = false;
  //optional
  customBotName: string | null;
  customBotOAuthkey: string| null;

  //Theme
  themeDark: boolean = true;
  themePath: string = '';
  //chat highlight  
  chatHighlightNames: string[] = [];

  //quotes
  quoteSystemEnabled: boolean;
  quote: boolean;
  quoteAdd: boolean;
  quoteDel: boolean;
  quoteEdit: boolean;


  constructor(sName: string, sOauthkey: string, channel: string, autconn: boolean,
              cBotName: string, cBotOauthkey: string, themeDark: boolean, themePath: string,
              chatHighlights: string[], quoteEnabled: boolean, quote: boolean, quoteAdd: boolean,
              quoteDel: boolean, quoteEdit: boolean){
        this.streamerUserName = sName;
        this.streamerOAuthkey = sOauthkey;
        this.channel = channel;
        this.autoconnect = autconn;
        this.customBotName = cBotName;
        this.customBotOAuthkey = cBotOauthkey;
        this.themeDark = themeDark;
        this.themePath = themePath;
        this.quoteSystemEnabled = quoteEnabled;
        this.quote = quote;
        this.quoteAdd = quoteAdd;
        this.quoteDel = quoteDel;
        this.quoteEdit = quoteEdit;
        this.chatHighlightNames = chatHighlights;
  }


    
}