let { initsto } = require('./_core');
let util = require('../util');
let { SettingItem } = require('../setting/index');
let {linksg, linkF, getLinklist, getIndex}=require('./ui/init');
let link=require('./_link');
util.initSet(initsto, 'draglink', true);
var drags = new SettingItem({
    type: 'boolean',
    index: 2,
    title: "拖动排序链接(Beta)",
    message: "（仅在链接排列靠左时生效）开启后，你可以通过拖动链接来进行排序，手机端需长按链接1s才可拖动（Beta）",
    get() {
        return initsto.get('draglink');
    },
    callback(v) {
        initsto.set('draglink', v);
    }
});
setTimeout(() => {
    linksg.addNewItem(drags);
});
function getLineLinkNum() {
    var a = util.query(linkF, '.link-list').getBoundingClientRect().width / util.query(linkF, '.link-list li').getBoundingClientRect().width;
    return parseInt(a);
}


function f(li) {
    function g(a) {
        var gtimeout = null, ttimeout = null;
        li.addEventListener(a ? 'mousedown' : 'touchstart', (e) => {
            var linklist=getLinklist();
            if (e.which == 3) { return true; }
            if (!a) {
                ttimeout = setTimeout(() => {
                    resetmenued();
                    menuedLi = li;
                    linkMenu.setOffset({
                        top: e.targetTouches[0].pageY,
                        left: e.targetTouches[0].pageX
                    })
                    li.classList.add('menued');
                    linkMenu.show();
                }, 600);
            }
            if ((!initsto.get('draglink')) || (initsto.get('linkpailie') == 'b')) return true;
            let startX = a ? (e.pageX - li.getBoundingClientRect().left) : (e.targetTouches[0].pageX - li.getBoundingClientRect().left);
            let startY = a ? (e.pageY - li.getBoundingClientRect().top) : (e.targetTouches[0].pageY - li.getBoundingClientRect().top);
            console.log(startX, startY);
            console.log(li.getBoundingClientRect().top);
            if (a) {
                gtimeout = setTimeout(() => {
                    document.addEventListener('mousemove', _move, { passive: false })
                }, 50);
                document.addEventListener('mouseup', _up, { passive: false });
            } else {
                gtimeout = setTimeout(() => {
                    document.addEventListener('touchmove', _move, { passive: false });
                    li.classList.add('touching');
                    linkMenu.hide();
                }, 1000);
                document.addEventListener('touchend', _up, { passive: false });
            }

            var b = null, n = null;
            var jx = util.query(linkF, '.link-list').getBoundingClientRect().left;
            var jy = util.query(linkF, '.link-list').getBoundingClientRect().top;
            var dw = li.getBoundingClientRect().width;
            var dh = li.getBoundingClientRect().height;
            function _move(e) {
                e.preventDefault();
                clearTimeout(ttimeout);
                if (!b) {
                    li.querySelector('a').addEventListener('click', pv);
                    b = li.cloneNode(true);
                    b.classList.add('dragging-link');
                    li.classList.add('mousing');
                    document.body.appendChild(b);
                    b.style.width = li.getBoundingClientRect().width + 'px';
                    b.style.height = li.getBoundingClientRect().height + 'px';
                }
                var x = (a ? e.pageX : e.targetTouches[0].pageX) - startX;
                var y = (a ? e.pageY : e.targetTouches[0].pageY) - startY;
                b.style.left = x + 'px';
                b.style.top = y + 'px';

                var dx = x - jx + 50;
                var dy = y - jy + util.query(linkF, '.link-list').scrollTop;

                console.log(dw, dh);
                if (y - jy < -dh / 2 || y > util.query(linkF, '.link-list').getBoundingClientRect().height + util.query(linkF, '.link-list').getBoundingClientRect().top) {
                    var line = util.query(linkF, '.link-list .insert-line');
                    line.style.display = 'none';
                    console.log('out');
                    n = null;
                    if (y - jy < 0) {
                        scrollingtop();
                    } else {
                        scrollingbottom();
                    }
                } else {
                    clearInterval(stt);
                    var h = parseInt(dy / dh);
                    var w = parseInt(dx / dw);
                    var ne = w + h * getLineLinkNum();
                    if (linklist.length > ne) {
                        n = ne;
                        console.log(n, h, w);
                        var line = util.query(linkF, '.link-list .insert-line');
                        line.style.top = h * dh + 7 + 'px';
                        line.style.left = w * dw + 'px';
                        line.style.height = dh + 'px';
                        line.style.display = 'block';
                    }
                }


            }

            function pv(e) {
                e.preventDefault();
            }

            function _up(e) {
                clearTimeout(gtimeout);
                clearTimeout(ttimeout);
                li.classList.remove('touching');
                li.classList.remove('mousing');
                setTimeout(() => li.querySelector('a').removeEventListener('click', pv), 10);
                document.removeEventListener(a ? 'mousemove' : 'touchmove', _move)
                document.removeEventListener(a ? 'mouseup' : 'touchend', _up)
                if (b) {
                    b.remove();
                    b = null;
                }
                if (n !== null) {
                    var line = util.query(linkF, '.link-list .insert-line');
                    line.style.display = 'none';
                    var index = getIndex(li, util.query(linkF, '.link-list li', true));
                    if (n == index) return;
                    var cate = util.query(linkF, '.cate-bar-items .cate-item.active');
                    if (cate.classList.contains('mr')) {
                        cate = null
                    } else {
                        cate = cate.innerText;
                    }
                    link.changeLink(cate, index, {
                        url: linklist[index].url,
                        title: linklist[index].title,
                        index: n
                    }, (back) => {
                        if (back.code != 0) {
                            toast.show(back.msg);
                        } else {
                            linklist.splice(n, 0, linklist.splice(index, 1)[0]);
                            if (n > index) {
                                util.query(linkF, '.link-list').insertBefore(li, util.query(linkF, '.link-list li', true)[n + 1]);
                            } else {
                                util.query(linkF, '.link-list').insertBefore(li, util.query(linkF, '.link-list li', true)[n]);
                            }
                        }
                    }, {
                        justindex: true
                    })
                }
                return true;
            }
            return true;
        });
    }
    g(0);
    g(1);
}

var stt = null;
function scrollingtop() {
    clearInterval(stt);
    stt = setInterval(() => {
        util.query(linkF, '.link-list').scrollTop -= 2;
        if (util.query(linkF, '.link-list').scrollTop <= 0) {
            clearInterval(stt);
        }
    }, 5);
}

function scrollingbottom() {
    clearInterval(stt);
    stt = setInterval(() => {
        util.query(linkF, '.link-list').scrollTop += 2;
        if (util.query(linkF, '.link-list').scrollTop >= util.query(linkF, '.link-list').scrollHeight - util.query(linkF, '.link-list').getBoundingClientRect().height) {
            clearInterval(stt);
        }
    }, 5);
}

module.exports = f;