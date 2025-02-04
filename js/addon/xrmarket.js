const toast = require("../toast");
const util = require("../util");
const { addon_dialog_d } = require("./xrcore");
const core = require('./_core');
var def_addon_icon = window.isExt ? ("chrome-extension://" + window.extid + "/assets/def_addon.png") : "./assets/def_addon.png"

var market_l = util.query(addon_dialog_d, '.content .p.ma ul');
var isloaded=false;

util.query(addon_dialog_d,'.l .item[data-p="1"]').addEventListener('click',function(){
    if(!isloaded){
        isloaded=true;
        loadmarket();
    }
})

function loadmarket(){
    core.loadMarketData().then((res)=>{
        market_l.querySelector('.loading-p').remove();
        for(var k in res){
            xrmarketItem(res[k],k);
        }
    }).catch((e)=>{
        console.log(e);
        market_l.innerHTML='<p>加载失败，点击<a href="javascript:;">重试</a></p>'
        util.query(market_l,'a').onclick=()=>{
            market_l.innerHTML='<div class="loading-p"><div class="g"></div></div>'
            loadmarket();
        };
    })
}

function xrmarketItem(addon,id){
    var li = util.element('li');
    li.innerHTML = require('./mb/market_item.mb.html').replace(/{deficon}/g,def_addon_icon);
    li.dataset.id = id;
    li.onclick = ()=> {
        market_l.querySelectorAll('li').forEach((li)=>{
            li.classList.remove('active');
        })
        li.classList.add('active');
    }
    util.query(li, '.n>img').src = addon.icon || def_addon_icon;
    util.query(li, '.n .ds .name span').innerText = addon.name;
    var ms = util.query(li, '.n .ds .message span', true);
    ms[0].innerText = addon.author || '不详';
    ms[1].innerText = addon.version || '';
    ms[2].innerText = '';
    util.query(li, '.d .desc').innerText = addon.desc || '';
    util.query(li, '.d .website').innerText = addon.website || '';
    market_l.appendChild(li);

    var hastheaddon=core.getAddonByMarketId(id);
    if(hastheaddon){
        util.query(li,'.btn.install').style.display='';
        if(hastheaddon.version_code<addon.version_code){
            util.query(li,'.btn.update').style.display='block';
        }else{
            util.query(li,'.btn.installed').style.display='block';
        }
    }

    util.query(li,'.btn.install').addEventListener('click',function(){
        this.style.display='';
        ms[2].innerText='正在安装...(0%)';
        var p=core.installByOfficialMarket(id);
        p.on('progress',function(pr){
            ms[2].innerText='正在安装...('+parseInt(pr*100)+'%)';
        })
        p.on('done',function(){
            ms[2].innerText='安装完成';
            util.query(li,'.btn.installed').style.display='block';
            toast.show('插件 “'+addon.name+'” 安装完成')
        })
        p.on('error',function(err){
            ms[2].innerText='安装出错（'+err.msg+'）';
            util.query(li,'.btn.install').style.display='block';
            toast.show('插件 “'+addon.name+'” 安装出错（'+err.msg+'）')
        })
    })

    util.query(li,'.btn.update').addEventListener('click',function(){
        this.style.display='';
        ms[2].innerText='正在更新...';
        core.update(hastheaddon.id).then(()=>{
            ms[2].innerText='更新完成';
            util.query(li,'.btn.installed').style.display='block';
            toast.show('插件 “'+addon.name+'” 更新完成')
        });
    })
    
}

core.on('uninstall',function(addon){
    if(addon.marketId){
        var li=util.query(market_l,'li[data-id="'+addon.marketId+'"]');
        if(li){
            util.query(li,'.btn.install').style.display='block';
            util.query(li,'.btn.installed').style.display='';
        }
    }
})

var searchbox=util.query(addon_dialog_d,'.addon-search-box');
util.query(searchbox,'input').addEventListener('keydown',function(e){
    if(e.key=='Enter'&&this.value.trim()){
        dosearch(this.value.trim());
    }
})

util.query(searchbox,'input').addEventListener('input',function(){
    if(!this.value.trim()){
        util.query(market_l,'li',true).forEach(li=>{
            li.style.display='';
        })
    }
})
util.query(searchbox,'button').addEventListener('click',function(e){
    if(util.query(searchbox,'input').value.trim()){
        dosearch(this.value.trim());
    }
})

function dosearch(v){
    util.query(market_l,'li',true).forEach(li=>{
        if(util.query(li,'.name span').innerText.indexOf(v)==-1){
            li.style.display='none';
        }else{
            li.style.display='';
        }
    })
}