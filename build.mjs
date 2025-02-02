import fs from 'fs';
import path from 'path';
import cleanCSS from "clean-css";
import uglifyJs from "./util/minijs.js";
import htmlMinifier from "./util/minihtml.js"; 
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var reg = /_REQUIRE_\s*\(.*?\)/g;
var cache = {};
var qjs = function (src, cb, rootPath) {
  if (src[0] === '.' && rootPath) {
    src = path.join(rootPath, src);
  }
  var code=fs.readFileSync(src).toString();
  if(src.lastIndexOf('.js')==src.length-3){
    ijs(code, function (code) {
      cache[src] = code;
      cb(code, src);
    }, src)
  }else if(src.lastIndexOf('.html')==src.length-5){
    code=htmlMinifier.minify(code,{
      collapseWhitespace:true,
      removeComments:true
    });
    cache[src] = code;
    cb(code, src);
  }else{
    cache[src] = code;
    cb(code, src);
  }
  

}
var ijs = function (code, cb, rootPath) {
  var bcbs = [];
  var matches = code.match(reg);
  if (matches) {
    matches.forEach(function (item, index) {
      var url=eval(item.substring(item.indexOf('(')+1,item.lastIndexOf(')')));
      if(cache[url]){
        if(url.lastIndexOf('.js')==url.length-3||url.lastIndexOf('.json')==url.length-5){
          code=code.replace(item,cache[url]);
        }else{
          code=code.replace(item,zhuanyi(cache[url]));
        }
      }else{
        bcbs.push(new Promise(function(r,j){
          qjs(url,function(codes){
            if(url.lastIndexOf('.js')==url.length-3||url.lastIndexOf('.json')==url.length-5){
              code=code.replace(item,codes);
            }else{
              code=code.replace(item,zhuanyi(codes));
            }
            r();
          },path.dirname(rootPath))
        }));
          
      }
    })
    if (bcbs.length == 0) {
      cb(code);
    } else {
      Promise.all(bcbs).then(function () {
        cb(code);
      })
    }
  } else {
    cb(code);
  }
}

function zhuanyi(code){
  return "\""+code.replace(/"/g,'\\"').replace(/\r\n/g,'\\n').replace(/\n/g,'\\n').replace(/\t/g,"\\t")+"\"";
}

var v=parseInt(fs.readFileSync(path.join(__dirname,'docs/version')))+1;
fs.writeFileSync(path.join(__dirname,'docs/version'),v.toString());

qjs(path.join(__dirname,'index.js'), function (code) {
  code=code.replace('\'${VERSION_CODE}\'',v);
  fs.writeFileSync(path.join(__dirname,'index-b.js'),code);
  // fs.writeFileSync(path.join(__dirname,'docs/index.bundle.js'),code);
  uglifyJs.minify(code,{
    compress:{
      drop_console:true
    }
  }).then(function(result){
    fs.writeFileSync(path.join(__dirname,'docs/index.bundle.js'),result.code);
  })
});

var css=fs.readFileSync(path.join(__dirname,'index.css')).toString();
var cssmatch=css.match(/@import\s*url\(.*\);/g);

cssmatch.forEach(function(item){
  var p = item.substring(item.indexOf('(') + 1, item.lastIndexOf(')'));
  if(p.indexOf('./')==0){
    css=css.replace(item,fs.readFileSync(path.join(__dirname,p)).toString())
  }
})
fs.writeFileSync(path.join(__dirname,'index-b.css'),css);
fs.writeFileSync(path.join(__dirname,'docs/index.bundle.css'),new cleanCSS().minify(css).styles);

let _h=fs.readFileSync(path.join(__dirname,'index.html')).toString().replace(/<!-- dev -->[\s\S]*<!-- dev end -->/g,'')
.replace('index.css','index.bundle.css')
.replace('index.js','index.bundle.js')
.replace('type="text/rem"','')
.replace('<!-- register sw -->',`<script>
// register sw
if('serviceWorker' in navigator&&!window.isExtNative){
  navigator.serviceWorker.register('./sw.js',{
    scope:"./"
  });
}else if(localStorage.getItem('no-sw')){
  setTimeout(function(){
    new quik.notice({
      title:"提示",
      content:"当前浏览器不支持serviceWorker，无法使用离线缓存功能",
    }).show();
  })
  localStorage.setItem('no-sw','1');
}
</script>`)
fs.writeFileSync(path.join(__dirname,'docs/index.html'),htmlMinifier.minify(_h,{
  collapseWhitespace: true,
  removeComments: true
}));

function gmjs(a){
  var c=fs.readFileSync(path.join(__dirname,a+'.js')).toString();
  uglifyJs.minify(c,{
    compress:{
      drop_console:true
    }
  }).then(function(result){
    fs.writeFileSync(path.join(__dirname,'docs/'+a+'.js'),result.code);
  })
}

fs.writeFileSync(path.join(__dirname,'docs/sw.js'),fs.readFileSync(path.join(__dirname,'sw.js')));
gmjs('updates');
gmjs('quik1');
