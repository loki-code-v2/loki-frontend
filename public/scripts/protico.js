var frame = document.getElementById("proticoFrame");
var bObj = document.getElementById("frameBoxHandler");
bObj.onclick = function () {
  if (document.getElementById("proticoFrame").style.display === "block") {
    document.getElementById("proticoFrame").style.display = "none";
    document.getElementById("frameBoxHandler").style.width = "auto";
    document.getElementById("frameBoxHandler").innerHTML =
      "Loki.code&nbsp;Lobby&nbsp;💬";
    //// endline;
  } else {
    document.getElementById("proticoFrame").style.display = "block";
    document.getElementById("proticoFrame").src =
      "https://main.protico.io/protico?roomUrl=" + window.location.href;
    document.getElementById("frameBoxHandler").style.width = "70px";
    document.getElementById("frameBoxHandler").innerHTML = "Exit&nbsp;👋";
    //// endline;
  }
};
