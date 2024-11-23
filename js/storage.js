(()=>{
  if(!localStorage.quik2){
    localStorage.quik2='{}';
  }


  // 双向队列
  function Queue(){
    this.items={};
    this.count=0;
    this.head=0;
    this.tail=0;
  }
  Queue.prototype.enqueue=function(item){
    this.items[this.tail]=item;
    this.tail=this.tail+1;
    this.count=this.tail-this.head;
  }
  Queue.prototype.dequeue=function(){
    if(this.count==0){
      return null;
    }
    var item=this.items[this.head];
    delete this.items[this.head];
    this.head=this.head+1;
    this.count--;
    return item;
  }
  Queue.prototype.isEmpty=function(){
    return this.count==0;
  }
  Queue.prototype.size=function(){
    return this.count;
  }



  var evn=getEventHandle();

  var idbsupport=localforage._getSupportedDrivers([localforage.INDEXEDDB])[0]==localforage.INDEXEDDB;
  // var idbsupport=false;
  if(!idbsupport&&!localStorage.notdb){
    localStorage.notdb='1';
    setTimeout(()=>{
      alert('浏览器版本过低，不支持indexedDB，一些功能的使用将受限！');
    })
  }

  var setqueue=new Queue();

  var filerecv2={
    get(hash,cb){
      localforage.getItem(hash).then(cb);
    },
    set(file,hash,cb){
      hash=hash||('^'+util.getRandomHashCache());
      localforage.setItem(hash,file).then(()=>{
        cb(hash);
      });
    },
    delete(hash,cb){
      localforage.removeItem(hash).then(cb);
    }
  }
  var filerecv={
    get(hash,cb){
      setqueue.enqueue(['get',[hash],cb]);
      doqueue();
    },
    set(file,hash,cb){
      setqueue.enqueue(['set',[file,hash],cb]);
      doqueue();
    },
    delete(hash,cb){
      setqueue.enqueue(['delete',[hash],cb]);
      doqueue();
    }
  }

  function doqueue(){
    if(setqueue.isEmpty()){
      return;
    }
    var dd=setqueue.dequeue();
    console.log(dd);
    var mm=dd[1];
    mm.push(function(){
      doqueue();
      dd[2].apply(null,arguments);
    })
    filerecv2[dd[0]].apply(null,mm);
  }
  var jl={};

  var f=function(ck,details){
    if(typeof ck==='string'){
      if(!JSON.parse(localStorage.getItem("quik2"))[ck]){
        setAll({});
      }
      jl[ck]=details;
      function get(k,useidb,callback){
        if(!useidb){
          return getAll()[ck][k];
        }else{
          if(!idbsupport){
            throw new Error('indexedDB is not support in this browser');
          }
          filerecv.get(getAll()[ck][k],file=>{
            callback(file);
          });
        }
      }
      function set(k,v,useidb,callback){
        if(!useidb){
          var a=getAll();
          a[ck][k]=v;
          setAll(a[ck]);
        }else{
          if(!idbsupport){
            throw new Error('indexedDB is not support in this browser');
          }
          filerecv.set(v,get(k),hash=>{
            var a=getAll();
            a[ck][k]=hash;
            setAll(a[ck]);
            callback(hash);
          })
        }

      }
      function remove(k,useidb,callback){
        var a=getAll();
        if(!useidb){
          delete a[ck][k]
          setAll(a[ck]);
        }else{
          if(!idbsupport){
            throw new Error('indexedDB is not support in this browser');
          }
          filerecv.delete(a[ck][k],()=>{
            var a=getAll();
            delete a[ck][k];
            setAll(a[ck]);
            callback();
          });
        }
      }
      function getAll(){
        return JSON.parse(localStorage.getItem("quik2"));
      }
      function setAll(ob){
        var a=getAll();
        a[ck]=ob;
        localStorage.setItem("quik2",JSON.stringify(a));
        evn.doevent('storage',[{
          key:ck,
          value:ob
        }])
        if(details&&(!details.websync)&&details.sync){
          evn.doevent('websync',[{
            key:ck,
            value:ob
          }])
        }
      }
      function list(){
        return Object.keys(getAll()[ck]);
      }
      function websync(option){
        evn.doevent('websync',[{
          key:ck,
          value:option,
          sp:true
        }])
      }
      return {
        get:get,
        websync,
        set:set,
        remove:remove,
        list:list,
        getAll(){
          return getAll()[ck];
        },
        clear(){
          var a=getAll()[ck];
          for(var k in a){
            var b=k[a];
            if(typeof b=='string'&&b.startsWith('^')){
              filerecv.delete(b);
            }
          }
          setAll({});
        }
      }
    }else{
      throw new Error('ck is not a string');
    }
  }

  /**
   * 检查浏览器是否支持indexedDB
   * @returns {Boolean} indexedDB support
   */
  f.checkIDB=()=>{
    return idbsupport;
  }
  f.on=evn.on;
  f.off=evn.off;
  return {
    storage:f,
    getStorageList(){
      return jl;
    },
    getAllStorage(){
      return JSON.parse(localStorage.getItem("quik2"));
    },
    dbTool:filerecv
  };
})();