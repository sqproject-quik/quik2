const { _setDrawerList, dodrawer ,pushBgDrawer, getbg, setbg, on, off, drawbg, initsto} = require('./core.js');
var defDraw = require('./defaultDrawer.js');
var defDrawer = defDraw.drawer;
_setDrawerList([defDrawer]);
dodrawer(defDrawer);

drawbg(initsto.get('bg'));

module.exports={
  neizhiDraw: {
    img: defDraw.draws.img,
    video: defDraw.draws.video,
    color: defDraw.draws.color
  },
  pushBgDrawer,
  getbg,
  setbg,
  on,
  off,
}