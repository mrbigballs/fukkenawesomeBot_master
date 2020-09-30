const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const settingsDiv = document.getElementById('settingsDiv');
const lotteryDiv = document.getElementById('lotteryDiv');
const chatSettingsDiv = document.getElementById('chatSettingsDiv');
const chatGridDiv = document.getElementById('chatGridDiv');

document.getElementById("navChat").addEventListener ("click", (e:Event) => navigationSelectWindow('navChat'));
document.getElementById("navDashbaord").addEventListener ("click", (e:Event) => navigationSelectWindow('navDashbaord'));
document.getElementById("navRaffle").addEventListener ("click", (e:Event) => navigationSelectWindow('navRaffle'));
document.getElementById("navCommands").addEventListener ("click", (e:Event) => navigationSelectWindow('navCommands'));
document.getElementById("navSettings").addEventListener ("click", (e:Event) => navigationSelectWindow('navSettings'));




function navigationSelectWindow(id: string){

    var alldescendantsNormal = document.getElementsByClassName('navigationNormal')[0].getElementsByTagName('a');
    //var alldescendantsSmall = document.getElementsByClassName('navigationSmall')[0].getElementsByTagName('a');

    for (var i = 0; i < alldescendantsNormal.length; i++) {
        alldescendantsNormal[i].classList.remove('active');
        //alldescendantsSmall[i].classList.remove('active');
    }

    let clickedElement = document.getElementById(id);
    clickedElement.classList.add('active');

    if(id == 'navChat'){
        //console.log('sdlkfjsldkjfkljsd');
        lotteryDiv.style.display = 'none';
        settingsDiv.style.display = 'none';
        chatWindow.style.display = '';
        chatInput.style.display = '';
    }else if(id == 'navSettings'){
        lotteryDiv.style.display = 'none';
        settingsDiv.style.display = '';
        chatWindow.style.display = 'none';
        chatInput.style.display = 'none';
    }else if(id == 'navRaffle'){
        lotteryDiv.style.display = '';
        settingsDiv.style.display = 'none';
        chatWindow.style.display = 'none';
        chatInput.style.display = 'none';
    }

    
}


//chat options button
//document.getElementById("chat-settings-button").addEventListener ("click", (e:Event) => toggleChatSettings());

function toggleChatSettings(){
    if(chatSettingsDiv.style.display == 'none'){
        chatSettingsDiv.style.display = '';
        chatWindow.style.display = 'none';
    }else{
        chatSettingsDiv.style.display = 'none';
        chatWindow.style.display = '';
    }
}

