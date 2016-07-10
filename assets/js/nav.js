define(function(require) {
  var $ = require("jquery");

  var button_click = function button_click() {
    var href = $(this).children("a").attr("href");
    window.location = href;
  };

  $(function init() {
    $(".row.nav nav button.link").on("click", button_click);
  });
});
