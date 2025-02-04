var events = [];
function getEventHandle() {
  var ev_i = events.length;
  events.push({});
  return {
    on(ev, fn) {
      if (!events[ev_i][ev]) events[ev_i][ev] = [];
      events[ev_i][ev].push(fn);
      return true;
    },
    off(ev, fn) {
      if (!events[ev_i][ev]) return false;
      for (var i = 0; i < events[ev_i][ev].length; i++) {
        if (events[ev_i][ev][i] === fn) {
          events[ev_i][ev].splice(i, 1);
          return true;
        }
      }
      return false;
    },
    doevent(ev, args) {
      if (!events[ev_i][ev]) return false;
      if (!Array.isArray(args)) args = [args];
      for (var i = 0; i < events[ev_i][ev].length; i++) {
        events[ev_i][ev][i].apply(null, args);
      }
      return true;
    }
  }
}

module.exports = getEventHandle;