"use strict";
exports.__esModule = true;
var tinycolor = require("tinycolor2");
var ChatMessageFormatter = /** @class */ (function () {
    function ChatMessageFormatter() {
    }
    ChatMessageFormatter.prototype.formatEmotes = function (text, emotes) {
        var splitText = text.split('');
        for (var i in emotes) {
            var e = emotes[i];
            for (var j in e) {
                var mote = e[j];
                if (typeof mote == 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    var length_1 = mote[1] - mote[0], empty = Array.apply(null, new Array(length_1 + 1)).map(function () { return ''; });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
                }
            }
        }
        return splitText.join('');
    };
    ChatMessageFormatter.prototype.getTimeStamp = function () {
        var date = new Date();
        var datetext = '[ ' + date.toTimeString().split(' ')[0].split(':')[0] + ':' + date.toTimeString().split(' ')[0].split(':')[1] + ' ]';
        return datetext;
    };
    ChatMessageFormatter.prototype.generateChatMessage = function (userstate, message) {
        var chatMessage;
        var chatTimestamp = this.getTimeStamp();
        var displayName = userstate['display-name'];
        var displaNameColor = userstate.color;
        var formattedMessage = this.formatEmotes(message, userstate.emotes);
        chatMessage += '<div class=\"user-chat-message\"><span class=\"user-chat-message-timestamp\">' + chatTimestamp + '</span>'
            + '<span class=\"context-menu-one user-chat-message-username\" style=\" + displaNameColor + \">' + displayName + '</span>'
            + '<span>:</span>'
            + '<span class=\"message\">' + formattedMessage + '</span></div>';
        return chatMessage;
    };
    ChatMessageFormatter.prototype.generateChatMessageElement = function (userstate, message, keywords) {
        var chatDivContainer = document.createElement('div');
        var timeStampSpan = document.createElement('span');
        var chatUsernameSpan = document.createElement('span');
        var chatMessageSpan = document.createElement('span');
        var chatMessageTrennerSpan = document.createElement('span');
        var chatMessage;
        var chatTimestamp = this.getTimeStamp();
        var displayName = userstate['display-name'];
        var displaNameColor = userstate.color == null ? this.getRandomColor() : userstate.color;
        var formattedMessage = this.formatEmotes(message, userstate.emotes);
        if (this.highlightMessagesByKeywords(keywords, message)) {
            chatMessageSpan.style.background = 'rgba(102, 0, 0, 0.5)';
        }
        chatDivContainer.setAttribute('class', 'user-chat-message');
        timeStampSpan.setAttribute('class', 'user-chat-message-timestamp');
        timeStampSpan.innerHTML = chatTimestamp;
        chatUsernameSpan.setAttribute('class', 'task context-menu-one user-chat-message-username');
        chatUsernameSpan.setAttribute('style', 'color:' + this.getNameColor(displaNameColor, true));
        chatUsernameSpan.innerHTML = '' + displayName;
        chatMessageSpan.setAttribute('class', 'message');
        chatMessageSpan.innerHTML = formattedMessage;
        chatMessageTrennerSpan.innerHTML = ':';
        chatDivContainer.appendChild(timeStampSpan);
        chatDivContainer.appendChild(chatUsernameSpan);
        chatDivContainer.appendChild(chatMessageTrennerSpan);
        chatDivContainer.appendChild(chatMessageSpan);
        console.log(chatDivContainer);
        return chatDivContainer;
    };
    ChatMessageFormatter.prototype.getRandomColor = function () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    ChatMessageFormatter.prototype.getNameColor = function (nameColor, dark) {
        var color = new tinycolor(nameColor);
        if (dark && color.isDark()) {
            return nameColor + '; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;';
            //text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
            //background: rgba(255, 255, 255, .3)
        }
        else if (!dark && color.isLight()) {
            return nameColor + '; background: rgba(26, 26, 26, .3)';
        }
        else {
            return nameColor + ';';
        }
    };
    ChatMessageFormatter.prototype.highlightMessagesByKeywords = function (keywords, message) {
        var messageArray = message.split(' ');
        for (var _i = 0, messageArray_1 = messageArray; _i < messageArray_1.length; _i++) {
            var entry = messageArray_1[_i];
            for (var _a = 0, keywords_1 = keywords; _a < keywords_1.length; _a++) {
                var keyword = keywords_1[_a];
                if (entry.toLocaleLowerCase() === keyword.toLocaleLowerCase()) {
                    console.log(entry.toLocaleLowerCase + ' ==? ' + keyword.toLocaleLowerCase);
                    return true;
                }
            }
        }
        return false;
    };
    ChatMessageFormatter.prototype.scrollChat = function () {
        var chatDiv = document.getElementById("chatWindow");
        chatDiv.scrollTop = chatDiv.scrollHeight;
    };
    return ChatMessageFormatter;
}());
exports.ChatMessageFormatter = ChatMessageFormatter;
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
//# sourceMappingURL=chatformatter.js.map