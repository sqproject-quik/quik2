(()=>{
    var si=new SettingItem({
        title:"自动翻译",
        index:2,
        type:'boolean',
        message:"搜索框输入非中文时自动翻译为中文",
        get(){
            return !!core.initsto.get('ob_tran');
        },
        callback(value){
            core.initsto.set('ob_tran',value);
            return true;
        }
    })

    sg.addNewItem(si);
var _t_re,_t_timeout;
core.addNewSA({
    check(text){
        return (!!core.initsto.get('ob_tran'))&&(!util.checkUrl(text))&&checkLang(text);
    },
    get(text,getsa){
      return new Promise(function(r,j){
        // 降低调用次数
        _t_timeout=setTimeout(()=>{
            _t_re=util.xhr('https://api.oioweb.cn/api/txt/QQFanyi?sourceText='+encodeURIComponent(text),function(res){
                var o=JSON.parse(res);
                if(o.code==200){
                    var a=getsa();
                    var result=o.result.targetText;
                    a.unshift({
                        icon:util.getGoogleIcon('e8e2'),
                        text:result,
                        click(){
                            ui.setValue(result);
                        }
                    })
                    r(a);
                }else{
                    console.log('Translate API Err:',o);
                    next();
                }
            },function(err){
                console.log('Translate API Err:',err);
                next();
            })
            function next(){
                _t_re=util.xhr('https://api.gumengya.com/Api/Translate?appkey=b7a782741f667201b54880c925faec4b&text='+encodeURIComponent(text)+'&from=auto&to=zh',function(res){
                    var a=getsa();    
                    var o=JSON.parse(res);
                    if(o.code==200){
                        var result=o.data.result;
                        a.unshift({
                            icon:util.getGoogleIcon('e8e2'),
                            text:result,
                            click(){
                                ui.setValue(result);
                            }
                        })
                    }else{
                        console.log('Translate API Err:',o);
                    }
                    r(a);
                    
                },function(err){
                    console.log('Translate API Err:',err);
                })
            }
            
        },1500)
        
      })
    },
    interrupt(){
        clearTimeout(_t_timeout);
        if(_t_re){
            _t_re.abort();
        }
    }
  });

function checkLang(text){
    var l=text.length
    var y=text.match(/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FFйцукенгшщзхъфывапролджэячсмитьбюёàâäèéêëîïôœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ\u0530-\u1CDF]/g);
    return y?y.length/l>0.5:!1;
}


return {
    si:si
  }
})();