// ==UserScript==
// @name               多重搜索MultipleSearch
// @name:zh-CN         多重搜索
// @name:zh-TW         多重搜索
// @name:zh-HK         多重搜索
// @author             Cassius0924
// @namespace          MultipleSearch
// @version            0.4.0
// @description        携带搜索词快捷切换搜索引擎、视频网站或博客网站。Quickly switch between search engines, video sites or blog sites with search words.
// @description:zh-CN  携带搜索词快捷切换搜索引擎、视频网站或博客网站。
// @description:zh-TW  攜帶搜索詞快捷切換搜索引擎、視頻網站或博客網站。
// @description:zh-HK  攜帶搜索詞快捷切換搜索引擎、視頻網站或博客網站。
// @license            MIT
// @icon               https://i.imgur.com/oqVZgBY.png
// @match               https://www.bing.com/search*
// @match               https://www.baidu.com/s?*
// @match               https://www.google.com/search?*
// @grant               GM_setValue
// @grant               GM_getValue
// ==/UserScript==
(function () {
    //已经适配网页
    const handlers = {
        baidu: {
            //网页预处理
            preprocess: function () {
                let head = selectElement('#head');
                head.style = "height: 140px; transition:height 0.3s ease-in-out;";
                let div = createElement('div', 'ms-cover', 'background-color: white; height: 50px');
                let hw = selectElement('#head .head_wrapper');
                let u = selectElement('#u');
                let u1 = selectElement('#u1');
                let skt = selectElement('#head .search-keyboard-toast');
                div.appendChild(hw);
                div.appendChild(u);
                div.appendChild(u1);
                div.appendChild(skt);
                head.appendChild(div);
                selectElement('#s_tab').style = 'padding-top: 140px; transition: all 0.3s ease-in-out;';
                //TODO-1: 解决输入框无法使用快捷键的问题，难搞
            },
            //添加多重搜索组件
            addMSComponent: function () {
                let head = selectElement('#head');
                let div = createElement('div', 'ms-container', 'margin-left: 120px;');
                let css = "@media screen and (min-width: 1921px) { .ms-container { width: 1055px; margin: 0 auto !important;} }\n #ms-component .ms-dragging {opacity: 0.5; transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s}\n#ms-component .ms-crowded {transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s;}";
                let style = createElement("style", '', '', css);
                div.appendChild(style);
                let msComponent = makeMSComponent();
                msComponent.style = 'bottom: 8px; position: absolute;';
                div.appendChild(msComponent);
                head.appendChild(div);
                addShortcutKeys();
            },
            //添加滚动监听
            addScrollListener: function () {
                window.onscroll = function () {
                    let head = selectElement('#head');
                    let searchTab = selectElement('#s_tab');
                    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    if (scrollTop > 12) {
                        selectElement('.cr-title').style.marginTop = '20px';
                    }
                    if (scrollTop > 0) {
                        head.style.height = '103px';
                        searchTab.style.paddingTop = '115px';
                    } else {
                        head.style.height = '140px';
                        searchTab.style.paddingTop = '140px';
                    }
                    toggleMSComponent(scrollTop, 0, 0);
                    turnOffToggleSortMode()
                }
            },
            //切换排序模式预处理
            preToggleSortMode: function () {
                if (GM_getValue('sortMode') === 'off') {
                    selectElement('#head').style.height = '155px';
                    selectElement('#s_tab').style.paddingTop = '155px';
                } else {
                    selectElement('#head').style.height = '140px';
                    selectElement('#s_tab').style.paddingTop = '140px';

                }
            },
            //获取搜索内容
            getSearchContent: function () {
                return selectElement('#kw').value;
            }
        },
        google: {
            preprocess: function () {
                let bg = selectElement('.sfbg');
                setTimeout(() => {
                    bg.style = 'height:190px; z-index:-100;';
                    bg.style.transition = 'height 0.3s ease-in-out';
                }, 0);
                let dodTBe = selectElement('.dodTBe');
                dodTBe.style.height = '125px';
                dodTBe.style.transition = 'all, 0.3s ease-in-out';
            },
            addMSComponent: function () {
                let head = selectElement('.CvDJxb');
                head.style = "display:flex; flex-direction: column; justify-content: center;";
                let css = "#ms-component{--ms-margin:165px;margin-left: calc(var(--ms-margin) - 15px);}\n@media(prefers-color-scheme:light){#ms-component{background:#fff !important;}}\n@media(prefers-color-scheme:dark){.ms-item {background: #303134 !important; color:#e8eaed !important; box-shadow: none !important; box-sizing: content-box ;border: 1px solid rgb(95,99,104);}\n.ms-item svg path:nth-child(2){fill: #e8eaed}}\n@media (max-width: 1300px) {#ms-component{--ms-margin: 28px;}}\n@media (min-width: 1121px) and (max-width: 1300px) {#ms-component{--ms-margin:  calc((100vw - 1065px)/2);}}\n @media (min-width: 1459px) and (max-width: 1659px) {#ms-component{--ms-margin: calc(25vw + -200px);}}\n@media (min-width: 1659px) {#ms-component{--ms-margin: 215px;}}\n#ms-component .ms-dragging {opacity: 0.5; transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s}\n#ms-component .ms-crowded {transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s;} .pin{z-index: 1000}";
                let style = createElement("style", '', '', css);
                document.head.appendChild(style);
                let msComponent = makeMSComponent();
                msComponent.style = 'bottom: 8px; position: absolute; top: 60px;';
                head.appendChild(msComponent);
                addShortcutKeys();
            },
            addScrollListener: function () {
                window.onscroll = function () {
                    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    if (scrollTop > 120) {
                        selectElement('.sfbg').style.height = '135px';
                        selectElement('#ms-component').style.top = '52px';
                        selectElement('.dodTBe').style.height = '90px';
                    } else if (scrollTop <= 0) {
                        selectElement('.sfbg').style.height = '210px';
                        selectElement('.dodTBe').style.height = '125px';
                    } else {
                        selectElement('#ms-component').style.top = '60px';
                    }
                    toggleMSComponent(scrollTop, 120, 0);
                    turnOffToggleSortMode()
                }
            },
            preToggleSortMode: function () {
                if (GM_getValue('sortMode') === 'off') {
                    selectElement('.sfbg').style.height = '240px';
                    selectElement('.dodTBe').style.height = '140px';
                } else {
                    selectElement('.sfbg').style.height = '210px';
                    selectElement('.dodTBe').style.height = '125px';
                }
            },
            getSearchContent: function () {
                return selectElement('.i4ySpb ~ .gLFyf').value;
            }
        },
        bing: {
            preprocess: function () {
                let head = selectElement('#b_header');
                head.style = 'transform: translateY(-75px);z-index: 10; transition:all, 0.3s ease-in-out;';
                let content = selectElement('#b_content');
                content.style = 'position: relative;z-index:9; top: -70px; transition:top, 0.3s ease-in-out;';
                let searchBox = selectElement('#sb_form_q');
                searchBox.onfocus = () => {
                    selectElement('#ms-component').classList.remove('top');
                };
                searchBox.onblur = () => {
                    selectElement('#ms-component').classList.add('top');
                }
            },
            addMSComponent: function () {
                let head = selectElement('#b_header');
                let body = selectElement('.b_respl');
                let css = ".ms-dragging {opacity: 0.5; transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s} #ms-component .ms-crowded {transition: all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s;} .top{z-index:100} .pin{z-index: 1000;}";
                let style = createElement("style", '', '', css);
                document.head.appendChild(style);
                let msComponent = makeMSComponent();
                msComponent.classList.add('top');
                msComponent.style = 'position: sticky; top: 0; height: 0px; margin-top:75px; padding-left: 150px;';
                let scopeBar = selectElement('.b_scopebar');
                scopeBar.style = 'margin-top: 70px; transition:all, 0.3s ease-in-out;';
                body.insertBefore(msComponent, head);
                addShortcutKeys();
            },
            addScrollListener: function () {
                window.onscroll = function () {
                    let msComponent = selectElement('#ms-component');
                    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    if (scrollTop > 60) {
                        msComponent.style.paddingBlock = '10px';
                    }
                    if (scrollTop <= 130) {
                        msComponent.style.paddingBlock = '0px';
                    }
                    if (scrollTop > 110) {
                        msComponent.style.height = '30px';
                        msComponent.style.boxShadow = '0 2px 10px 0 rgb(0 0 0 / 10%)';
                    }
                    if (scrollTop <= 140) {
                        msComponent.style.height = '0px';
                        msComponent.style.boxShadow = '';
                    }
                    toggleMSComponent(scrollTop, 70, 70);
                    turnOffToggleSortMode()
                }
            },
            preToggleSortMode: function () {
                let msComponent = selectElement('#ms-component');
                let scopeBar = selectElement('.b_scopebar');
                if (GM_getValue('sortMode') === 'off') {
                    scopeBar.style.marginTop = '85px';
                } else {
                    msComponent.style.marginTop = '75px';
                    scopeBar.style.marginTop = '70px';
                }
            },
            getSearchContent: function () {
                return selectElement('#sb_form_q').value;
            }
        },
        cnbing: {   //TODO-2: 中国版bing
            preprocess: function () {

            },
            addMSComponent: function () {

            },
            addScrollListener: function () {

            },
            preToggleSortMode: function () {

            },
            getSearchContent: function () {

            },
        }

    }

    const hostToHandler = {
        'www.baidu.com': 'baidu',
        'www.google.com': 'google',
        'www.bing.com': 'bing',
        'cn.bing.com': 'cnbing'
    };

    function getHandler() {
        const host = window.location.host;
        if (hostToHandler[host] === undefined) {
            return 'other';
        }
        return handlers[hostToHandler[host]];
    }

    function main() {
        if (GM_getValue('searchEngines') === null) {
            const searchEngines = [
                {
                    name: '百度',
                    url: 'https://www.baidu.com/s?wd=',
                    icon: 'https://icon.horse/icon/www.baidu.com'
                },
                {
                    name: '谷歌',
                    url: 'https://www.google.com/search?q=',
                    icon: 'https://icon.horse/icon/www.google.com'
                },
                {
                    name: '必应',
                    url: 'https://www.bing.com/search?q=',
                    icon: 'https://icon.horse/icon/www.bing.com'
                },
                {
                    name: 'YouTube',
                    url: 'https://www.youtube.com/results?search_query=',
                    icon: 'https://icon.horse/icon/www.youtube.com'
                },
                {
                    name: '哔哩哔哩',
                    url: 'https://search.bilibili.com/all?keyword=',
                    icon: 'https://icon.horse/icon/www.bilibili.com'
                },
                {
                    name: '知乎',
                    url: 'https://www.zhihu.com/search?type=content&q=',
                    icon: 'https://icon.horse/icon/www.zhihu.com'
                },
                {
                    name: 'CSDN',
                    url: 'https://so.csdn.net/so/search/s.do?q=',
                    icon: 'https://icon.horse/icon/so.csdn.net'
                },
                {
                    name: 'DuckDuckGo',
                    url: 'https://duckduckgo.com/?q=',
                    icon: 'https://icon.horse/icon/www.duckduckgo.com'
                },
                {
                    name: 'Setting',
                    toggleSortIcon: `<svg class='ms-toggle-sort-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.05 12.05L21 17l-4.95 4.95-1.414-1.414 2.536-2.537L4 18v-2h13.172l-2.536-2.536 1.414-1.414zm-8.1-10l1.414 1.414L6.828 6 20 6v2H6.828l2.536 2.536L7.95 11.95 3 7l4.95-4.95z"/></svg>`,
                    plusIcon: `<svg class='ms-plus-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 12c0-.865.11-1.703.316-2.504A3 3 0 0 0 4.99 4.867a9.99 9.99 0 0 1 4.335-2.505 3 3 0 0 0 5.348 0 9.99 9.99 0 0 1 4.335 2.505 3 3 0 0 0 2.675 4.63c.206.8.316 1.638.316 2.503 0 .865-.11 1.703-.316 2.504a3 3 0 0 0-2.675 4.629 9.99 9.99 0 0 1-4.335 2.505 3 3 0 0 0-5.348 0 9.99 9.99 0 0 1-4.335-2.505 3 3 0 0 0-2.675-4.63C2.11 13.704 2 12.866 2 12zm4.804 3c.63 1.091.81 2.346.564 3.524.408.29.842.541 1.297.75A4.993 4.993 0 0 1 12 18c1.26 0 2.438.471 3.335 1.274.455-.209.889-.46 1.297-.75A4.993 4.993 0 0 1 17.196 15a4.993 4.993 0 0 1 2.77-2.25 8.126 8.126 0 0 0 0-1.5A4.993 4.993 0 0 1 17.195 9a4.993 4.993 0 0 1-.564-3.524 7.989 7.989 0 0 0-1.297-.75A4.993 4.993 0 0 1 12 6a4.993 4.993 0 0 1-3.335-1.274 7.99 7.99 0 0 0-1.297.75A4.993 4.993 0 0 1 6.804 9a4.993 4.993 0 0 1-2.77 2.25 8.126 8.126 0 0 0 0 1.5A4.993 4.993 0 0 1 6.805 15zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
`
                }
            ];
            GM_setValue('searchEngines', searchEngines);
        }

        GM_setValue('themeColor', '#4e6ef2');
        GM_setValue('sortMode', 'off');

        let handler = getHandler();
        handler.preprocess.call();
        handler.addMSComponent.call();
        handler.addScrollListener.call();
    }

    //添加拖拽功能
    function addElementDragListener(element) {
        element.ondragover = function (e) {
            e.preventDefault(); //阻止默认事件
        }
        element.ondragstart = function (e) {
            e.target.parentNode.childNodes.forEach(element => {
                if (element === e.target) {
                    element.classList.toggle("ms-dragging");
                } else {
                    element.classList.toggle("ms-crowded");
                }
            });
            dragging = e.target;
            e.dataTransfer.effectAllowed = 'move';
        }

        element.ondragend = function (e) {
            setTimeout(() => {
                e.target.parentNode.childNodes.forEach(element => {
                    if (element === e.target) {
                        element.classList.toggle("ms-dragging");
                    } else {
                        element.classList.toggle("ms-crowded");
                    }
                });
            }, 0);
        }

        element.ondrop = function (e) {
            let delay = 0.5;   //延迟
            e.preventDefault();
            let target = e.target;
            let targetIndex = 0;
            if (!target.classList.contains('ms-dragging') && target.getAttribute('droppable') === 'true') {
                let draggingIndex = Array.prototype.indexOf.call(dragging.parentNode.children, dragging);
                if (target.classList.contains('ms-item')) {
                    // 啥也不干
                } else if (target.parentNode.classList.contains('ms-item')) {
                    target = target.parentNode;
                } else {
                    target = target.parentNode.parentNode;
                }
                targetIndex = Array.prototype.indexOf.call(target.parentNode.children, target);
                if (draggingIndex !== targetIndex) {
                    reorderElements(draggingIndex, targetIndex, dragging, target, delay);
                }
            }
        }

        // 插入元素
        function reorderElements(draggingIndex, targetIndex, dragging, target, delay) {
            let startPosition = dragging.getBoundingClientRect();
            let endPosition = target.getBoundingClientRect();
            if (draggingIndex < targetIndex) {
                addAnimation(draggingIndex, targetIndex, startPosition, endPosition, dragging, 1);
                setTimeout(() => {
                    dragging.parentNode.childNodes.forEach(element => {
                        element.style.transform = '';
                    });
                    target.parentNode.insertBefore(dragging, target.nextSibling);
                }, delay * 1000);
            } else {
                addAnimation(draggingIndex, targetIndex, startPosition, endPosition, dragging, -1);
                setTimeout(() => {
                    dragging.parentNode.childNodes.forEach(element => {
                        element.style.transform = '';
                    });
                    target.parentNode.insertBefore(dragging, target);
                }, delay * 1000);
            }
            updateData(draggingIndex, targetIndex);
        }

        // 添加动画
        function addAnimation(draggingIndex, targetIndex, startPosition, endPosition, dragging, direction) {
            let deltaX = 0;
            let component = dragging.parentNode;
            if (direction === 1) {
                //往右
                deltaX = endPosition.right - startPosition.right;
                console.log(draggingIndex, targetIndex);
                for (let i = draggingIndex + 1; i <= targetIndex; i++) {
                    let element = component.children[i];
                    let deltaX2 = startPosition.left - dragging.nextSibling.getBoundingClientRect().left;
                    element.style.transition = '';
                    element.style.transform = `translateX(${deltaX2}px)`;
                    element.offsetWidth;
                    element.style.transition = 'all 0s';
                }
            } else if (direction === -1) {
                //往左
                deltaX = endPosition.left - startPosition.left;
                for (let i = targetIndex; i < draggingIndex; i++) {
                    let element = component.children[i];
                    let deltaX2 = startPosition.right - dragging.previousSibling.getBoundingClientRect().right;
                    element.style.transition = '';
                    element.style.transform = `translateX(${deltaX2}px)`;
                    element.offsetWidth;
                    element.style.transition = 'all 0s';
                }
            }
            dragging.style.transition = '';
            dragging.style.transform = `translateX(${deltaX}px)`;
            dragging.offsetWidth;
            dragging.style.transition = 'all 0s';
        }

        // 更新数据
        function updateData(draggingIndex, targetIndex) {
            let engines = GM_getValue('searchEngines');
            let draggingEngine = engines.splice(draggingIndex, 1)[0];
            engines.splice(targetIndex, 0, draggingEngine);
            GM_setValue('searchEngines', engines);
        }
    }


    function makeMSComponent() {
        let msComponent = createElementWithId('div', 'ms-component');
        let searchEngines = GM_getValue('searchEngines');
        //添加元素
        searchEngines.forEach((searchEngine, index) => {
            let element = makeElement(searchEngine, index);
            msComponent.appendChild(element);
        });
        //添加样式
        let allStyle = getAllStyle();
        msComponent.appendChild(allStyle);
        //添加快捷键
        return msComponent;
    }


    //组件添加元素
    function makeElement(searchEngine) {
        let element = createElement('div', 'ms-item');
        element.setAttribute('droppable', true)
        if (searchEngine.name === 'Setting') {
            element.style.justifyContent = 'center';
            element.innerHTML = searchEngine.toggleSortIcon + searchEngine.plusIcon;
            let items = element.childNodes;
            items.forEach(item => {
                item.onmouseover = function () {
                    item.childNodes[1].style = `fill:${GM_getValue('themeColor')};`;
                }
                item.onmouseout = function () {
                    item.childNodes[1].style = ``;
                }
            })
            //切换排序模式
            items[0].onclick = function () {
                toggleSortMode();
            }
            //点击后弹出设置面板
            items[1].onclick = function () {
                popUpSettingPanel();
            }
        } else {
            element.onclick = function () {
                search(searchEngine.url);
            }
            let div = createElement('div', 'ms-item-content');
            div.setAttribute('droppable', true);
            let sortIcon = createElement('div', 'ms-sort-icon')
            sortIcon.setAttribute('droppable', true);
            let img = createElement('img', 'ms-icon');
            img.src = searchEngine.icon;
            img.draggable = '';
            img.setAttribute('droppable', true);
            let text = createElement('span', 'ms-text', '', searchEngine.name)
            text.setAttribute('droppable', true);
            let url = createInput('', 'ms-url', 'display:none', searchEngine.url);
            addElementDragListener(element);
            div.appendChild(sortIcon);
            div.appendChild(img);
            div.appendChild(text);
            div.appendChild(url);
            element.appendChild(div);
        }
        return element;
    }

    //切换排序模式
    function toggleSortMode() {
        let component = selectElement('#ms-component')
        let handler = getHandler();
        handler.preToggleSortMode();
        if (GM_getValue('sortMode') === 'off') {
            component.childNodes.forEach((element, index) => {
                if (index !== component.childNodes.length - 1) {
                    element.style.height = '63.5px';
                    element.draggable = 'true';
                }
            });
            GM_setValue('sortMode', 'on');
        } else {
            component.childNodes.forEach((element, index) => {
                if (index !== component.childNodes.length - 1) {
                    element.style.height = '48.5px';
                    element.draggable = '';
                    element.style.transition = '';
                }
            });
            GM_setValue('sortMode', 'off');
        }
    }

    function turnOnToggleSortMode() {
        if (GM_getValue('sortMode') === 'off') {
            toggleSortMode();
        }
    }

    function turnOffToggleSortMode() {
        if (GM_getValue('sortMode') === 'on') {
            toggleSortMode();
        }
    }


    //弹出添加面板
    function popUpSettingPanel() {
        let panel = createElementWithId('div', 'ms-setting-panel');
        let content = createElement('div', 'mss-content');
        let title = createElement('div', 'mss-title', '', '多重搜索设置');
        let container = createElement('div', 'mss-container');
        let left = createElement('div', 'mss-left');
        let list = createElement('div', 'mss-list');

        function listSearchEngines() {
            list.innerHTML = '';
            let searchEngines = GM_getValue('searchEngines');
            searchEngines.forEach((searchEngine, index) => {
                if (index !== searchEngines.length - 1) {
                    appendItem(searchEngine, index);
                }
            });
        }

        function appendItem(searchEngine, index) {
            index = index ? index : list.childNodes.length;
            let item = createElement('div', 'mss-item');
            let icon = createElement('img', 'mss-item-icon');
            icon.src = searchEngine.icon;
            icon.addEventListener('click', () => {
                popUpIconPanel(searchEngine, index);
            });
            let center = createElement('div', 'mss-center');
            let name = createInput('', 'mss-item-name', '', searchEngine.name, '名称');
            let url = createInput('', 'mss-item-url', '', searchEngine.url, '网址');
            let icon_ = createInput('', 'mss-item-icon_', '', searchEngine.icon);
            let delBtn = createElement('button', 'mss-del-btn', '', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z"/></svg>`);
            delBtn.addEventListener('click', (e) => {
                list.childNodes[index].style.display = 'none';
            });
            center.appendChild(name);
            center.appendChild(url);
            center.appendChild(icon_);
            item.appendChild(icon);
            item.appendChild(center);
            item.appendChild(delBtn);
            list.appendChild(item);
        }

        function popUpIconPanel(searchEngine, index) {
            let panel = createElement('div', 'mss-icon-panel');
            let content = createElement('div', 'mss-icon-content');
            let title = createElement('div', 'mss-icon-title', '', '修改图标');
            let container = createElement('div', 'mss-icon-container');
            let form = createElement('form', 'mss-icon-form');
            let iconInput = createInput('', 'mss-icon-input', '', selectElementAll('#ms-setting-panel .mss-item-icon_')[index].value, '图标地址（留空自动生成）');
            let close = createElement('div', 'mss-icon-close', '', `<svg class=\'mss-icon-editor-close-icon\' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`);
            close.addEventListener('click', () => {
                panel.remove();
            });
            let cancelBtn = createElement('button', 'mss-icon-cancel-btn', '', '取消');
            cancelBtn.addEventListener('click', (e) => {
                panel.remove();
            });
            let confirmBtn = createElement('button', 'mss-icon-confirm-btn', '', '确定');
            confirmBtn.addEventListener('click', (e) => {
                selectElementAll('#ms-setting-panel .mss-item-icon')[index].src = iconInput.value;
                selectElementAll('#ms-setting-panel .mss-item-icon_')[index].value = iconInput.value;
                panel.remove();
            });
            form.appendChild(iconInput);
            container.appendChild(form);
            content.appendChild(title);
            content.appendChild(container);
            content.appendChild(close);
            content.appendChild(cancelBtn);
            content.appendChild(confirmBtn);
            panel.appendChild(content);
            document.body.appendChild(panel);
        }

        listSearchEngines();
        let right = createElement('div', 'mss-right');
        let form = createElement('form', 'mss-form');
        let nameInput = createInput('', 'mss-name-input', '', '', '搜索引擎名称');
        let urlInput = createInput('', 'mss-url-input', '', '', '搜索引擎地址');
        let iconInput = createInput('', 'mss-icon-input', '', '', '图标地址（留空自动生成）');
        let addBtn = createElement('button', 'mss-add-btn', '', '添加');
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let name = nameInput.value;
            let url = urlInput.value;
            let hostname = '';
            try {
                hostname = new URL(url).hostname;
            } catch (e) {
                alert('网址格式错误');
                return;
            }
            let icon = iconInput.value ? iconInput.value : `https://icon.horse/icon/${hostname}`;
            if (name && url && icon) {
                let searchEngine = {
                    name: name,
                    url: url,
                    icon: icon
                };
                appendItem(searchEngine);
            }
        });
        let close = createElement('div', 'mss-icon-close', '', `<svg class='mss-close-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`);
        close.addEventListener('click', () => {
            panel.remove();
        });
        let cancelBtn = createElement('button', 'mss-icon-cancel-btn', '', '取消');
        cancelBtn.addEventListener('click', (e) => {
            panel.remove();
        });
        let confirmBtn = createElement('button', 'mss-icon-confirm-btn', '', '确定');
        confirmBtn.addEventListener('click', (e) => {
            let newSearchEngines = [];
            let setting = GM_getValue('searchEngines').pop();
            let list = selectElement('#ms-setting-panel .mss-list');
            list.childNodes.forEach((item,index) => {
                if (item.style.display !== 'none') {
                    let name = selectElementAll('.mss-item-name')[index].value;
                    let url = selectElementAll('.mss-item-url')[index].value;
                    let icon = selectElementAll('.mss-item-icon_')[index].value;
                    newSearchEngines.push({
                        name: name,
                        url: url,
                        icon: icon
                    });
                }
            });
            newSearchEngines.push(setting);
            GM_setValue('searchEngines', newSearchEngines);
            panel.remove();
            window.location.reload();
        });
        form.appendChild(nameInput);
        form.appendChild(urlInput);
        form.appendChild(iconInput);
        form.appendChild(cancelBtn);
        form.appendChild(addBtn);
        left.appendChild(list);
        right.appendChild(form);
        container.appendChild(left);
        container.appendChild(right);
        content.appendChild(close);
        content.appendChild(title);
        content.appendChild(container);
        content.appendChild(confirmBtn);
        panel.appendChild(content);
        document.body.appendChild(panel);
    }


    function getAllStyle() {
        let css = `#ms-component {background: white;border-radius: 10px;display: flex;flex-wrap: nowrap;flex-direction: row; transition: padding-block 0.3s ease-in-out 0s, box-shadow 0.3s ease-in-out 0s, height 0.3s ease-in-out, 0s margin-top 0.3s ease-in-out;}  .ms-container {margin-left: 120px;}  .ms-item {height: 48.5px;overflow-y: hidden;min-width: 30px;margin-inline: 10px;display: flex;padding: 6px 10px;flex-direction: column;align-items: center;justify-content: flex-end;cursor: pointer;background: linear-gradient(135deg, rgba(245, 245, 245, 1) 0%, rgba(255, 255, 255, 1) 100%);box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);border-radius: 8px;color: black;text-decoration: none; transition: height 0.3s ease-in-out 0s}\n.ms-item:hover{color: #4e6ef2 !important;}\n .ms-item-content {display: flex;flex-direction: column;align-items: center;justify-content: flex-end;}  .ms-sort-icon {width: 10px;height: 3px;margin-bottom: 10px;border-radius: 3px;background: #909eb0;transition: height 0.3s ease-in-out;}  .ms-icon {width: 30px;height: 30px;border-radius: 5px;transition: all 0.3s ease-in-out;}  .ms-toggle-sort-icon {transition: all 0.3s ease-in-out;}  .ms-text {min-width: 36px;margin-top: 2px;font-size: 12px;font-weight: bold;white-space: nowrap;overflow: hidden; text-align: center;}  #ms-setting-panel {position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0, 0, 0, 0.2);z-index: 1000;display: flex;justify-content: center;align-items: center;}  .mss-content {position: relative;width: 800px;height: 500px;border-radius: 10px;display: flex;flex-direction: column;justify-content: flex-start;align-items: center;background: #EFEFEFFF;}  .mss-title {width: 100%;height: 15%;display: flex;justify-content: center;align-items: center;font-size: 20px;font-weight: bold;border-bottom: 1px solid #e5e5e5;}  .mss-container {width: 100%;height: 85%;display: flex;flex-direction: row;justify-content: flex-start;align-items: center;}  .mss-left {width: 100%;height: 100%;display: flex;flex-direction: column;justify-content: flex-start;align-items: center;}  .mss-list {width: 400px;height: 100%;display: flex;flex-direction: column;justify-content: flex-start;align-items: center;overflow-y: scroll;overflow-x: hidden;}  .mss-list::-webkit-scrollbar {}  .mss-item {width: auto;height: 60px;margin-block: 10px;padding-block: 10px;padding-inline: 10px;display: flex;flex-direction: row;justify-content: flex-start;align-items: center;border-radius: 10px;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);background: linear-gradient(135deg, rgba(230, 230, 230, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-item-icon {width: 45px;height: 45px;margin: 0 0;border-radius: 10px;cursor: pointer;}  .mss-center {margin: 0 10px;height: 100%;display: flex;flex-direction: column;justify-content: space-around;align-items: stretch;}  .mss-item-name {width: 80px;border: none;outline: none;border-radius: 3px;padding: 3px 10px 1px;font-weight: bold;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset, 4px 4px 10px -8px rgba(0, 0, 0, .3) inset;background: linear-gradient(135deg, rgba(240, 240, 240, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-item-url {width: 185px;border: none;outline: none;border-radius: 3px;padding: 3px 10px 1px;font-weight: bold;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset, 4px 4px 10px -8px rgba(0, 0, 0, .3) inset;background: linear-gradient(135deg, rgba(240, 240, 240, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-item-icon_ {display: none;}  .mss-del-btn {width: 45px;height: 45px;border: 1px solid #e5e5e5;border-radius: 10px;cursor: pointer;}  .mss-icon-panel {position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0, 0, 0, 0.2);z-index: 1000;display: flex;justify-content: center;align-items: center;}  .mss-icon-content {position: relative;width: 400px;height: 300px;border-radius: 10px;display: flex;flex-direction: column;justify-content: flex-start;align-items: center;background: #EFEFEFFF;}  .mss-icon-title {width: 100%;height: 20%;display: flex;justify-content: center;align-items: center;font-size: 20px;font-weight: bold;border-bottom: 1px solid #e5e5e5;}  .mss-icon-container {width: 100%;height: 80%;display: flex;flex-direction: row;justify-content: flex-start;align-items: center;}  .mss-icon-form {width: 100%;height: 90px;display: flex;margin-bottom: 30px;flex-direction: column;justify-content: center;align-items: center;}  .mss-icon-input {width: 280px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;margin-bottom: 10px;padding: 0 10px;font-weight: bold;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset, 4px 4px 10px -8px rgba(0, 0, 0, .3) inset;background: linear-gradient(135deg, rgba(240, 240, 240, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-icon-close {position: absolute;top: 15px;right: 10px;width: 30px;display: flex;flex-direction: row;justify-content: center;align-items: center;height: 30px;margin: 0 10px;cursor: pointer;}  .mss-icon-cancel-btn {position: absolute;bottom: 10px;right: 100px;width: 80px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;background: #e5e5e5;cursor: pointer;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);background: linear-gradient(135deg, rgba(230, 230, 230, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-icon-confirm-btn {position: absolute;bottom: 10px;right: 10px;width: 80px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;background: #e5e5e5;cursor: pointer;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);background: linear-gradient(135deg, rgba(230, 230, 230, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-right {width: 100%;height: 100%;display: flex;flex-direction: column;justify-content: center;align-items: center;}  .mss-form {width: 100%;height: 200px;display: flex;flex-direction: column;justify-content: center;align-items: center;}  .mss-name-input {width: 300px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;margin-bottom: 10px;padding: 0 10px;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset, 4px 4px 10px -8px rgba(0, 0, 0, .3) inset;background: linear-gradient(135deg, rgba(240, 240, 240, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-url-input {width: 300px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;margin-bottom: 10px;padding: 0 10px;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset, 4px 4px 10px -8px rgba(0, 0, 0, .3) inset;background: linear-gradient(135deg, rgba(240, 240, 240, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-icon-input {width: 300px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;margin-bottom: 10px;padding: 0 10px;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1) inset, 4px 4px 10px -8px rgba(0, 0, 0, .3) inset;background: linear-gradient(135deg, rgba(240, 240, 240, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-add-btn {width: 300px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;margin-bottom: 10px;padding: 0 10px;background: #e5e5e5;cursor: pointer;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);background: linear-gradient(135deg, rgba(230, 230, 230, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-close {position: absolute;top: 22.5px;right: 10px;width: 30px;display: flex;flex-direction: row;justify-content: center;align-items: center;height: 30px;margin: 0 10px;cursor: pointer;}  .mss-cancel-btn {position: absolute;bottom: 10px;right: 100px;width: 80px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;background: #e5e5e5;cursor: pointer;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);background: linear-gradient(135deg, rgba(230, 230, 230, 1) 0%, rgba(246, 246, 246, 1) 100%);}  .mss-button-btn {position: absolute;bottom: 10px;right: 10px;width: 80px;height: 40px;border: 1px solid #e5e5e5;border-radius: 10px;background: #e5e5e5;cursor: pointer;box-shadow: -4px -4px 10px -8px rgba(255, 255, 255, 1), 4px 4px 10px -8px rgba(0, 0, 0, .3);background: linear-gradient(135deg, rgba(230, 230, 230, 1) 0%, rgba(246, 246, 246, 1) 100%);} input{box-sizing:border-box;-webkit-box-sizing: border-box;}`;
        return createElement('style', '', '', css);
    }

    // 展开或折叠组件
    function toggleMSComponent(scrollTop, expandCritical, collapseCritical) {
        let items = selectElementAll('.ms-item');
        let sortIcons = selectElementAll('.ms-sort-icon');
        let icons = selectElementAll('.ms-icon');
        let toggleSortIcon = selectElement('.ms-toggle-sort-icon');
        items.forEach((item, index) => {
            if (scrollTop > expandCritical) {
                if (index !== items.length - 1) {
                    sortIcons[index].style.height = '0px';
                    sortIcons[index].style.opacity = '0';
                    sortIcons[index].style.marginBottom = '0px';
                    icons[index].style.height = '0px';
                    icons[index].style.width = '0px';
                    icons[index].style.opacity = '0';
                }
                item.style.height = '18px';
                toggleSortIcon.style.height = '0px';
                toggleSortIcon.style.width = '0px';
                toggleSortIcon.style.opacity = '0';
            } else if (scrollTop <= collapseCritical) {
                if (index !== items.length - 1) {
                    sortIcons[index].style.height = '3px';
                    sortIcons[index].style.opacity = '1';
                    sortIcons[index].style.marginBottom = '10px';
                    icons[index].style.height = '30px';
                    icons[index].style.width = '30px';
                    icons[index].style.opacity = '1';
                }
                item.style.height = '48.5px';
                toggleSortIcon.style.height = '20px';
                toggleSortIcon.style.width = '20px';
                toggleSortIcon.style.opacity = '1';
            }
        });
    }

    function search(url) {
        let handler = getHandler();
        window.open(url + handler.getSearchContent.call());
    }

    // 添加快捷键
    function addShortcutKeys() {
        let urlInputs = selectElementAll('.ms-url');
        let texts = selectElementAll('.ms-text');
        let system = getSystem();
        let modifier = (system === 'mac' || system === 'ipad') ? '⌥' : 'Alt';
        let originalTexts = [];
        texts.forEach((text) => {
            originalTexts.push(text.innerHTML);
        });
        document.body.addEventListener('keydown', (event) => {
            event.altKey && (
                selectElement('#ms-component').classList.add('pin'),
                [...Array(9)].forEach((_, i) => {
                    let keyCode = 'Digit' + (i + 1);
                    texts.forEach((text, index) => {
                        text.style.width = text.offsetWidth + 'px';
                        text.innerHTML = `${modifier} + ${index + 1}`;
                    });
                    event.code === keyCode && (
                        event.preventDefault(), //阻止键盘输入
                        search(urlInputs[i].value)
                    )
                }));
        });
        document.body.addEventListener('keyup', (event) => {
            !event.altKey && (
                selectElement('#ms-component').classList.remove('pin'),
                texts.forEach((text, index) => {
                    text.style.width = '';
                    text.innerHTML = originalTexts[index];
                })
            )
        });
    }

    // 获取系统类型
    function getSystem() {
        let userAgent = navigator.userAgent;
        let isMac = userAgent.indexOf('Mac') > -1;
        let isIpad = userAgent.indexOf('iPad') > -1;
        if (isMac) {
            return 'mac';
        } else if (isIpad) {
            return 'ipad';
        } else {
            return 'win';
        }
    }

    function createElement(tag, className, style, content) {//TODO: 加上监听器
        let element = document.createElement(tag);
        className && (element.className = className);
        style && (element.style = style);
        content && (element.innerHTML = content);
        return element;
    }


    function createElementWithId(tag, id, style, content) {
        let element = document.createElement(tag);
        id && (element.id = id);
        style && (element.style = style);
        content && (element.innerHTML = content);
        return element;
    }

    function createInput(type, className, style, value, placeholder) {
        let input = document.createElement('input');
        type && (input.type = type);
        className && (input.className = className);
        style && (input.style = style);
        value && (input.value = value);
        placeholder && (input.placeholder = placeholder);
        return input;
    }

    function selectElement(element) {
        return document.querySelector(element);
    }

    function selectElementAll(element) {
        return document.querySelectorAll(element);
    }


    main();


})();