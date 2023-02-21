const hostToKey = {
    'www.baidu.com': 'baidu',
    'www.google.*': 'google',
    'www.bing.com': 'bing',
    'cn.bing.com': 'cnbing',
};

function getHandler() {
    // const host = window.location.hostname;
    host = 'www.bilibili.s'
    let handlerKey = 'other';
    for (let key in hostToKey) {
        if (new RegExp('^' + key).test(host)) {
            handlerKey = hostToKey[key];
            break;
        }
    }
    return handlerKey;
}

console.log(getHandler())
