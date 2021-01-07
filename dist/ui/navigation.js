"use strict";
exports.__esModule = true;
exports.MainNavigation = void 0;
var chatWindow = document.getElementById('chatWindow');
var chatInput = document.getElementById('chatInput');
var settingsDiv = document.getElementById('settingsDiv');
var lotteryDiv = document.getElementById('lotteryDiv');
var chatSettingsDiv = document.getElementById('chatSettingsDiv');
var chatGridDiv = document.getElementById('chatGridDiv');
var ripCounterDiv = document.getElementById('ripcounterDiv');
var MainNavigation = /** @class */ (function () {
    function MainNavigation() {
        var _this = this;
        var chatWindow = document.getElementById('chatWindow');
        var chatInput = document.getElementById('chatInput');
        var settingsDiv = document.getElementById('settingsDiv');
        var lotteryDiv = document.getElementById('lotteryDiv');
        var chatSettingsDiv = document.getElementById('chatSettingsDiv');
        var chatGridDiv = document.getElementById('chatGridDiv');
        //const chatGridDiv = document.getElementById(chat-grid
        document.getElementById("navChat").addEventListener("click", function (e) { return _this.navigationSelectWindow('navChat'); });
        document.getElementById("navDashbaord").addEventListener("click", function (e) { return _this.navigationSelectWindow('navDashbaord'); });
        document.getElementById("navRaffle").addEventListener("click", function (e) { return _this.navigationSelectWindow('navRaffle'); });
        document.getElementById("navCommands").addEventListener("click", function (e) { return _this.navigationSelectWindow('navCommands'); });
        document.getElementById("navSettings").addEventListener("click", function (e) { return _this.navigationSelectWindow('navSettings'); });
        document.getElementById("navRipcounter").addEventListener("click", function (e) { return _this.navigationSelectWindow('navRipcounter'); });
    }
    MainNavigation.prototype.navigationSelectWindow = function (id) {
        var alldescendantsNormal = document.getElementsByClassName('navigationNormal')[0].getElementsByTagName('a');
        //var alldescendantsSmall = document.getElementsByClassName('navigationSmall')[0].getElementsByTagName('a');
        for (var i = 0; i < alldescendantsNormal.length; i++) {
            alldescendantsNormal[i].classList.remove('active');
            //alldescendantsSmall[i].classList.remove('active');
        }
        var clickedElement = document.getElementById(id);
        clickedElement.classList.add('active');
        if (id == 'navChat') {
            //console.log('sdlkfjsldkjfkljsd');
            lotteryDiv.style.display = 'none';
            settingsDiv.style.display = 'none';
            //chatWindow.style.display = '';
            //chatInput.style.display = '';
            chatGridDiv.style.display = '';
            ripCounterDiv.style.display = 'none';
            //scroll chat on comming back to chat window
            this.scrollChat();
        }
        else if (id == 'navSettings') {
            lotteryDiv.style.display = 'none';
            settingsDiv.style.display = '';
            //chatWindow.style.display = 'none';
            //chatInput.style.display = 'none';
            chatGridDiv.style.display = 'none';
            ripCounterDiv.style.display = 'none';
        }
        else if (id == 'navRaffle') {
            lotteryDiv.style.display = '';
            settingsDiv.style.display = 'none';
            //chatWindow.style.display = 'none';
            //chatInput.style.display = 'none';
            chatGridDiv.style.display = 'none';
            ripCounterDiv.style.display = 'none';
        }
        else if (id == 'navRipcounter') {
            lotteryDiv.style.display = 'none';
            settingsDiv.style.display = 'none';
            chatGridDiv.style.display = 'none';
            ripCounterDiv.style.display = '';
        }
    };
    MainNavigation.prototype.scrollChat = function () {
        var chatDiv = document.getElementById("chatWindow");
        chatDiv.scrollTop = chatDiv.scrollHeight;
    };
    return MainNavigation;
}());
exports.MainNavigation = MainNavigation;
//chat options button
//document.getElementById("chat-settings-button").addEventListener ("click", (e:Event) => toggleChatSettings());
function toggleChatSettings() {
    if (chatSettingsDiv.style.display == 'none') {
        chatSettingsDiv.style.display = '';
        chatWindow.style.display = 'none';
    }
    else {
        chatSettingsDiv.style.display = 'none';
        chatWindow.style.display = '';
    }
}
//# sourceMappingURL=navigation.js.map