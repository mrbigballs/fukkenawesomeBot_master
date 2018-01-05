var chatDiv = document.getElementById('chatDiv');
var settingsDiv = document.getElementById('settingsDiv');
document.getElementById("navChat").addEventListener("click", function (e) { return navigationSelectWindow('navChat'); });
document.getElementById("navDashbaord").addEventListener("click", function (e) { return navigationSelectWindow('navDashbaord'); });
document.getElementById("navRaffle").addEventListener("click", function (e) { return navigationSelectWindow('navRaffle'); });
document.getElementById("navCommands").addEventListener("click", function (e) { return navigationSelectWindow('navCommands'); });
function navigationSelectWindow(id) {
    var alldescendantsNormal = document.getElementsByClassName('navigationNormal')[0].getElementsByTagName('a');
    var alldescendantsSmall = document.getElementsByClassName('navigationSmall')[0].getElementsByTagName('a');
    for (var i = 0; i < alldescendantsNormal.length; i++) {
        alldescendantsNormal[i].classList.remove('active');
        alldescendantsSmall[i].classList.remove('active');
    }
    var clickedElement = document.getElementById(id);
    clickedElement.classList.add('active');
}
//# sourceMappingURL=navigation.js.map