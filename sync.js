var gameShadowRoot = document.getElementsByTagName("game-app")[0].shadowRoot;
var server = "www.drewkrause.dev";

// I hate NYT, give back old Wordle!
const nyt = document.location.hostname == "www.nytimes.com";
const statsStorage = nyt ? "nyt-wordle-statistics" : "statistics";
const gameStorage = nyt ? "nyt-wordle-state" : "gameState";

var userDiv = document.createElement("div");
userDiv.classList.add("setting");

var autoUpload = JSON.parse(localStorage.getItem("autoUpload"));

// =============================
// I DO NOT UNDERSTAND THIS CODE
// =============================

// Create title and description
var settingText = document.createElement("div");
settingText.className = "text";
settingText.innerHTML = "<div class=\"title\">User</div><div class=\"description\">Password to sync devices with server.</div>";

userDiv.appendChild(settingText);

// Create div for inputs
var settingButtons = document.createElement("div");
settingButtons.className = "control";

// Add div for inputs to main div
userDiv.appendChild(settingButtons);

// Create new catagory for sync buttons
var syncButtonsDiv = userDiv.cloneNode(true)

// Create new catagory for sync buttons
var autoUploadDiv = userDiv.cloneNode(true)

// Create textbox for user
var user = document.createElement("input");
user.type = "password"
user.style.verticalAlign = "middle";
user.style.borderRadius = "999px";
user.style.padding = "1px 5px";
user.style.border = "solid var(--color-tone-3)";
user.style.outline = "none";
user.onfocus = () => user.style.borderColor = "var(--color-correct)";
user.onblur = () => user.style.borderColor = "var(--color-tone-3)";
user.value = localStorage.getItem("user");
settingButtons.appendChild(user);

// Create upload button
var upButton = document.createElement("button");
// Theme upload button
upButton.style.border = "none";
upButton.style.background = "none";
upButton.style.padding = "0 4px"
upButton.style.verticalAlign = "middle";
upButton.style.cursor = "pointer";
// Add icon to button
upButton.innerHTML = "<svg width=\"32px\" height=\"32px\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M11 4a4 4 0 0 0-3.999 4.102 1 1 0 0 1-.75.992A3.002 3.002 0 0 0 7 15h1a1 1 0 1 1 0 2H7a5 5 0 0 1-1.97-9.596 6 6 0 0 1 11.169-2.4A6 6 0 0 1 16 17a1 1 0 1 1 0-2 4 4 0 1 0-.328-7.987 1 1 0 0 1-.999-.6A4.001 4.001 0 0 0 11 4zm.293 5.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1-1.414 1.414L13 12.414V20a1 1 0 1 1-2 0v-7.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2z\" fill=\"var(--color-tone-3)\"/></svg>";

// Ctrl + C, Ctrl + V
var downButton = upButton.cloneNode();
downButton.innerHTML = "<svg width=\"32px\" height=\"32px\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M11 4a4 4 0 0 0-3.999 4.102 1 1 0 0 1-.75.992A3.002 3.002 0 0 0 7 15h1a1 1 0 1 1 0 2H7a5 5 0 0 1-1.97-9.596 6 6 0 0 1 11.169-2.4A6 6 0 0 1 16 17a1 1 0 1 1 0-2 4 4 0 1 0-.328-7.987 1 1 0 0 1-.999-.6A4.001 4.001 0 0 0 11 4zm1 6a1 1 0 0 1 1 1v7.586l.293-.293a1 1 0 0 1 1.414 1.414l-2 2a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414l.293.293V11a1 1 0 0 1 1-1z\" fill=\"var(--color-tone-3)\"/></svg>";

// Add upload and download buttons to 2nd div
syncButtonsDiv.children[1].appendChild(upButton);
syncButtonsDiv.children[1].appendChild(downButton);
// Set title and description of second div
syncButtonsDiv.children[0].innerHTML = "<div class=\"title\">Sync</div><div class=\"description\">Sync your devices with the server.</div>";

var autoUploadSwitch = document.createElement("game-switch");
autoUploadSwitch.setAttribute("id", "auto-upload");
autoUploadSwitch.setAttribute("name", "auto-upload");
if (autoUpload) autoUploadSwitch.setAttribute("checked", "");

autoUploadDiv.children[0].innerHTML = "<div class=\"title\">Auto Upload</div><div class=\"description\">Automatically upload on game completion.</div>";
autoUploadDiv.children[1].appendChild(autoUploadSwitch);

var game = gameShadowRoot.getElementById("game");

// ========================
// Begin understanding code 
// ========================

gameShadowRoot.getElementById("settings-button").addEventListener("click", function() {
    // Structure: game-settings > shadowRoot > div.sections > 1st div.section 
    var settings = game.getElementsByTagName("game-settings")[0].shadowRoot.children[1].children[0];

    // Remove duplicate switches
    if (autoUploadSwitch.shadowRoot.childElementCount) {
        autoUploadSwitch.shadowRoot.children[1].remove();
        autoUploadSwitch.shadowRoot.children[0].remove(); 
    }
    
    settings.appendChild(userDiv);
    settings.appendChild(syncButtonsDiv);
    settings.appendChild(autoUploadDiv);
    
});

function upsync(silent) {
    var cleanedUser = user.value.replace(/\W/g, '');
    if (!cleanedUser) return;
    localStorage.setItem("user", user.value);
    var url = "https://" + server + ":3078/upsync";

    var params = JSON.stringify({
        "user": cleanedUser,
        "data": {
            "stats": JSON.parse(localStorage.getItem(statsStorage)),
            "game": JSON.parse(localStorage.getItem(gameStorage))
        }
    });
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    if(!silent) {
        xhr.onload = () => {
            wordleToast(xhr.status == 200 ? "Successfully uploaded data." : "Failed to upload data.", 0, true);
        }
    }

    xhr.send(params);
    console.log(JSON.parse(params));
}

upButton.addEventListener("click", function () { upsync(); });

downButton.addEventListener("click", function() {
    var cleanedUser = user.value.replace(/\W/g, ''); // Remove all non-alphanumeric characters (stolen from stackoverflow [how did copilot know i was going to type this?])
    if (!cleanedUser) return;
    localStorage.setItem("user", cleanedUser);
    var params = JSON.stringify({
        "user": cleanedUser
    });

    var url = "https://" + server + ":3078/downsync";
    var xhr = new XMLHttpRequest();

    xhr.onload = () => {
        if (xhr.status != 200) return (wordleToast("Failed to download data.", 0, true));
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        if (response.stats) localStorage.setItem(statsStorage, JSON.stringify(response.stats));
        if (response.game) localStorage.setItem(gameStorage, JSON.stringify(response.game));
        wordleToast("Successfully downloaded data. Refreshing.", 0, true);
        window.location.reload();
    };

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.send(params);
});

// Rewrite of the toast function in Wordle
function wordleToast(text, duration, system) {
    var toast = document.createElement("game-toast");
    toast.setAttribute("text", text);
    if (duration) toast.setAttribute("duration", duration);
    gameShadowRoot.querySelector(system ? "#system-toaster" : "#game-toaster").prepend(toast);
}


game.addEventListener('game-last-tile-revealed-in-row', function () {
    if (JSON.parse(localStorage.getItem(statsStorage)).gameStatus != "IN_PROGRESS" && autoUpload) upsync(true);
});

gameShadowRoot.addEventListener("game-setting-change", function(a) {
    var s = a.detail,
    t = s.name,
    value = s.checked;
    console.log(t);
    switch(t) {
        case "auto-upload":
            localStorage.setItem("autoUpload", value);
            autoUpload = value;
    }
});
