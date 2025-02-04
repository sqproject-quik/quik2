const { alert } = require("../dialog/dialog_utils");
const {storage} = require("../storage");
const { getStorageList, getAllStorage } = require("../storage");
const { abortSync } = require("./web");

async function getJSON(config) {
  var jl = getStorageList();
  var ast = getAllStorage();
  var a = {};
  for (var i = 0; i < config.length; i++) {
    var k = config[i];
    if (jl[k]) {
      a[k] = {
        title: jl[k].title || k,
        desc: jl[k].desc || '',
        addon: jl[k].addon,
        data: null
      };
      try {
        if (jl[k] && jl[k].sync) {
          if (jl[k].get) {
            a[k].data = await jl[k].get();
          } else {
            a[k].data = await dget(ast[k]);
          }
        }
      } catch (e) {
        throw new Error('在获取 ' + k + ' 时遇到错误', e);
      }
    } else {
      console.warn(k + ' 存储区域不存在');
    }
  }
  return a;
}

async function dget(n) {
  var m = {};
  for (var k2 in n) {
    if (typeof n[k2] == 'string' && n[k2][0] == '^') {
      var j = {
        "^_t": "db",
        "^_k": n[k2],
        "^_d": await localforage.getItem(n[k2])
      }
      try {
        JSON.stringify(j);
        m[k2] = j;
      } catch (e) {
        console.warn('非json支持格式存储不同步');
      }
    } else {
      m[k2] = n[k2];
    }
  }
  return m;
}

async function dwrite(ast, k, j) {
  for (var k2 in j) {
    if (j[k2]['^_t'] == 'db' && j[k2]['^_k']) {
      if (storage.checkIDB()) {
        await localforage.setItem(j[k2]['^_k'], j[k2]['^_d']);
        ast[k][k2] = j[k2]['^_k'];
      } else {
        throw new Error('Your browser is not support indexedDB,Please update your browser.');
      }
    } else {
      ast[k][k2] = j[k2];
    }
  }
}

var rewrite = 'rewrite', compare = 'compare';

async function setJSON(json, config) {
  console.log(json);
  abortSync();
  var jl = getStorageList();
  var alls = getAllStorage();
  var ast = {};
  for (var k in json) {
    if (config[k]) {
      if (jl[k]) {
        ast[k] = alls[k];
        if (config[k] == rewrite) {
          if (typeof jl[k].rewrite == 'function') {
            await jl[k].rewrite(ast, k, json[k].data);
          } else {
            await dwrite(ast, k, json[k].data);
          }
        } else if (config[k] == compare) {
          if (typeof jl[k].compare == 'function') {
            await jl[k].compare(ast, k, json[k].data);
          } else {
            throw new Error(k + ' 不支持compare')
          }
        }

      } else {
        if (json[k].addon) {
          console.warn(k + ' 存储区域不存在，但提示需先安装插件，插件URL: ' + json[k].addon);
        } else {
          console.warn(k + ' 存储区域不存在');
        }
      }
    }

  }

  var o = JSON.parse(localStorage.quik2);
  for (var k in ast) {
    o[k] = ast[k];
  }
  localStorage.quik2 = JSON.stringify(o);
  alert('数据导入成功，请重新加载页面', () => {
    if (location.hash.indexOf(';') != -1) {
      location.hash = location.hash.split(';')[0] + ';newnow'
    } else {
      location.hash = '#newnow'
    }
    location.reload();
  })
}

module.exports = { getJSON, setJSON }
