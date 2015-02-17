(function (window, document) {
  xtag.register('x-vbox', {
    "extends": 'span',
    lifecycle: {
      created: function () {
        if (!Boolean(this.hidden)) {
          this.style.display = "flex";
          this.style.display = "-webkit-flex";
        }
        this.style.flexDirection = "column";
        this.style["-webkit-flex-direction"] = "column";
      }
    },
    accessors: {
      "pack": {
        attribute: {name: "pack"},
        set: function (val) {
          if (val === "end") val = "flex-end";
          if (val === "start") val = "flex-start";
          this.style.justifyContent = val;
          this.style["-webkit-justify-content"] = val;
        }
      },
      "align": {
        attribute: {name: "align"},
        set: function (val) {
          if (val === "end") val = "flex-end";
          if (val === "start") val = "flex-start";
          this.style.alignItems = val;
          this.style["-webkit-align-items"] = val;
        }
      },
      "flex": {
        attribute: {name: "flex"},
        set: function (val) {
          this.style.flex = val;
          this.style["-webkit-flex"] = val;
        }
      },
      "hidden": {
        attribute: {name: "hidden"}
      }
    }
  });
})(window, document);
