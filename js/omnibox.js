(function(){
  var k={
    SA:[],
    enter:[],
  }

  var initsto=storage('omnibox');

  /**
   * @param {String} text
   * @param {Function} updateFn(salist:{icon:String,text:String,click:Function}[])
   */
  var getSA=function(text,updateFn){
    var sa=[];
    var a=k.SA.length;
    for(var i=0;i<a;i++){
      if(k.SA[i].check(text)){
        k.SA[i].get(text,function(){
          return sa;
        }).then(function(res){
          sa=res;
          updateFn(sa);
        });
      }
    }
  }

  // 回车事件
  var enter=function(text){
    getType(text).enter(text);
  }

  // 获取类型
  var getType=function(text){
    for(var i=0;i<k.enter.length;i++){
      if(k.enter[i].check(text)){
        return k.enter[i];
      }
    }
  }

  var addNewType=function(options){
    k.enter.unshift(options);
  }

  var addNewSA=function(options){
    k.SA.push(options);
  }

  var searchUtil=_REQUIRE_("./search_util.js");

  function checkUrl(text){
    if(initsto.get('justsearch')){
      return false;
    }
    return /^(https?:\/\/)?([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4})(\:[0-9]+)?(\/[^\/][a-zA-Z0-9\.\,\?\'\\\/\+&%\$#\=~_\-@]*)*(\/)?$/.test(text);
  }

  addNewType({
    check:function(){
      return true;
    },
    enter:function(text){
      open(searchUtil.getSearchType().replace(searchUtil.keywordText,text));
    },
    icon:":searchtype",
    submit:util.getGoogleIcon('E8B6')
  });

  addNewType({
    check:checkUrl,
    enter:function(text){
      if(text.indexOf('://')==-1){
        text='http://'+text;
      }
      open(text);
    },
    icon:util.getGoogleIcon('E80B'),
    submit:util.getGoogleIcon('E89E')
  });

  addNewSA({
    check:function(text){
      return !!text;
    },
    get:function(text,getsa){
      return new Promise(function(r,j){
        var a=getsa();
        a.unshift({
          icon:util.getGoogleIcon('E8B6'),
          text:text,
          click:function(){
            open(searchUtil.getSearchType().replace(searchUtil.keywordText,text));
          }
        });
        r(a);
      })
    }
  })

  addNewSA({
    check:function(text){
      return !!text;
    },
    get:function(text,getsa){
      return new Promise(function(r,j){
        var a2=getsa();
        util.jsonp('https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&wd='+text,function(res){
          if(!res.g) return [];
          res.g.forEach(function(item){
            a2.push({
              icon:util.getGoogleIcon('E8B6'),
              text:item.q,
              click:function(){
                open(searchUtil.getSearchType().replace(searchUtil.keywordText,item.q));
              }
            });
          })
          r(a2);
        },'cb');
      })
    }
  });

  addNewSA({
    check:checkUrl,
    get:function(text,getsa){
      return new Promise(function(r,j){
        var a=getsa();
        a.unshift({
          icon:util.getGoogleIcon('E80B'),
          text:text,
          click:function(){
            if(text.indexOf('://')==-1){
              text='http://'+text;
            }
            open(text);
          }
        });
        r(a);
      })
    }
  });

  setting.registerSetting({
    index:1,
    unit:'搜索框',
    title:"搜索框仅搜索",
    type:'boolean',
    message:"打开后，搜索框将失去打开链接的功能",
    get:function(){
      return !!initsto.get('justsearch');
    },
    callback:function(value){
      initsto.set('justsearch',value);
      return true;
    }
  })
  
  return {
    getSA:getSA,
    enter:enter,
    getType:getType,
    addNewType:addNewType,
    addNewSA:addNewSA,
    searchUtil:searchUtil,
    initsto:initsto
  }
})();