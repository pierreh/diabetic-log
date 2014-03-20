(function (_wnd, _doc, $) {

  var dl = _wnd.diabeticlog = _wnd.diabeticlog || {}

  dl.appname = "diabetic-log";

  dl.isDebug = false;

  dl._online = false;

  dl.debug = function (m) {
    if (dl.isDebug) {
      console.log(m);
    }
  }

  dl.hasLocalStorage = function() {
    try {
      return 'localStorage' in _wnd && _wnd['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  // add custom show/hide event handler binding
  $.each(['show', 'hide'], function (i, ev) {
    var el = $.fn[ev];
    $.fn[ev] = function () {
      this.trigger(ev);
      return el.apply(this, arguments);
    };
  });

  //=======================================================================


  function signedIn(userinfo) {
    $('#userinfo')
      .html(userinfo.name)
      .show();
    $('#signin').hide();
  }

  function signedOut() {
    $('#userinfo').hide('');
    $('#signin').show();
  }

  function loadGoogleApi() {
    console.debug("Loading Google Client API...");
    var script = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = "https://apis.google.com/js/client.js?onload=gapiInit";
    $("body").append(script);
  }


  function appCacheEventHandler(e) {
    console.log("ApplicationCache event: " + e.type);
  }

  function appCacheOnline(e) {
    console.log("ApplicationCache online (" + e.type + ")");
    dl._online = true;
    loadGoogleApi();
  }

  function appCacheObsolete() {
    console.log("ApplicationCache obsolete");
    _wnd.location.reload();
  }

  function appCacheOffline() {
    console.log("ApplicationCache offline");
    dl._online = false;
    signedOut();
    $('#signin').hide();
    $("#syncinfo").html("offline");
  }

  $(_doc).ready(function () {

    signedOut();

    $('#signin')
      .click(function () {
        diabeticlog.authorize(function () {
          if (diabeticlog.isSignedIn()) {
            signedIn(diabeticlog.getUserinfo());
          } else {
            signedOut();
          }
        });
      })
      .hide();

    _wnd.gapiInit = function() {
      console.debug("Google Client API loaded");
      diabeticlog.initApi(function () {
        console.log("API initialized");
        $('#signin').show();
        if (diabeticlog.isSignedIn()) {
          $("#syncinfo").html("online");
          signedIn(diabeticlog.getUserinfo());
        } else {
          $("#syncinfo").html("not signed in");
          signedOut();
        }
      });
    }

    setTimeout(function () {
      // Hide the address bar!
      _wnd.scrollTo(0, 1);
    }, 0);

    $(_wnd.applicationCache)
      .on("error", appCacheOffline)
      .on("obsolete", appCacheObsolete)
      .on("noupdate", appCacheOnline)
      .on("cached", appCacheOnline)
//      .on("checking", appCacheEventHandler)
//      .on("downloading", appCacheEventHandler)
//      .on("progress", appCacheEventHandler)
      .on("updateready", appCacheEventHandler)
    ;

  }); // -- document.ready



}(window, document, jQuery))