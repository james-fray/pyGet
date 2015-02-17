(function (window, document) {
  const template =
    '<style scoped>' +
    '  .x-log {display: block; overflow-y: auto; box-sizing: border-box;}' +
    '  .x-log table {border-collapse: collapse; font-size: 100%; cursor: default;}' +
    '  .x-log tr {height: 20px;}' +
    '  .x-log tr:hover {background-color: #d3e6f3;}' +
    '  .x-log tr>td:nth-child(1) {padding: 0 5px; border-right: solid 6px #cbcbcb; width: 10px; color: #7f7f8a;}' +
    '  .x-log tr[type=warning]>td:nth-child(1) {border-color: #fb9500;}' +
    '  .x-log tr[type=error]>td:nth-child(1) {border-right: solid 6px red;}' +
    '  .x-log tr>td:nth-child(2) {padding-left: 15px; width: 100%;}' +
    '  .x-log tr>td {vertical-align: center;}' +
    '</style>' +
    '<div class="x-log">' +
    '  <table width="100%">' +
    '  </table>' +
    '</div>';

  function getTime () {
     var date = new Date();
     return ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2) + "." + ("00" + date.getMilliseconds()).slice(-3);
  }
  function html (tag, attrbs, parent) {
    var elem = document.createElement(tag);
    for (var attrb in attrbs) {
      elem.setAttribute(attrb, attrbs[attrb]);
    }
    if (parent) {
      parent.appendChild(elem);
    }
    return elem;
  }

  xtag.register('x-log', {
    lifecycle:{
      created: function() {
        this.appendChild(xtag.createFragment(template));
      }
    },
    accessors: {
      'width': {
        attribute: {name: "width"},
        set: function(val) {
          this.querySelector(".x-log").style.width = val;
        }
      },
      'height': {
        attribute: {name: "height"},
        set: function(val) {
          this.querySelector(".x-log").style.height = val;
        }
      }
    },
    methods: {
      add: function (msg, type) {
        var tr = html("tr", {
          type: type
        }, this.querySelector("table"));
        html("td", {
          align: "center"
        }, tr).textContent = getTime();
        var td = html("td", {}, tr);
        if (typeof msg === "string") {
          td.textContent = msg;
        }
        else {
          td.innerHTML = "";
          td.appendChild(msg);
        }
        this.querySelector(".x-log").scrollTop = this.querySelector(".x-log").scrollHeight;
      },
      log: function (msg) {
        this.add(msg, "info");
      },
      error: function (msg) {
        this.add(msg, "error");
      },
      warn: function (msg) {
        this.add(msg, "warning");
      }
    }
  });
})(window, document);
