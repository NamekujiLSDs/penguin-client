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

//Compの画面にModを追加
function compModGen() {
    let dom = `<div class="compMenBtnS" onmouseenter="SOUND.play(&quot;tick_0&quot;,.1)" onclick="playSelect(),showWindow(4)" style="background-color:#f5479b">
    <span class="material-icons" style="color:#fff;font-size:40px;vertical-align:middle;margin-bottom:12px">color_lens</span>
    </div>`
    let dom2 = `<div class="compMenBtnS" onmouseenter="SOUND.play(&quot;tick_0&quot;,.1)" onclick="playSelect(),showWindow(42)" style="background-color:#b447ff">
    <span class="material-icons" style="color:#fff;font-size:40px;vertical-align:middle;margin-bottom:12px">add_circle</span>
    </div>`
    document.getElementById('compBtnLst').insertAdjacentHTML('beforeend', dom);
    document.getElementById('compBtnLst').insertAdjacentHTML('afterBegin', dom2);

}
function checkElementExistence() {
    var element = document.getElementById('compBtnLst');
    if (element) {
        compModGen()
    }
}


// ページが読み込まれた時にcheckElementExistence関数を実行する
window.onload = checkElementExistence;

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