import fs from 'fs';
import path from 'path';
import cleanCSS from "clean-css";
import uglifyJs from "./util/minijs.js";
import htmlMinifier from "./util/minihtml.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.time('all');
console.time('init');

function getCode(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path,(err,data) => {
      if (err) {
        console.log('err');
        reject(err);
      } else {
        resolve(data.toString() + '\n');
      }
    })
  })
}

var reg = /(?<!\.)require\s*\(.*?\)/g;
var defCode = `(function(modules){var ranmodules={};function require(e){ranmodules[e]||run(e);return ranmodules[e].exports}function run(e){var r={exports:{}};ranmodules[e]=r,modules[e](require,r);}run(0);})({`;

var d = {
  '.css': function (code) {
    code = 'var style=document.createElement("style");style.innerHTML=`' + new cleanCSS().minify(code).styles.replace(/`/g, '\\`') + '`;document.head.appendChild(style);';
    return code;
  },
  '.json': function (code) {
    code = 'var json=' + code + ';module.exports=json;';
    return code;
  },
  '.html':function(code){
    code = 'module.exports=`' + htmlMinifier.minify(code, {
      collapseWhitespace: true,
      removeComments: true
    }).replace(/`/g, '\\`') + '`;';
    return code;
  },
  def: function (code) {
    code = 'module.exports=`' + code.replace(/`/g, '\\`') + '`;';
    return code;
  }
};

function installExt(ext, func) {
  d[ext] = func;
}

async function build(path) {
  var codes = {
    code: {},
    id: {},
    length: 0,
  };
  await parseRem(path, codes);
  var code = defCode + (() => {
    var str = '';
    for (var i = 0; i < codes.length; i++) {
      str += i + ':(function(_r,module){' + codes.code[i] + '}),';
    }
    return str;
  })() + '})';
  return code;
}

async function parseRem(src, codes, rootPath = '') {
  if (src[0] === '.' && rootPath) {
    src = path.join(rootPath, src);
  }
  if (src[src.length - 1] == '/') {
    src += 'index.js';
  } else {
    var st;
    try{
      var st=fs.statSync(src);
      if (st.isDirectory()==true) {
        src =path.join(src,'index.js');
      } else {
        if (!path.extname(src)) {
          src =src.trim()+'.js';
        }
      }
    }catch(e){
      src =src.trim()+'.js';
    }
    
  }

  if (codes.id[src]) return codes.id[src];
  console.log(src);
  let code;
  try {
    code = await getCode(src);
  } catch (e) {
    console.log(e);
    throw new Error(JSON.stringify({
      message: 'Failed to load ' + src,
      error: e.message
    }))

  }
  codes.length++;
  var id = codes.length - 1;
  codes.id[src] = id;
  if (path.extname(src) === '.js' || path.extname(src) === '.cjs') {
    var requires = code.match(reg);
    if (requires) {
      for (var i = 0; i < requires.length; i++) {
        var requireStr = requires[i];
        var requirePath = eval(requireStr.replace('require(', '').replace(')', ''));
        try {
          var id_ = await parseRem(requirePath, codes, path.dirname(src));
          code = code.replace(requireStr, '_r(' + id_ + ')');
        } catch (e) {
          console.warn('Failed to load ' + requirePath + ' in ' + src, e.message);
        }

      }
    }
  } else if (d[path.extname(src)]) {
    code = d[path.extname(src)](code);
    if (code instanceof Promise) {
      code = await code;
    }
  } else {
    code = d.def(code);
  }

  codes.code[id] = code;
  return id;
}

function zhuanyi(code) {
  return "\"" + code.replace(/"/g, '\\"').replace(/\r\n/g, '\\n').replace(/\n/g, '\\n').replace(/\t/g, "\\t") + "\"";
}

console.timeEnd('init');

console.time('updateVersion');
var v = parseInt(fs.readFileSync(path.join(__dirname, 'docs/version'))) + 1;
fs.writeFileSync(path.join(__dirname, 'docs/version'), v.toString());
console.timeEnd('updateVersion');

console.time('build');
build(path.join(__dirname, 'index.js')).then(function (code) {
  code = code.replace('\'${VERSION_CODE}\'', v);
  fs.writeFileSync(path.join(__dirname, 'index-b.js'), code);
  console.timeEnd('build');
  // fs.writeFileSync(path.join(__dirname,'docs/index.bundle.js'),code);

  console.time('uglify');
  uglifyJs.minify(code, {
    compress: {
      drop_console: true
    }
  }).then(function (result) {
    fs.writeFileSync(path.join(__dirname, 'docs/index.bundle.js'), result.code);
    console.timeEnd('uglify');
  })
});

console.time('cssbuild');
var css = fs.readFileSync(path.join(__dirname, 'index.css')).toString();
var cssmatch = css.match(/@import\s*url\(.*\);/g);

cssmatch.forEach(function (item) {
  var p = item.substring(item.indexOf('(') + 1, item.lastIndexOf(')'));
  if (p.indexOf('./') == 0) {
    css = css.replace(item, fs.readFileSync(path.join(__dirname, p)).toString())
  }
})
fs.writeFileSync(path.join(__dirname, 'index-b.css'), css);
console.timeEnd('cssbuild');
console.time('cssminify');
fs.writeFileSync(path.join(__dirname, 'docs/index.bundle.css'), new cleanCSS().minify(css).styles);
console.timeEnd('cssminify');

console.time('htmlbuild');
let _h = fs.readFileSync(path.join(__dirname, 'index.html')).toString().replace(/<!-- dev -->[\s\S]*<!-- dev end -->/g, '')
  .replace('index.css', 'index.bundle.css')
  .replace('index.js', 'index.bundle.js')
  .replace('type="text/cjs"', '')
  .replace('<!-- register sw -->', `<script>
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
fs.writeFileSync(path.join(__dirname, 'docs/index.html'), htmlMinifier.minify(_h, {
  collapseWhitespace: true,
  removeComments: true
}));
console.timeEnd('htmlbuild');

console.time('copy');
function gmjs(a) {
  var c = fs.readFileSync(path.join(__dirname, a + '.js')).toString();
  uglifyJs.minify(c, {
    compress: {
      drop_console: true
    }
  }).then(function (result) {
    fs.writeFileSync(path.join(__dirname, 'docs/' + a + '.js'), result.code);
  })
}

fs.writeFileSync(path.join(__dirname, 'docs/sw.js'), fs.readFileSync(path.join(__dirname, 'sw.js')));
gmjs('updates');
gmjs('quik1');
console.timeEnd('copy');

console.timeEnd('all');
