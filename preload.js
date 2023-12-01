const { ipcRenderer } = require('electron');
const path = require('path');
//ESCを受け取る
ipcRenderer.on('ESC', () => {
    document.exitPointerLock();
});

function cssInject() {
    let cssIn = `<link rel="stylesheet" href="slug://${path.join(__dirname, 'impact.css')}">`
    document.head.insertAdjacentHTML('beforeend', cssIn);
}
function title() {
    document.getElementsByTagName(title)[0].innerText = "いんぱくとの煮込みカレー"
}
document.addEventListener('DOMContentLoaded', () => {
    cssInject()
    title()
})
window.closeClient = () => {
    ipcRenderer.send('exitClient');
};

// #returnHolderが生成されたときに実行される関数
function onReturnHolderGenerated() {
    console.log("#returnHolderが生成されました!");
    document.getElementById("returnHolder").setAttribute("onclick", "window.location.href='https://krunker.io/'")
}

// DOMContentLoadedイベントが発生したときに実行されるコード
document.addEventListener("DOMContentLoaded", function () {
    // MutationObserverを使用して、DOMの変更を監視する
    const observer = new MutationObserver(function (mutationsList) {
        // 変更があったらmutationが渡されるので、それぞれのmutationをチェックする
        for (let mutation of mutationsList) {
            // #returnHolderが生成されたかどうかを確認する
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach(function (node) {
                    // 追加されたノードが#returnHolderであれば関数を実行する
                    if (node.id === "returnHolder") {
                        onReturnHolderGenerated();
                    }
                });
            }
        }
    });

    // 監視する対象の要素を取得し、オブザーバーに追加する
    const targetNode = document.body; // 監視する範囲をbodyとする例
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
});