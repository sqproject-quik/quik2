const dialog = require("../../dialog");
const { initsto } = require("../../omnibox/_core");
const util = require("../../util");
const { refsay, getNowSay } = require("../core");

  var def='海内存知己，天涯若比邻'; 

  if(!initsto.get('usersay')){
    initsto.set('usersay',def);
  }

  var sayseditordialog=null;
  function openSaysEditor(){
    if(!sayseditordialog){
      sayseditordialog=new dialog({
        class:"sayseditordialog",
        content:`<h1>修改一言</h1><div class="content"><p><input class="says-input" type="text"/></p></div><div class="footer"><div class="cancel btn">取消</div><button class="ok btn">确定</button></div>`
      })
      // @note 将cancel按钮修改为div，防止表单submit到cancel
      // @edit at 2024/1/30 15:20
      var d=sayseditordialog.getDialogDom();
      util.query(d,'.cancel.btn').onclick=()=>{
        sayseditordialog.close();
      }
      util.query(d,'.ok.btn').onclick=()=>{
        var v=util.query(d,'.says-input').value;
        initsto.set('usersay',v);
        refsay('user');
        sayseditordialog.close();
      }
    }
    setTimeout(()=>{
      var d=sayseditordialog.getDialogDom();
      sayseditordialog.open();
      util.query(d,'.says-input').value=initsto.get('usersay');
    })
  }
  module.exports= {
    key:"user",
    name:"用户自定义",
    callback(){
      return new Promise((resolve,reject)=>{
        resolve({
        say:initsto.get('usersay'),
        title:"点击修改"});
      });
    },
    click(){
      openSaysEditor();
    },
    menu:[{
      icon:util.getGoogleIcon('e3c9'),
      title:'修改',
      click(){
        openSaysEditor();
      }
    },{
      icon:util.getGoogleIcon('e14d'),
      title:'复制',
      click(){
        var value=getNowSay().say;
        util.copyText(value);
      }
    }]
  }