(() => {
    var menuedLi = null;
    function getMenuedLiDetail(){
        var index = getIndex(menuedLi, util.query(linkF, '.link-list li', true));
        var cate = util.query(linkF, '.cate-bar-items .cate-item.active');
        if (cate.classList.contains('mr')) {
            cate = null
        } else {
            cate = cate.innerText;
        }
        return {cate,index};
    }
    var linkMenu = new menu({
        list: [{
            icon: util.getGoogleIcon('e3c9'),
            title: "修改",
            click() {
                var {index,cate}=getMenuedLiDetail();
                openLinkEditDialog(index, cate);
            }
        }, {
            icon: util.getGoogleIcon('e92e'),
            title: "删除",
            click() {
                var {index,cate}=getMenuedLiDetail();
                link.deleteLink(cate, index, function () {
                    toast.show('删除成功')
                })
            }
        }, {
            icon: util.getGoogleIcon('e14d'),
            title: "复制链接",
            click() {
                util.copyText(util.query(menuedLi, 'a').href);
            }
        }, {
            icon: util.getGoogleIcon('e941'),
            title: "移动至...",
            click() {
                var {index,cate}=getMenuedLiDetail();
                openMoveLinkDialog(cate,index);
            }
        }]
    });

    var movelinkdia=null,movelinkdiad=null,movecc=null;
    function openMoveLinkDialog(cate,index){
        if(!movelinkdia){
            movelinkdia=new dialog({
                class:"move-link-dialog",
                content:_REQUIRE_('../htmls/linkmove.html'),
            });
            movelinkdiad=movelinkdia.getDialogDom();
            util.query(movelinkdiad, '.cancel.btn').onclick=function(e){
                e.preventDefault();
                movelinkdia.close();
            }
            movecc=util.query(movelinkdiad,'.group-list');
        }
        util.query(movelinkdiad, '.ok.btn').onclick=function(e){
            var yd=util.query(movecc,'.item.act');
            console.log(yd);
            if(yd){
                var tocate=yd.classList.contains('mr')?null:util.query(yd,'.item-name').innerText;
                var link1=linklist[index];
                link.addLink({
                    title:link1.title,
                    url:link1.url,
                    cate:tocate
                },function(){
                    link.deleteLink(cate,index,function(){
                        toast.show('移动成功')
                        movelinkdia.close();
                    });
                });

            }else{
                toast.show('请选择一个分组');
            }
        }
        movecc.innerHTML='';
        link.getCates(r => {
            r.data.unshift(null);
            r.data.forEach(c => {
                var li=util.element('div',{
                    class:"item"+((!c)?' mr':'')
                });
                li.innerHTML=`<div class="item-name">${c?c:util.getGoogleIcon('e838', { type: 'fill' })}</div><div class="item-select">${util.getGoogleIcon('e5ca')}</div>`;
                movecc.append(li);
                li.onclick=function(){
                    var yd=util.query(movecc,'.item.act');
                    if(yd){
                        yd.classList.remove('act');
                    }
                    this.classList.add('act');
                }
            });
        });
        setTimeout(()=>{
            movelinkdia.open();
        });
    }


    function glinkli(l) {
        var li = util.element('li');
        li.innerHTML = `<a href="${l.url}" target="_blank" rel="noopener noreferer"><div class="link-icon"><img/></div><p></p></a>`
        util.query(li, 'p').innerText = l.title;
        util.getFavicon(l.url, favicon => {
            if (favicon) {
                util.query(li, 'img').src = favicon;
            } else {
                util.query(li, 'img').src = util.createIcon(l.title[0]);
            }
            util.query(li, 'img').onload=function(){
                this.classList.add('load');
            }
        });
        li.oncontextmenu = function (e) {
            e.preventDefault()
            e.stopPropagation();
            resetmenued();
            menuedLi = this;
            linkMenu.setOffset({
                top: e.pageY,
                left: e.pageX
            })
            this.classList.add('menued');
            linkMenu.show();
        }
        draglink(li);
        return li;
    }

    var linkaddDialog;

    function openLinkEditDialog(index, cate) {
        if (!linkaddDialog) {
            linkaddDialog = new dialog({
                class: "link-add-dialog",
                content: _REQUIRE_('../htmls/linkedit.html'),
            });
            // @note 将cancel按钮修改为div，防止表单submit到cancel
            // @edit at 2024/1/30 15:20
            var d = linkaddDialog.getDialogDom();
            util.query(d, '.cancel.btn').onclick = function (e) {
                e.preventDefault();
                linkaddDialog.close();
            }
        }
        setTimeout(() => {
            linkaddDialog.open();
            var d = linkaddDialog.getDialogDom();
            var ll = linklist.length;
            if (index == -1) {
                _n('添加链接', '添加', '', '', ll, ll, (e) => {
                    e.preventDefault();
                    var url = util.query(d, '.link-add-url').value;
                    if (url.indexOf('://') == -1) {
                        url = 'http://' + url;
                    }
                    var title = util.query(d, '.link-add-title').value;
                    var index3 = util.query(d, '.link-add-index').value;
                    index3 = index3 == '' ? ll : (index3 - 0);
                    link.addLink({
                        url, title, index: index3, cate
                    }, r => {
                        if (r.code != 0) {
                            toast.show(r.msg);
                        } else {
                            toast.show('添加成功')
                            linkaddDialog.close();
                        }
                    })
                });
            } else {
                _n('修改链接', '修改', linklist[index].url, linklist[index].title, ll - 1, index, (e) => {
                    e.preventDefault();
                    var url = util.query(d, '.link-add-url').value;
                    if (url.indexOf('://') == -1) {
                        url = 'http://' + url;
                    }
                    var title = util.query(d, '.link-add-title').value;
                    var index2 = util.query(d, '.link-add-index').value;
                    index2 = index2 == '' ? index : (index2 - 0);
                    link.changeLink(cate, index, {
                        url: url,
                        title: title,
                        index: index2
                    }, (back) => {
                        if (back.code != 0) {
                            toast.show(back.msg);
                        } else {
                            toast.show('修改成功')
                            linkaddDialog.close();
                        }
                    })
                });
            }

            function _n(a, b, c, e, f, g, h) {
                util.query(d, 'h1').innerHTML = a;
                util.query(d, '.ok.btn').innerHTML = b;
                util.query(d, 'input.link-add-url').value = c;
                util.query(d, 'input.link-add-title').value = e;
                util.query(d, 'input.link-add-index').setAttribute('max', f);
                util.query(d, 'input.link-add-index').value = g;
                util.query(d, 'form').onsubmit = h;
            }
        })
    }

    if (!initsto.get('linksize')) {
        initsto.set('linksize', 'm');
    }
    if (!initsto.get('linkstyle')) {
        initsto.set('linkstyle', 'round');
    }
    if (!initsto.get('linkpailie')) {
        initsto.set('linkpailie', 'a');
    }

    function drawLinks(cate){
        link.getLinks(cate, ls => {
            linklist = ls.data;
            ls.data.forEach(l => {
                var li = glinkli(l);
                util.query(linkF, '.link-list').append(li);
            })
            var li = util.element('li', {
                class: "link-add"
            });
            li.innerHTML = `<a href="javascript:void(0)" class="material-symbols-outlined">&#xe145;</a>`;
            util.query(linkF, '.link-list').append(li);
            li.onclick = () => {
                var cate = util.query(linkF, '.cate-bar-items .cate-item.active');
                if (cate.classList.contains('mr')) {
                    cate = null
                } else {
                    cate = cate.innerText;
                }
                openLinkEditDialog(-1, cate);
            }
        })
    }

    var linkSizeSi = new SettingItem({
        type: 'select',
        title: "链接大小",
        message: "修改链接显示的大小",
        init() {
            return {
                xs: "很小",
                s: "小",
                m: "中",
                l: "大",
                xl: "很大"
            }
        },
        get() {
            return initsto.get('linksize');
        },
        callback(v) {
            initsto.set('linksize', v);
            dsize(v);
        }
    });
    var linkStyleSi = new SettingItem({
        type: 'select',
        title: "链接样式",
        message: "修改链接显示的样式",
        init() {
            return {
                def: "圆方",
                round: "圆形",
                square: "方形",
            }
        },
        get() {
            return initsto.get('linkstyle');
        },
        callback(v) {
            initsto.set('linkstyle', v);
            dstyle(v);
        }
    });
    var linkPLSi = new SettingItem({
        type: 'select',
        title: "链接排列",
        message: "修改链接的排列方式",
        init() {
            return {
                a:"靠左",
                b:"居中",
            }
        },
        get() {
            return initsto.get('linkpailie');
        },
        callback(v) {
            initsto.set('linkpailie', v);
            dstyle();
        }
    });

    linksg.addNewItem(linkSizeSi);
    linksg.addNewItem(linkStyleSi);
    linksg.addNewItem(linkPLSi);


    function dstyle() {
        linkF.className = 'links ' + initsto.get('linkstyle')+' '+initsto.get('linkpailie');
    }


    function dsize(v) {
        console.log(v);
        util.query(linkF, '.link-list').className = 'link-list ' + v;
    }

    link.on('change', cl => {
        var actcate = util.query(linkF, '.cate-bar-items .cate-item.active');
        if (cl.cate == actcate.innerText || (cl.cate == null && actcate.classList.contains('mr'))) {
            if (cl.type == 'add') {
                var li = glinkli(cl.detail);
                util.query(linkF, '.link-list').insertBefore(li, util.query(linkF, '.link-list .link-add'));
                linklist.push(cl.detail);
            } else if (cl.type == 'change') {
                console.log(cl.other);
                if (!(cl.other && cl.other.justindex)) {
                    console.log(cl.other);
                    linklist.splice(cl.index, 1)
                    linklist.splice(cl.detail.index, 0, cl.detail);
                    var lis = util.query(linkF, '.link-list li', true);
                    var tli = lis[cl.index];
                    util.query(linkF, '.link-list').insertBefore(tli, lis[cl.detail.index + 1]);
                    util.query(tli, 'a').href = cl.detail.url;
                    util.query(tli, 'p').innerText = cl.detail.title;
                    util.getFavicon(cl.detail.url, favicon => {
                        if (favicon) {
                            util.query(tli, 'img').src = favicon;
                        } else {
                            util.query(tli, 'img').src = util.createIcon(cl.detail.title[0]);
                        }
                    });
                }
            } else if (cl.type == 'delete') {
                var li = util.query(linkF, '.link-list li', true)[cl.index];
                li.remove();
                linklist.splice(cl.index, 1);
            }
        }

    })

    return {
        drawLinks,
        dstyle,
        dsize,
        getMenuedLi(){
            return menuedLi;
        },
        linkSizeSi
    }

})();