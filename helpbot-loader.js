(function () {

    const botFrame = document.createElement("iframe");

    botFrame.src = "helpbot.html";
    botFrame.title = "SeatScope HelpBot";

    botFrame.style.position = "fixed";
    botFrame.style.right = "0";
    botFrame.style.bottom = "0";
    botFrame.style.width = "430px";
    botFrame.style.height = "620px";
    botFrame.style.border = "none";
    botFrame.style.background = "transparent";
    botFrame.style.zIndex = "999999";

    document.body.appendChild(botFrame);

})();