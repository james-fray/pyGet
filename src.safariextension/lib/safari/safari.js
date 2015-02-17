var app = {}

app.Promise = Q.promise;
app.Promise.defer = Q.defer;

app.storage = {
  read: function (id) {
    return localStorage[id] || null;
  },
  write: function (id, data) {
    localStorage[id] = data + "";
  }
}

app.button = (function () {
  var callback,
      toolbarItem = safari.extension.toolbarItems[0];
  safari.application.addEventListener("command", function (e) {
    exports.tab.open();
  }, false);

  return {
    set label (val) {
      toolbarItem.toolTip = val;
    }
  }
})();

app.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      safari.application.activeBrowserWindow.activeTab.url = url;
    }
    else {
      safari.application.activeBrowserWindow.openTab(inBackground ? "background" : "foreground").url = url;
    }
  },
  list: function () {
    var wins = safari.application.browserWindows;
    var tabs = wins.map(function (win) {
      return win.tabs;
    });
    tabs = tabs.reduce(function (p, c) {
      return p.concat(c);
    }, []);
    return new app.Promise(function (a) {a(tabs)});
  }
}

app.version = function () {
  return safari.extension.displayVersion;
}

app.timer = window;

app.content_script = (function () {
  var callbacks = {};
  safari.application.addEventListener("message", function (e) {
    if (callbacks[e.message.id]) {
      callbacks[e.message.id](e.message.data);
    }
  }, false);
  return {
    send: function (id, data, global) {
      if (global) {
        safari.application.browserWindows.forEach(function (browserWindow) {
          browserWindow.tabs.forEach(function (tab) {
            if (tab.page) tab.page.dispatchMessage(id, data);
          });
        });
      }
      else {
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(id, data);
      }
    },
    receive: function (id, callback) {
      callbacks[id] = callback;
    }
  }
})();
