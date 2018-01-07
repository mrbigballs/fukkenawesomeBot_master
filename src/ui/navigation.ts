const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const settingsDiv = document.getElementById('settingsDiv');

document.getElementById("navChat").addEventListener ("click", (e:Event) => navigationSelectWindow('navChat'));
document.getElementById("navDashbaord").addEventListener ("click", (e:Event) => navigationSelectWindow('navDashbaord'));
document.getElementById("navRaffle").addEventListener ("click", (e:Event) => navigationSelectWindow('navRaffle'));
document.getElementById("navCommands").addEventListener ("click", (e:Event) => navigationSelectWindow('navCommands'));
document.getElementById("navSettings").addEventListener ("click", (e:Event) => navigationSelectWindow('navSettings'));

function navigationSelectWindow(id: string){

    var alldescendantsNormal = document.getElementsByClassName('navigationNormal')[0].getElementsByTagName('a');
    var alldescendantsSmall = document.getElementsByClassName('navigationSmall')[0].getElementsByTagName('a');

    for (var i = 0; i < alldescendantsNormal.length; i++) {
        alldescendantsNormal[i].classList.remove('active');
        alldescendantsSmall[i].classList.remove('active');
    }

    let clickedElement = document.getElementById(id);
    clickedElement.classList.add('active');

    if(id == 'navChat'){
        console.log('sdlkfjsldkjfkljsd');
        settingsDiv.style.display = 'none';
        chatWindow.style.display = '';
        chatInput.style.display = '';
    }else if(id == 'navSettings'){
        settingsDiv.style.display = '';
        chatWindow.style.display = 'none';
        chatInput.style.display = 'none';
    }

    
}