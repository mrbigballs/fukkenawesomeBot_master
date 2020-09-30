const tinycolor = require("tinycolor2");
//const Store = require('electron-store');
import { StoreLocal } from './storelocal';

const store = new StoreLocal().getLocalStore();

export class ChatMessageFormatter{
    
    chatcolors = new Map();

    formatEmotes(text: string, emotes: any) {
        let splitText = text.split('');
        for(let i in emotes) {
            let e = emotes[i];
            for(let j in e) {
                let mote = e[j];
                if(typeof mote == 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    let length =  mote[1] - mote[0],
                        empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
                }
            }
        }
        return splitText.join('');
    }

    formatGlobalBadges(badges: any){
        let badgespan = document.createElement('span');
        try{
            if(badges != null){
                //console.log(JSON.stringify(badges));
                let glob_badges = JSON.parse(store.get('global_badges'));
                //console.log('glob : ' + JSON.stringify(glob_badges));
                let channel_badges = JSON.parse(store.get('channel_badges'));
                //console.log('glob : ' + JSON.stringify(channel_badges));
                //console.log('no idea ' + glob_badges.badge_sets.moderator.versions[1].image_url_4x);
                for(let key in badges){
                    let badgeimg = document.createElement('img');
                    badgeimg.setAttribute('class', 'badges');
                    //console.log('badgename: ' + i + ' value' + glob_badges.i);
                    if (badges.hasOwnProperty(key)) {
                        //console.log(key + " -> " + badges[key]);
                        if(key != 'subscriber'){
                            console.log(key + " -> " + badges[key]);
                            let badge_url = glob_badges.badge_sets[key].versions[badges[key]].image_url_1x;
                            badgeimg.setAttribute('src', badge_url);
                            badgeimg.setAttribute('title', glob_badges.badge_sets[key].versions[badges[key]].description);
                            badgespan.appendChild(badgeimg);
                        }else{
                            console.log(key + " -> " + badges[key]); 
                            let badge_url = channel_badges.badge_sets[key].versions[badges[key]].image_url_1x;
                            badgeimg.setAttribute('src', badge_url);
                            badgeimg.setAttribute('title', channel_badges.badge_sets[key].versions[badges[key]].description);
                            badgespan.appendChild(badgeimg);
                        }
                    }
                }
                console.log(badgespan);
                return badgespan;
            }else{
                return badgespan;
            }
        }catch(e){
            console.log(e.message);
            return badgespan;
        }
        
    }

    

    getTimeStamp(){
        let date = new Date();
        let datetext = '[ ' + date.toTimeString().split(' ')[0].split(':')[0] + ':' + date.toTimeString().split(' ')[0].split(':')[1] + ' ]';
        return datetext;
    }

    generateChatMessage(userstate: any, message: string){
        let chatMessage: string;
        let chatTimestamp = this.getTimeStamp();
        let displayName = userstate['display-name'];
        let displaNameColor = userstate.color;
        let formattedMessage = this.formatEmotes(message, userstate.emotes);
        chatMessage += '<div class=\"user-chat-message\"><span class=\"user-chat-message-timestamp\">' + chatTimestamp + '</span>'
                        + '<span class=\"context-menu-one user-chat-message-username\" style=\" + displaNameColor + \">' + displayName + '</span>'
                        + '<span>:</span>' 
                        + '<span class=\"message\">' + formattedMessage + '</span></div>';
        return chatMessage;
    }

