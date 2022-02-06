var gameShadowRoot = document.getElementsByTagName("game-app")[0].shadowRoot;
var server = "www.drewkrause.dev";

var userDiv = document.createElement("div");
userDiv.classList.add("setting");


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
var syncButtons = userDiv.cloneNode(true)

// Create textbox for user
var user = document.createElement("input");
user.type = "password"
user.style.verticalAlign = "middle";
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
syncButtons.children[1].appendChild(upButton);
syncButtons.children[1].appendChild(downButton);
// Set title and description of second div
syncButtons.children[0].innerHTML = "<div class=\"title\">Sync</div><div class=\"description\">Sync your devices with the server.</div>";

var game = gameShadowRoot.getElementById("game");

// ========================
// Begin understanding code 
// ========================

gameShadowRoot.getElementById("settings-button").addEventListener("click", function() {
    // Structure: game-settings > shadowRoot > div.sections > 1st div.section 
    var settings = game.getElementsByTagName("game-settings")[0].shadowRoot.children[1].children[0];
    settings.appendChild(userDiv);
    settings.appendChild(syncButtons);
});

upButton.addEventListener("click", function() {
    if (!user.value) return;
    localStorage.setItem("user", user.value);
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

    xhr.onload = () => {
        wordleToast(xhr.status == 200 ? "Successfully uploaded data." : "Failed to upload data.", 0, true);
    }

    xhr.send(params);
    console.log(JSON.parse(params));
});

downButton.addEventListener("click", function() {
    if (!user.value) return;
    localStorage.setItem("user", user.value);
    var cleanedUser = user.value.replace(/\W/g, ''); // Remove all non-alphanumeric characters (stolen from stackoverflow [how did copilot know i was going to type this?])
    var params = JSON.stringify({
        "user": cleanedUser
    });

    var url = "https://" + server + ":3078/downsync";
    var xhr = new XMLHttpRequest();

    xhr.onload = () => {
        if (xhr.status != 200) return (wordleToast("Failed to download data.", 0, true));
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        if (response.stats) localStorage.setItem("statistics", JSON.stringify(response.stats));
        if (response.game) localStorage.setItem("gameState", JSON.stringify(response.game));
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