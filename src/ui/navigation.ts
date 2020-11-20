
 let chatWindow = document.getElementById('chatWindow');
 let chatInput = document.getElementById('chatInput');
 let settingsDiv = document.getElementById('settingsDiv');
 let lotteryDiv = document.getElementById('lotteryDiv');
 let chatSettingsDiv = document.getElementById('chatSettingsDiv');
 let chatGridDiv = document.getElementById('chatGridDiv');
 let ripCounterDiv = document.getElementById('ripcounterDiv');

export class MainNavigation{

    constructor(){
        let chatWindow = document.getElementById('chatWindow');
        let chatInput = document.getElementById('chatInput');
        let settingsDiv = document.getElementById('settingsDiv');
        let lotteryDiv = document.getElementById('lotteryDiv');
        let chatSettingsDiv = document.getElementById('chatSettingsDiv');
        let chatGridDiv = document.getElementById('chatGridDiv');
        //const chatGridDiv = document.getElementById(chat-grid

        document.getElementById("navChat").addEventListener ("click", (e:Event) => this.navigationSelectWindow('navChat'));
        document.getElementById("navDashbaord").addEventListener ("click", (e:Event) => this.navigationSelectWindow('navDashbaord'));
        document.getElementById("navRaffle").addEventListener ("click", (e:Event) => this.navigationSelectWindow('navRaffle'));
        document.getElementById("navCommands").addEventListener ("click", (e:Event) => this.navigationSelectWindow('navCommands'));
        document.getElementById("navSettings").addEventListener ("click", (e:Event) => this.navigationSelectWindow('navSettings'));
        document.getElementById("navRipcounter").addEventListener ("click", (e:Event) => this.navigationSelectWindow('navRipcounter'));
    }

    navigationSelectWindow(id: string){

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
            //chatWindow.style.display = '';
            //chatInput.style.display = '';
            chatGridDiv.style.display ='';
            ripCounterDiv.style.display ='none';
        }else if(id == 'navSettings'){
            lotteryDiv.style.display = 'none';
            settingsDiv.style.display = '';
            //chatWindow.style.display = 'none';
            //chatInput.style.display = 'none';
            chatGridDiv.style.display ='none';
            ripCounterDiv.style.display ='none';
        }else if(id == 'navRaffle'){
            lotteryDiv.style.display = '';
            settingsDiv.style.display = 'none';
            //chatWindow.style.display = 'none';
            //chatInput.style.display = 'none';
            chatGridDiv.style.display ='none';
            ripCounterDiv.style.display ='none';
        }else if(id == 'navRipcounter'){
            lotteryDiv.style.display = 'none';
            settingsDiv.style.display = 'none';
            chatGridDiv.style.display ='none';
            ripCounterDiv.style.display ='';
        }
    
        
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

