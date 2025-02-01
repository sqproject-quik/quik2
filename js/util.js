(()=>{
  if(location.hash.indexOf('extdheodqp2eidhjwe')!=-1){
    console.log('插件模式');
    window.isExt=true;
    if(location.hash.indexOf(';')!=-1){
      window.extid=location.hash.substring(location.hash.indexOf(':')+1,location.hash.indexOf(';'))
    }else{
      window.extid=location.hash.substring(location.hash.indexOf(':')+1,location.hash.length)
    }
  }else{
    console.log('网页模式');
    window.isExt=false;
  }

  if(window.parent!=window){
    window.isInframe=true;
  }
  var extRequests=[],idmax=0;
  window.addEventListener('message',function(e){
    if(e.data.type=='xhr_cb'){
      var id=e.data.id;
      for(var i=0;i<extRequests.length;i++){
        if(extRequests[i].id==id){
          if(typeof extRequests[i][e.data.fn]=='function'){
            extRequests[i][e.data.fn](e.data.data);
          }
          if(e.data.finish==true){
            extRequests.slice(i,1);
          }
          break;
        }
      }
    }
  })
  return {
    // https://blog.csdn.net/qq_25257229/article/details/117969685
    deepClone(target) {
      const map = new WeakMap()
      
      function isObject(target) {
          return typeof target === 'object' && target 
      }
  
      function clone(data) {
          if (!isObject(data)) {
              return data
          }
          if ([Date, RegExp].includes(data.constructor)) {
              return new data.constructor(data)
          }
          const exist = map.get(data)
          if (exist) {
              return exist
          }
          if (data instanceof Map) {
              const result = new Map()
              map.set(data, result)
              data.forEach((val, key) => {
                  if (isObject(val)) {
                      result.set(key, clone(val))
                  } else {
                      result.set(key, val)
                  }
              })
              return result
          }
          if (data instanceof Set) {
              const result = new Set()
              map.set(data, result)
              data.forEach(val => {
                  if (isObject(val)) {
                      result.add(clone(val))
                  } else {
                      result.add(val)
                  }
              })
              return result
          }
          const keys = Reflect.ownKeys(data)
          const allDesc = Object.getOwnPropertyDescriptors(data)
          const result = Object.create(Object.getPrototypeOf(data), allDesc)
          map.set(data, result)
          keys.forEach(key => {
              const val = data[key]
              if (isObject(val)) {
                  result[key] = clone(val)
              } else {
                  result[key] = val
              }
          })
          return result
      }
  
      return clone(target)
  },
    requestByExt(details){
      idmax++;
      details.id=idmax;
      extRequests.push(details);
      var d=this.deepClone(details);
      for(var k in d){
        if(typeof d[k]=='function'){
          d[k]={_t:"fn",_n:k}
        }
      }
      parent.postMessage({
        type:"xhr",
        data:d,
        id:idmax
      },'*')
    },
    addStyle(css){
      var style=util.element('style');
      style.innerHTML=css;
      document.head.appendChild(style);
    },
    initSet(sto,key,ob){
      var o=sto.get(key);
      if(typeof ob=='object'&&ob){
        if(typeof o=='object'&&o){
          var a=false;
          for(var k in ob){
            if(typeof o[k]=='undefined'){
              a=true;
              o[k]=ob[k];
            }
          }
          if(a){
            sto.set(key,o);
          }
        }else if(typeof o=='undefined'){
          sto.set(key,ob);
        }
      }else{
        if(typeof o=='undefined'){
          sto.set(key,ob);
        }
      }
      
    },
    joinObj(){
      var obs=arguments;
      var n=obs[0];
      function jt(a,b){
        for(var k in b){
          a[k]=b[k];
        }
        return a;
      }
      for(var i=1;i<obs.length;i++){
        n=jt(n,obs[i]);
      }
      return n;
    },
    loadimg (url,cb){
      var img=new Image();
      img.src=url;
      img.onload=function(){
        cb(true);
      }
      img.onerror=function(){
        cb(false);
      }
    },
    element(tagname,options={}){
      var a=document.createElement(tagname);
      for(var i in options){
        a.setAttribute(i,options[i]);
      }
      return a;
    },
    query(element,qstr,isall){
      return element['querySelector'+(isall?'All':'')](qstr);
    },
    getFavicon(url,cb){
      try{
        var u=new URL(url);
      }catch(e){
        cb(false);
        return;
      }
        var _ic='https://api.xinac.net/icon/?url='+u.origin;
        if(u.hostname.indexOf('bing.com')!=-1){
          _ic='https://bing.com/favicon.ico';
        }else if(u.hostname.indexOf('www.google.com')!=-1||u.hostname.indexOf('google.com')==0){
          _ic='https://s2.loli.net/2024/08/10/dVNZ4SzFxTMpj1a.png';
        }else if(u.hostname.indexOf('tfseek.top')!=-1){
          _ic='https://tfseek.top/assets/img/216.png';
        }
        this.loadimg(_ic,function(st){
          if(st){
            cb(_ic)
          }else{
            util.loadimg(u.protocol+'//'+u.host+'/favicon.ico',function(st2){
              if(st2){
                cb(u.protocol+'//'+u.host+'/favicon.ico');
              }else{
                console.log('cbfalse');
                cb(false)
              }
            })
          }
        });
      
      
      // 删除多余代码，统一体验
    },
    createIcon(t){
      var canvas=document.createElement('canvas');
      canvas.width=64;
      canvas.height=64;
      var ctx=canvas.getContext('2d');
      ctx.fillStyle=this.getRandomColor();
      ctx.font='bold 32px Arial';
      ctx.fillText(t,20,40);
      return canvas.toDataURL();
    },
    getRandomColor(){
      return '#'+Math.random().toString(16).substring(2,8).toUpperCase();
    },
    fangdou(fn,time){
      var timer=null;
      return function(){
        if(timer) clearTimeout(timer);
        var _this=this;
        timer=setTimeout(()=>{
          fn.apply(_this,arguments);
        },time);
      }
    },
    jsonp(url,cb,cbkey){
      function getRandom(){
        return 'a'+Math.random().toString(36).slice(2);
      }
      var a=getRandom();
      var script=this.element('script',{
        src:addSearchParam(url,cbkey||'callback',a),
      });

      function addSearchParam(url,key,value){
        var a=new URL(url);
        a.searchParams.set(key,value);
        return a.href;
      }
      document.body.appendChild(script);
      script.onerror=function(){
        cb(false);
        document.body.removeChild(script);
      }
      window[a]=function(data){
        cb(data);
        try {
        document.body.removeChild(script);
          
        } catch (error) {
          
        }
        delete window[a];
      }
      return {
        abort(){
          try {
            script.remove();
          } catch (error) {
            
          }
        }
      }
    },
    xhr(url,cb,err){
      var xhr=new XMLHttpRequest();
      xhr.onreadystatechange=function(){
        if(xhr.readyState==4){
          if(xhr.status==200){
            cb(xhr.responseText);
          }else if(xhr.status>=400){
            err&&err({
              status:xhr.status,
              statusText:xhr.statusText,
              readyState:xhr.readyState,
              responseText:xhr.responseText
            });
          }
        }
      }
      xhr.onerror=function(){
        err&&err({
          status:xhr.status,
          statusText:xhr.statusText,
          readyState:xhr.readyState,
          responseText:xhr.responseText
        });
      }
      xhr.open('GET',url,true);
      xhr.send();
      return{
        abort(){
          xhr.abort();
        }
      }
    },
    checkSession (session){
      return session.isSession&&session.session_token==="Hvm_session_token_eoi1j2j";
    },
    getRandomHashCache(){
      return Math.random().toString(36).slice(2)+Date.now().toString(36);
    },
    copyText(value){
      if(window.isExt){
        parent.postMessage({
          type:"copy",
          text:value
        },'*');
      }else{
        if(navigator.clipboard){
          navigator.clipboard.writeText(value);
        }else{
          const input = document.createElement('input');
          input.value = value;
          input.style.display = 'none';
          // 将input元素添加到文档中
          document.body.appendChild(input);
          // 模拟键盘事件以触发复制操作
          input.select();
          document.execCommand('copy');
          // 从文档中移除input元素
          document.body.removeChild(input);
        }
      }
      toast.show('复制成功');
    },
    getGoogleIcon(unicode,d){
      return '<span class="material-symbols-outlined'+(d&&d.type?' '+d.type:'')+'">&#x'+unicode+';</span>'
    },
    getGoogleIconByString(string,d){
      return '<span class="material-symbols-outlined'+(d&&d.type?' '+d.type:'')+'">'+string+'</span>'
    },
    /**
     * 检查details中是否含有必选项
     * @param {Object} details 
     * @param {String[]} requires 
     */
    checkDetailsCorrect(details,requires){
      for(var i=0;i<requires.length;i++){
        if(details.hasOwnProperty(requires[i])==false){
          return false;
        }
      }
      return true;
    },
    checkUrl(text){
      return /^(https?:\/\/)?([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4})(\:[0-9]+)?(\/[^\/][a-zA-Z0-9\.\,\?\'\\\/\+&%\$#\=~_\-@]*)*(\/)?$/.test(text);
    },
    b0(a){
      return a<10?'0'+a:a;
    }
  }
})();