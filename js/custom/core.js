const getEventHandle = require("../event");
const { settingSto } = require("../setting/index");

var initsto=settingSto;
var eventHandle=getEventHandle();
var on=eventHandle.on;
var off=eventHandle.off;
var doevent=eventHandle.doevent;

module.exports={
    initsto,
    on,
    off,
    doevent
}