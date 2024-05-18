(function(){
    function installui(){
        var n=new dialog({
            content:_REQUIRE_('./install_ui.html'),
            class:"addon_install_ui"
        });
        this._d=n;
        var d=this._d.getDialogDom();
        util.query(d,'.btns').style.display='none';
    }

    installui.prototype={
        bind:function(p){
            var _=this;
            var d=this._d.getDialogDom();
            util.query(d,'.msg').innerText=p.statuMsg+'...';
            util.query(d,'.progress .r').style.width=p.progress*100+'%';
            if(p.errorCode!=-1){
                util.query(d,'.msg').innerText=p.errorMsg;
                util.query(d,'.progress').className='progress error';
                util.query(d,'.btns').style.display='block';
                util.query(d,'.btn.l').onclick=
                util.query(d,'.btn.r').onclick=function(){
                    _.hide();
                    setTimeout(function(){
                        _.destory();
                    },200)
                }
            }
            p.addEventListener('status',function(s){
                util.query(d,'.msg').innerText=s.msg;
            });
            p.addEventListener('progress',function(p){
                util.query(d,'.progress .r').style.width=p*100+'%';
            });
            p.addEventListener('error',function(e){
                util.query(d,'.msg').innerText=e.msg;
                util.query(d,'.progress').className='progress error';
                util.query(d,'.btns').style.display='block';
                util.query(d,'.btn.l').onclick=
                util.query(d,'.btn.r').onclick=function(){
                    _.hide();
                    setTimeout(function(){
                        _.destory();
                    },200)
                }
            });
            p.addEventListener('wait',function(e,d2){
                if(d2.meta){
                    util.query(d,'.sth img').src=d2.meta.icon;
                    util.query(d,'.sth .name').innerText=d2.meta.name;
                    util.query(d,'.sth .version').innerText='版本：'+d2.meta.version;
                }
                util.query(d,'.msg').innerText=d2.msg;
                util.query(d,'.btns').style.display='block';
                util.query(d,'.btn.l').onclick=function(){
                    e(false)
                }
                util.query(d,'.btn.r').onclick=function(){
                    e(true)
                }
            });
            p.addEventListener('done',function(){
                console.log('a');
                _.hide();
                setTimeout(function(){
                    _.destory();
                },200)
            });
        },
        ask:function(msg,fn){
            var d=this._d.getDialogDom();
            util.query(d,'.msg').innerText=msg;
            util.query(d,'.btns').style.display='block';
            util.query(d,'.l').onclick=function(){
                fn(false);
                util.query(d,'.btns').style.display='none';
            }
            util.query(d,'.r').onclick=function(){
                fn(true);
                util.query(d,'.btns').style.display='none';
            }
        },
        show:function(){
            this._d.open();
        },
        hide:function(){
            this._d.close();
        },
        destory:function(){
            this._d.destory();
        }
    }

    return installui;
})();