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
            util.xhr('https://edge.microsoft.com/translate/auth',function(res){
                var url='https://api.cognitive.microsofttranslator.com/translate?from=en&to=zh-CHS&api-version=3.0&includeSentenceLength=true';
                var xhr=new XMLHttpRequest();
                xhr.open('POST',url,true);
                xhr.setRequestHeader('Content-Type','application/json');
                xhr.setRequestHeader('authorization','Bearer '+res);
                xhr.onreadystatechange=function(){
                    if(xhr.readyState==4){
                        if(xhr.status==200){
                            var a=getsa();    
                            var o=JSON.parse(xhr.responseText);
                            if(o[0]){
                            var result=o[0].translations[0].text;
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
                        }else{
                            console.log('Translate API Err:',o);
                        }
                    }
                }
                var data=[{
                    'Text':text.replace(/[\r\n]/g,' ')
                }]
                xhr.send(JSON.stringify(data));
            },function(){
                console.log('Translate API Err:auth failed');
            })
            
            
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