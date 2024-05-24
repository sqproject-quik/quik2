(function(){
  var idmax=0;
function SettingItem(details){
  this.title=details.title;
  this.index=details.index;
  this.type=details.type;
  this.init=details.init;
  this.check=details.check;
  this.callback=details.callback;
  this.message=details.message;
  this.get=details.get;
  this._show=true;
  this.id='sei_'+idmax;
  idmax++;
  this._events={
    change:[]
  }
}

SettingItem.prototype={
  reInit:function(){
    this._dochange({
      attr:"reinit"
    })
  },
  reGet:function(){
    this._dochange({
      attr:"reget"
    })
  },
  setTitle:function(title){
    this.title=title;
    this._dochange({
      attr:"title",
      content:title
    })
  },
  setIndex:function(index){
    this.index=index;
    this._dochange({
      attr:"index",
      content:index
    })
  },
  setMessage:function(message){
    this.message=message;
    this._dochange({
      attr:"message",
      content:message
    })
  },
  show:function(){
    this._show=true;
    this._dochange({
      attr:"show",
      content:true
    })
  },
  hide:function(){
    this._show=false;
    this._dochange({
      attr:"show",
      content:false
    })
  },
  on:function(event,callback){
    if(this._events[event]){
      this._events[event].push(callback);
    }
  },
  _dochange:function(dt){
    var _=this;
    this._events.change.forEach(function(callback){
      callback(dt,_);
    });
  }
}
return SettingItem;
})();