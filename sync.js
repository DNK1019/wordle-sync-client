var gameShadowRoot = document.getElementsByTagName("game-app")[0].shadowRoot;
var server = "www.drewkrause.dev";

var div = document.createElement("div");
div.classList.add("setting");

var settingText = document.createElement("div");
settingText.className = "text";
var settingButtons = document.createElement("div");
settingButtons.className = "control";

var title = document.createElement("div");
title.className = "title";
title.innerHTML = "Sync";

var desc = document.createElement("div");
desc.className = "description";
desc.innerHTML = "Synchronize stats with a 3rd party server";

var user = document.createElement("input");
user.type = "password"

var upButton = document.createElement("button");
upButton.style.border = "none";
upButton.style.background = "none";
upButton.style.padding = "0 4px"
upButton.style.verticalAlign = "middle";
upButton.innerHTML = "<svg width=\"32px\" height=\"32px\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M11 4a4 4 0 0 0-3.999 4.102 1 1 0 0 1-.75.992A3.002 3.002 0 0 0 7 15h1a1 1 0 1 1 0 2H7a5 5 0 0 1-1.97-9.596 6 6 0 0 1 11.169-2.4A6 6 0 0 1 16 17a1 1 0 1 1 0-2 4 4 0 1 0-.328-7.987 1 1 0 0 1-.999-.6A4.001 4.001 0 0 0 11 4zm.293 5.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1-1.414 1.414L13 12.414V20a1 1 0 1 1-2 0v-7.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2z\" fill=\"var(--color-tone-3)\"/></svg>";

// Ctrl + C, Ctrl + V
var downButton = upButton.cloneNode();
downButton.innerHTML = "<svg width=\"32px\" height=\"32px\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M11 4a4 4 0 0 0-3.999 4.102 1 1 0 0 1-.75.992A3.002 3.002 0 0 0 7 15h1a1 1 0 1 1 0 2H7a5 5 0 0 1-1.97-9.596 6 6 0 0 1 11.169-2.4A6 6 0 0 1 16 17a1 1 0 1 1 0-2 4 4 0 1 0-.328-7.987 1 1 0 0 1-.999-.6A4.001 4.001 0 0 0 11 4zm1 6a1 1 0 0 1 1 1v7.586l.293-.293a1 1 0 0 1 1.414 1.414l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414l.293.293V11a1 1 0 0 1 1-1z\" fill=\"var(--color-tone-3)\"/></svg>";

settingButtons.appendChild(user);
settingButtons.appendChild(upButton);
settingButtons.appendChild(downButton);

settingText.appendChild(title);
settingText.appendChild(desc);
div.appendChild(settingText);
div.appendChild(settingButtons);

var game = gameShadowRoot.getElementById("game");

gameShadowRoot.getElementById("settings-button").addEventListener("click", function() {
    // Structure: game-settings > shadowRoot > div.sections > 1st div.section 
    var settings = game.getElementsByTagName("game-settings")[0].shadowRoot.children[1].children[0];
    settings.appendChild(div);
});

upButton.addEventListener("click", function() {
    if (!user.value) return;
    var url = "https://" + server + ":3078/upsync";

    var cleanedUser = user.value.replace(/\W/g, '');
    var params = JSON.stringify({
        "user": cleanedUser,
        "data": {
            "stats": JSON.parse(localStorage.getItem("statistics")),
            "game": JSON.parse(localStorage.getItem("gameState"))
        }
    });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.send(params);
    console.log(JSON.parse(params));
});

downButton.addEventListener("click", function() {
    if (!user.value) return;
    var cleanedUser = user.value.replace(/\W/g, '');
    var params = JSON.stringify({
        "user": cleanedUser
    });

    var url = "https://" + server + ":3078/downsync";
    var xhr = new XMLHttpRequest();

    xhr.onload = () => {
        var response = JSON.parse(xhr.responseText);
        
        
        // log response
        console.log(response);
        if (response.stats) localStorage.setItem("statistics", JSON.stringify(response.stats));
        if (response.game) localStorage.setItem("gameState", JSON.stringify(response.game));
    };

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.send(params);
});