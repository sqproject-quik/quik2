function showOpenFilePicker() {
    return new Promise((resolve, reject) => {
      var inp = document.createElement('input');
      inp.type = 'file';
      document.body.append(inp);
      inp.style.display = 'none';
      inp.click();
      inp.onchange = () => {
        resolve(inp.files);
        inp.remove();
      }
    })
}

var onshows_fns = [];
function Onshow(f) {
  onshows_fns.push(f)
}

function getShowFns(){
    return onshows_fns;
}

module.exports={
    showOpenFilePicker,
    Onshow,
    getShowFns
}