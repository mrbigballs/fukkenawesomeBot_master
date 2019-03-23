const tinycolor = require("tinycolor2");

export class ChatMessageFormatter{
    
  

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

    generateChatMessageElement(userstate: any, message: string, keywords: string[]){
        let chatDivContainer = document.createElement('div');
        let timeStampSpan = document.createElement('span');
        let chatUsernameSpan = document.createElement('span');
        let chatMessageSpan = document.createElement('span');
        let chatMessageTrennerSpan = document.createElement('span');
        let userIdSpan = document.createElement('span');
        let userTypeSpan = document.createElement('span');
        let chatMessage: string;
        let chatTimestamp = this.getTimeStamp();
        let displayName = userstate['display-name'];
        let userId = userstate['user-id'];
        let userType = userstate['user-type'];
        console.log("id???: " + userstate['user-id'] + ' ' + userType);
        let displaNameColor = userstate.color == null ? this.getRandomColor() : userstate.color;
        let formattedMessage = this.formatEmotes(message, userstate.emotes);
        if(this.highlightMessagesByKeywords(keywords, message)){
            chatMessageSpan.style.background = 'rgba(102, 0, 0, 0.5)';
        }
        chatDivContainer.setAttribute('class', 'user-chat-message');
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
        if(dark && color.isDark()){
            return nameColor + '; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;'
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