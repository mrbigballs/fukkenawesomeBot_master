

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

  //use uiNotifications
  uiNotifications: boolean;

  //quotes
  quoteSystemEnabled: boolean;
  quote: boolean;
  quoteAdd: boolean;
  quoteDel: boolean;
  quoteEdit: boolean;


  constructor(sName: string, sOauthkey: string, channel: string, autconn: boolean,
              cBotName: string, cBotOauthkey: string, themeDark: boolean, themePath: string,
              chatHighlights: string[], quoteEnabled: boolean, quote: boolean, quoteAdd: boolean,
              quoteDel: boolean, quoteEdit: boolean, uiNotifications:  boolean){
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
        this.uiNotifications = uiNotifications;
       
  }

  setBotToken(token: string): void {
      this.customBotOAuthkey = token;
  }

  setUserNameBot(username: string): void {
    this.customBotName = username;
  }

  setUserNameStreamer(username: string): void {
    this.streamerUserName = username;
  }

  setStreamerToken(token: string): void {
    this.streamerOAuthkey = token;
}

setChannel(channel_name: string): void {
  this.channel = channel_name;
}

setAutoconnect(autoCon: boolean): void {
  this.autoconnect = autoCon;
}


    
}