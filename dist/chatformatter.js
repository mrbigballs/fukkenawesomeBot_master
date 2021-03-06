"use strict";
exports.__esModule = true;
exports.ChatMessageFormatter = void 0;
var tinycolor = require("tinycolor2");
//const Store = require('electron-store');
var storelocal_1 = require("./storelocal");
var store = new storelocal_1.StoreLocal().getLocalStore();
var ChatMessageFormatter = /** @class */ (function () {
    function ChatMessageFormatter() {
        this.chatcolors = new Map();
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
    ChatMessageFormatter.prototype.formatGlobalBadges = function (badges) {
        var badgespan = document.createElement('span');
        try {
            if (badges != null) {
                //console.log(JSON.stringify(badges));
                var glob_badges = JSON.parse(store.get('global_badges'));
                //console.log('glob : ' + JSON.stringify(glob_badges));
                var channel_badges = JSON.parse(store.get('channel_badges'));
                //console.log('glob : ' + JSON.stringify(channel_badges));
                //console.log('no idea ' + glob_badges.badge_sets.moderator.versions[1].image_url_4x);
                for (var key in badges) {
                    var badgeimg = document.createElement('img');
                    badgeimg.setAttribute('class', 'badges');
                    //console.log('badgename: ' + i + ' value' + glob_badges.i);
                    if (badges.hasOwnProperty(key)) {
                        //console.log(key + " -> " + badges[key]);
                        if (key != 'subscriber') {
                            console.log(key + " -> " + badges[key]);
                            var badge_url = glob_badges.badge_sets[key].versions[badges[key]].image_url_1x;
                            badgeimg.setAttribute('src', badge_url);
                            badgeimg.setAttribute('title', glob_badges.badge_sets[key].versions[badges[key]].description);
                            badgespan.appendChild(badgeimg);
                        }
                        else {
                            console.log(key + " -> " + badges[key]);
                            var badge_url = channel_badges.badge_sets[key].versions[badges[key]].image_url_1x;
                            badgeimg.setAttribute('src', badge_url);
                            badgeimg.setAttribute('title', channel_badges.badge_sets[key].versions[badges[key]].description);
                            badgespan.appendChild(badgeimg);
                        }
                    }
                }
                console.log(badgespan);
                return badgespan;
            }
            else {
                return badgespan;
            }
        }
        catch (e) {
            console.log(e.message);
            return badgespan;
        }
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
    ChatMessageFormatter.prototype.generateChatMessageElement = function (userstate, message, keywords, type) {
        var chatDivContainer = document.createElement('div');
        var timeStampSpan = document.createElement('span');
        var typeSpan = document.createElement('span');
        var chatUsernameSpan = document.createElement('span');
        var chatMessageSpan = document.createElement('span');
        var chatMessageTrennerSpan = document.createElement('span');
        var userIdSpan = document.createElement('span');
        var userTypeSpan = document.createElement('span');
        var chatMessage;
        var chatTimestamp = this.getTimeStamp();
        var badgesSpan = this.formatGlobalBadges(userstate.badges);
        var displayName = userstate['display-name'];
        var userId = userstate['user-id'];
        var userType = userstate['user-type'];
        var str = JSON.stringify(userstate);
        //console.log("id???: " + userId + ' ' + userType + ' ' + str);
        var displaNameColor;
        if (userstate.color == null) {
            //console.log(store.get(displayName+'_color'));
            //store.has(displayName+'_color') ||
            if (this.chatcolors.has(displayName + '_color')) {
                //displaNameColor = store.get(displayName+'_color');
                displaNameColor = this.chatcolors.get(displayName + '_color');
                console.log('temporary ' + this.chatcolors.get(displayName + '_color'));
            }
            else {
                var user_temp_color = this.getRandomColor();
                //store.set(displayName+'_color', user_temp_color);
                this.chatcolors.set(displayName + '_color', user_temp_color);
                //console.log(store.get(displayName+'_color'));
                displaNameColor = user_temp_color;
            }
        }
        else {
            displaNameColor = userstate.color;
        }
        //displaNameColor = userstate.color == null ? this.getRandomColor() : userstate.color;
        var formattedMessage = this.formatEmotes(message, userstate.emotes);
        if (this.highlightMessagesByKeywords(keywords, message)) {
            chatMessageSpan.style.background = 'rgba(102, 0, 0, 0.5)';
        }
        //whisper check
        if (store.get('chat_settings_show_whisper') == 'true') {
            chatDivContainer.setAttribute('class', 'user-chat-message ' + type);
        }
        else {
            chatDivContainer.setAttribute('class', 'user-chat-message ' + type + ' none-show');
        }
        timeStampSpan.setAttribute('class', 'user-chat-message-timestamp');
        timeStampSpan.innerHTML = chatTimestamp;
        chatUsernameSpan.setAttribute('class', 'task context-menu-one user-chat-message-username');
        chatUsernameSpan.setAttribute('style', 'color:' + this.getNameColor(displaNameColor, true));
        chatUsernameSpan.innerHTML = '' + displayName;
        chatMessageSpan.setAttribute('class', 'message');
        chatMessageSpan.innerHTML = formattedMessage;
        chatMessageTrennerSpan.innerHTML = ':';
        //userTypeSpan
        userIdSpan.setAttribute('class', 'userId');
        userIdSpan.innerHTML = userId;
        userIdSpan.style.display = 'none';
        chatDivContainer.appendChild(timeStampSpan);
        if (type === 'whisper' || type === 'action') {
            typeSpan.innerHTML = '[' + type.toLocaleUpperCase() + ']';
            chatDivContainer.appendChild(typeSpan);
        }
        chatDivContainer.appendChild(badgesSpan);
        chatDivContainer.appendChild(chatUsernameSpan);
        chatUsernameSpan.appendChild(userIdSpan);
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
        var text_shadow_color = color.complement().toHexString();
        if (dark && color.isDark()) {
            if (store.get('chat_settings_outlines') == 'white') {
                return nameColor + '; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;';
            }
            else if (store.get('chat_settings_outlines') == 'dynamic') {
                return nameColor + '; text-shadow: -1px 0 ' + text_shadow_color + ', 0 1px ' + text_shadow_color + ' , 1px 0 ' + text_shadow_color + ', 0 -1px ' + text_shadow_color + ';';
            }
            else {
                return nameColor;
            }
            //return nameColor +'; text-shadow: -1px 0 ' + text_shadow_color +', 0 1px ' + text_shadow_color + ' , 1px 0 ' + text_shadow_color + ', 0 -1px ' + text_shadow_color +';';
            //return nameColor + '; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;';
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
    ChatMessageFormatter.prototype.generateInfoMessage = function (infoText, classattr, userstate, message) {
        var chatDivContainer = document.createElement('div');
        var timeStampSpan = document.createElement('span');
        var infoSpan = document.createElement('span');
        var chatTimestamp = this.getTimeStamp();
        var infoMessage;
        //basic info like joins connects
        if (message == null && userstate == null) {
            infoMessage = '[###  ' + infoText + '  ###]';
        }
        else if (message == null) { //sub or resub without message
            infoMessage = '[###  ' + userstate['display-name'] + ' ' + infoText + '  ###]';
        }
        else { //sub or resub with message
            infoMessage = '[### ' + userstate['display-name'] + ' ' + infoText + ' - ' + this.formatEmotes(message, userstate.emotes) + ' ###]';
        }
        chatDivContainer.setAttribute('class', 'user-chat-message');
        timeStampSpan.setAttribute('class', 'user-chat-message-timestamp');
        infoSpan.setAttribute('class', 'message ' + classattr);
        infoSpan.innerHTML = infoMessage;
        timeStampSpan.innerHTML = chatTimestamp;
        chatDivContainer.appendChild(timeStampSpan);
        chatDivContainer.appendChild(infoSpan);
        console.log(chatDivContainer);
        return chatDivContainer;
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