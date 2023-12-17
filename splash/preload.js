const { ipcRenderer } = require("electron")

document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.invoke("appVer").then((version) => {
        document.getElementById("appVer").innerText = `Penguin Client v${version} `;
    });
    ipcRenderer.on('status', (e, v) => {
        document.getElementById("stat").innerText = v;
    })
})