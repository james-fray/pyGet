(function (window, document) {
  const template =
    '<style scoped>' +
    '  .x-button {position: relative; cursor:pointer; width: 60px; height: 22px; background-repeat: no-repeat; background-position: center center; border-width: 0; background-color: transparent;}' +
    '  .x-button.color {color: #FFF; background-color: #4387fd; border: solid 1px #3973d8;}' +
    '  .x-button.color:hover {background-color: #3973d8;}' +
    '  .x-button.color:active {background-color: #366dcc;}' +
    '  .x-button.color.disabled {color: #A5A5A5; background-color: #F5F5F5; border-color: rgba(0, 0, 0, 0.1);}' +
    '  .x-button:focus {outline: 0;}' +
    '  .x-button i {display: inline-block; border: solid 1px red; width: 20px; height: 20px;}' +
    '</style>' +
    '<canvas style="display: none;"></canvas>' +
    '<input type="button" class="x-button"></input>';

  xtag.register('x-button', {
    lifecycle: {
      created: function() {
        var value = this.textContent;
        this.appendChild(xtag.createFragment(template));
        if (value) {
          this.value = value;
        }
        xtag.addClass(this.querySelector("input"), "color");
      }
    },
    accessors: {
      'width': {
        attribute: {name: "width"},
        set: function (val) {
          this.querySelector("input").style.width = val;
        }
      },
      'height': {
        attribute: {name: "height"},
        set: function (val) {
          this.querySelector("input").style.height = val.replace(";", "");
        }
      },
      'value': {
        attribute: {name: 'value'},
        set: function (val) {
          var button = this.querySelector('input');
          button.value = val;
        }
      },
      'title': {
        attribute: {name: 'title'}
      },
      'icon': {
        attribute: {name: 'icon'},
        set: function () {this.refresh();}
      },
      'icon-left': {
        attribute: {name: 'icon-left'},
        set: function () {this.refresh();}
      },
      'icon-top': {
        attribute: {name: 'icon-top'},
        set: function () {this.refresh();}
      },
      'icon-width': {
        attribute: {name: 'icon-width'},
        set: function () {this.refresh();}
      },
      'icon-top': {
        attribute: {name: 'icon-top'},
        set: function () {this.refresh();}
      },
      'circle': {
        attribute: {name: "circle"},
        set: function (val) {
          if (val === "true") {
            this.querySelector("input").style.borderRadius = "50%";
          }
        }
      },
      'transparent': {
        attribute: {name: "transparent"},
        set: function (val) {
          if (val === "true") {
            xtag.removeClass(this.querySelector("input"), "color");
          }
        }
      },
      'disable': {
        attribute: {name: 'disable'},
        set: function (val) {
          val = val === "true" || val === true ? true : false;
          xtag[val ? "addClass" : "removeClass"](this.querySelector("input"), "disabled");
          this.querySelector("input").disabled = val;
        }
      },
      'css': {
        set: function (css) {
          var style = document.createElement('style');
          style.setAttribute('scoped', "");
          if (style.styleSheet) {
            style.styleSheet.cssText = css;
          }
          else {
            style.appendChild(document.createTextNode(css));
          }
          this.appendChild(style);
        }
      }
    },
    methods: {
      refresh: function () {
        var button = this.querySelector('input');
        button.value = " ";
        var canvas = this.querySelector('canvas');
        var img = new Image;
        var context = canvas.getContext('2d');
        img.onload = function() {
          var width = parseInt(this.getAttribute("icon-width") || img.width);
          var height = parseInt(this.getAttribute("icon-height") || img.height);
          var left = parseInt(this.getAttribute("icon-left") || "0");
          var top = parseInt(this.getAttribute("icon-top") || "0");
          canvas.width = width;
          canvas.height = height;
          context.drawImage(img, left, top);
          button.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
        }.bind(this);
        img.src = this.getAttribute("icon");
      }
    },
    events: {
      'click': function () {
        xtag.fireEvent(this, 'x-command');
      }
    }
  });
})(window, document);