    generateChatMessageElement(userstate: any, message: string, keywords: string[], type: string){
        let chatDivContainer = document.createElement('div');
        let timeStampSpan = document.createElement('span');
        let typeSpan = document.createElement('span');
        let chatUsernameSpan = document.createElement('span');
        let chatMessageSpan = document.createElement('span');
        let chatMessageTrennerSpan = document.createElement('span');
        let userIdSpan = document.createElement('span');
        let userTypeSpan = document.createElement('span');
        let chatMessage: string;
        let chatTimestamp = this.getTimeStamp();
        let badgesSpan = this.formatGlobalBadges(userstate.badges);
        let displayName = userstate['display-name'];
        let userId = userstate['user-id'];
        let userType = userstate['user-type'];
        var str = JSON.stringify(userstate)
        console.log("id???: " + userId + ' ' + userType + ' ' + str);
        let displaNameColor: string;
        if(userstate.color == null){
            //console.log(store.get(displayName+'_color'));
            //store.has(displayName+'_color') ||
            if( this.chatcolors.has(displayName+'_color')){
                //displaNameColor = store.get(displayName+'_color');
                displaNameColor = this.chatcolors.get(displayName+'_color');
                console.log('temporary ' + this.chatcolors.get(displayName+'_color'))
            }else{
                var user_temp_color = this.getRandomColor();
                //store.set(displayName+'_color', user_temp_color);
                this.chatcolors.set(displayName+'_color', user_temp_color);
                //console.log(store.get(displayName+'_color'));
                displaNameColor = user_temp_color;
            }
        }else{
            displaNameColor = userstate.color;
        }
        //displaNameColor = userstate.color == null ? this.getRandomColor() : userstate.color;
        let formattedMessage = this.formatEmotes(message, userstate.emotes);
        if(this.highlightMessagesByKeywords(keywords, message)){
            chatMessageSpan.style.background = 'rgba(102, 0, 0, 0.5)';
        }
        if(store.get('chat_settings_show_whisper') == 'true'){
            chatDivContainer.setAttribute('class', 'user-chat-message ' + type);
        }else{
            chatDivContainer.setAttribute('class', 'user-chat-message ' + type + ' none-show');
        }
       
        timeStampSpan.setAttribute('class','user-chat-message-timestamp');
        timeStampSpan.innerHTML = chatTimestamp;
       
        chatUsernameSpan.setAttribute('class','task context-menu-one user-chat-message-username');
        chatUsernameSpan.setAttribute('style', 'color:'+ this.getNameColor(displaNameColor, true));
        chatUsernameSpan.innerHTML = '' +displayName;
        chatMessageSpan.setAttribute('class','message');
        chatMessageSpan.innerHTML = formattedMessage;
        chatMessageTrennerSpan.innerHTML = ':';

        //userTypeSpan

        userIdSpan.setAttribute('class', 'userId');
        userIdSpan.innerHTML = userId;
        userIdSpan.style.display = 'none';
        chatDivContainer.appendChild(timeStampSpan);
        if(type === 'whisper' || type === 'action'){
            typeSpan.innerHTML = '[' + type.toLocaleUpperCase() +']';
            chatDivContainer.appendChild(typeSpan);
        }
        chatDivContainer.appendChild(badgesSpan);
        chatDivContainer.appendChild(chatUsernameSpan);
        chatUsernameSpan.appendChild(userIdSpan);
        chatDivContainer.appendChild(chatMessageTrennerSpan);
        chatDivContainer.appendChild(chatMessageSpan);
        console.log(chatDivContainer);
        return chatDivContainer;
    }

    getRandomColor() {
        let letters: string = '0123456789ABCDEF';
        let color: string = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

      getNameColor(nameColor: string, dark: boolean){
        let color = new tinycolor(nameColor);
        let text_shadow_color = color.complement().toHexString();
        if(dark && color.isDark()){
            if(store.get('chat_settings_outlines') == 'white'){
                return nameColor + '; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;';
            }else if(store.get('chat_settings_outlines') == 'dynamic'){
                return nameColor +'; text-shadow: -1px 0 ' + text_shadow_color +', 0 1px ' + text_shadow_color + ' , 1px 0 ' + text_shadow_color + ', 0 -1px ' + text_shadow_color +';';
            }else{
                return nameColor;
            }
            //return nameColor +'; text-shadow: -1px 0 ' + text_shadow_color +', 0 1px ' + text_shadow_color + ' , 1px 0 ' + text_shadow_color + ', 0 -1px ' + text_shadow_color +';';
            //return nameColor + '; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;';
            //text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
            //background: rgba(255, 255, 255, .3)
        }else if(!dark && color.isLight()){
            return nameColor + '; background: rgba(26, 26, 26, .3)'
        }else{
           return nameColor + ';'; 
        }
      }

      highlightMessagesByKeywords(keywords: string[], message: string){
       let messageArray: string[] = message.split(' ');
       for(let entry of messageArray){
           for(let keyword of keywords){
                if(entry.toLocaleLowerCase() === keyword.toLocaleLowerCase()){
                    console.log(entry.toLocaleLowerCase + ' ==? ' + keyword.toLocaleLowerCase);
                    return true;
                }
           }
       }
       return false;
      }

      generateInfoMessage(infoText: string, classattr: string, userstate: any, message: string){
        let chatDivContainer = document.createElement('div');
        let timeStampSpan = document.createElement('span');
        let infoSpan = document.createElement('span');
        
        let chatTimestamp = this.getTimeStamp();
        let infoMessage;
        //basic info like joins connects
        if(message == null && userstate == null){
            infoMessage  = '[###  ' + infoText + '  ###]';
        }else if(message == null){//sub or resub without message
            infoMessage  = '[###  '  + userstate['display-name'] + ' ' + infoText + '  ###]';
        }else{//sub or resub with message
            infoMessage = '[### ' + userstate['display-name'] + ' ' + infoText + ' - ' + this.formatEmotes(message, userstate.emotes) + ' ###]'
        }
        
       
        chatDivContainer.setAttribute('class', 'user-chat-message');
        timeStampSpan.setAttribute('class','user-chat-message-timestamp');
        infoSpan.setAttribute('class','message ' + classattr);
        
        infoSpan.innerHTML = infoMessage;
        timeStampSpan.innerHTML = chatTimestamp;
        chatDivContainer.appendChild(timeStampSpan);
        
        chatDivContainer.appendChild(infoSpan);
        console.log(chatDivContainer);
        return chatDivContainer;
      }

      scrollChat(){
        const chatDiv = document.getElementById("chatWindow");
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
}

/*

function formatEmotes(text, emotes) {
        var splitText = text.split('');
        for(var i in emotes) {
            var e = emotes[i];
            for(var j in e) {
                var mote = e[j];
                if(typeof mote == 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    var length =  mote[1] - mote[0],
                        empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
                }
            }
        }
        return splitText.join('');
    }
*/