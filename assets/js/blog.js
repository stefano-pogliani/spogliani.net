define(function(require) {
  var $ = require("jquery");
  var Moment = require("moment");

  var NAV_ANIMATE_DURATION = 200;
  var NAV_TOP_DELTA = 5;
  var SCROLL_DELAY = 200;

  var blog_nav_scroll = function blog_nav_scroll() {
    var nav_expander = $("#blog-side-expand");
    var nav = $("#blog-side-nav");
    if (nav_expander.is(":visible")) {
      return;
    }

    var nav_top = $("div.row.nav").outerHeight();
    var win_top = $(window).scrollTop();

    var marginTop = Math.max(0, win_top - nav_top + NAV_TOP_DELTA);
    nav.stop().animate({ marginTop: marginTop }, NAV_ANIMATE_DURATION);
    return;
  };

  var blog_init = function blog_init() {
    // Bind scroll to top.
    $("span.blog.back-to-top").on("click", function() {
      $("html,body").animate({ scrollTop: 0 }, SCROLL_DELAY);
    });

    // Show/hide nav menu on small devices.
    $("#blog-side-expand").on("click", function() {
      $("#blog-side-nav").toggleClass("hidden-xs");
    });

    // Convert all moment dates.
    $("span.moment.date-ago").each(function() {
      var el = $(this);
      var date = Moment(el.data("date"));
      el.text(date.fromNow());
    });
  };

  $(window).on("scroll", blog_nav_scroll);
  $(window).on("resize", blog_nav_scroll);
  $(blog_init);
});
