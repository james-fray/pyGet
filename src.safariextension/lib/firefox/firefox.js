// Load Firefox based resources
var self          = require("sdk/self"),
    data          = self.data,
    sp            = require("sdk/simple-prefs"),
    buttons       = require("sdk/ui/button/action"),
    prefs         = sp.prefs,
    pageMod       = require("sdk/page-mod"),
    tabs          = require("sdk/tabs"),
    timers        = require("sdk/timers"),
    loader        = require('@loader/options'),
    array         = require('sdk/util/array'),
    unload        = require("sdk/system/unload"),
    {Cc, Ci, Cu}  = require('chrome');

Cu.import("resource://gre/modules/Promise.jsm");

//toolbar button
exports.button = (function () {
  var button = buttons.ActionButton({
    id: self.name,
    label: "pyGet p2p file sharing",
    icon: {
      "16": "./icons/16.png",
      "32": "./icons/32.png"
    },
    onClick: function() {
      exports.tab.open(data.url("./ui/index.html"));
    }
  });
  return {
    onCommand: function (c) {
      onClick = c;
    },
    set label (val) {
      button.label = val;
    }
  }
})();

var workers = [], content_script_arr = [];
pageMod.PageMod({
  include: ["*"],
  contentScriptFile: data.url("./ui/shadow_index.js"),
  contentScriptWhen: "start",
  contentStyleFile : data.url("./ui/index.css"),
  contentScriptOptions: {
    base: loader.prefixURI + loader.name + "/"
  },
  onAttach: function(worker) {
    array.add(workers, worker);
    worker.on('pageshow', function() { array.add(workers, this); });
    worker.on('pagehide', function() { array.remove(workers, this); });
    worker.on('detach', function() { array.remove(workers, this); });
    content_script_arr.forEach(function (arr) {
      worker.port.on(arr[0], arr[1]);
    });
  }
});

exports.storage = {
  read: function (id) {
    return Promise.resolve((prefs[id] || prefs[id] + "" == "false" || !isNaN(prefs[id])) ? (prefs[id] + "") : null)
  },
  write: function (id, data) {
    data = data + "";
    if (data === "true" || data === "false") {
      prefs[id] = data === "true" ? true : false;
    }
    else if (parseInt(data) + '' === data) {
      prefs[id] = parseInt(data);
    }
    else {
      prefs[id] = data + "";
    }
    return Promise.resolve();
  }
}

exports.content_script = {
  send: function (id, data, global) {
    workers.forEach(function (worker) {
      if (!global && worker.tab != tabs.activeTab) return;
      if (!worker) return;
      worker.port.emit(id, data);
    });
  },
  receive: function (id, callback) {
    content_script_arr.push([id, callback]);
  }
}

exports.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      tabs.activeTab.url = url;
    }
    else {
      tabs.open({
        url: url,
        inBackground: typeof inBackground == 'undefined' ? false : inBackground
      });
    }
  },
  list: function () {
    var temp = [];
    for each (var tab in tabs) {
      temp.push(tab);
    }
    return Promise.resolve(temp);
  }
}

exports.version = function () {
  return self.version;
}

exports.timer = timers;

unload.when(function () {
  exports.tab.list().then(function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url === data.url("ui/index.html")) {
        tab.close();
      }
    });
  });
})
