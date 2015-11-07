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
  /*$.each(['show', 'hide'], function (i, ev) {
    var el = $.fn[ev];
    $.fn[ev] = function () {
      this.trigger(ev);
      return el.apply(this, arguments);
    };
  });
    */
  _wnd.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  _wnd.loadScript = function(src) {
    var script = _doc.createElement( 'script' );
    script.type = 'text/javascript';
    script.src = src;
    $(_doc.body).append(script);
  }

  // ------------- Event Triggers ----------------------

  dl.syncstate = function(s) {
    $(dl).trigger({ type:"syncstate", state:s });
  }

  // ------------- Helpers ----------------------

  dl.showMessage = function(msg) {
    $("#message").html(msg).show();
  }

  dl.offline = function() {
    dl._online = false;
    $('#signin').hide();
    dl.syncstate("offline");
    $('#userinfo')
      .html("offline")
      .show();
  }

  dl.online = function() {
    $('#signin').show();
    dl._online = true;
    if (dl.isApiInitialized()) {
      if (dl.isSignedIn()) {
        dl.syncstate("signed-in")
        signedIn(dl.getUserinfo());
      } else {
        dl.syncstate("not-signed-in")
        signedOut();
      }
    } else {
      dl.loadGoogleApi();
    }
  }

  var googleApiLoaded = false;
  dl.loadGoogleApi = function() {
    if (googleApiLoaded) {
      return;
    }
    googleApiLoaded = true;
    console.debug("Loading Google Client API...");
    loadScript("https://apis.google.com/js/client.js?onload=gapiInit");
  }

  dl.months = new Array();
  dl.months[0] = "January";
  dl.months[1] = "February";
  dl.months[2] = "March";
  dl.months[3] = "April";
  dl.months[4] = "May";
  dl.months[5] = "June";
  dl.months[6] = "July";
  dl.months[7] = "August";
  dl.months[8] = "September";
  dl.months[9] = "October";
  dl.months[10] = "November";
  dl.months[11] = "December";

  dl.days = [
    "Monday",
    "Thuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

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

  // ----------------- AppCache ----------------


  var appCacheUpdateTimer;


  dl.showDialog = function(content) {

    $("#popupDialog").find(".content").html(content);
    $('#openPopup').click();
  }

  function initAppCache() {

    $(_wnd.applicationCache)
      .on("error", appCacheOffline)
      .on("obsolete", appCacheObsolete)
      .on("noupdate", appCacheOnline)
      .on("cached", appCacheOnline)
//      .on("checking", appCacheEventHandler)
//      .on("downloading", appCacheEventHandler)
//      .on("progress", appCacheEventHandler)
//      .on("updateready", appCacheUpdateReady)
    ;

    var shownBD = false;

    appCacheUpdateTimer = setInterval(function() {
      _wnd.applicationCache.update();

      if (!shownBD && new Date().toDateField() === "2014-04-05") {
        shownBD = true;
        setTimeout(function() {
          dl.showDialog('<img class="popphoto" src="images/white_lotus.jpg" style="width:100%;" alt="Happy Birthday!">' +
            '<div class="text">Happy Birthday! XXX</div>');
        }, 100);
      }
    }, 5000);

  }

  function appCacheEventHandler(e) {
    console.log("ApplicationCache event: " + e.type);
  }

  function appCacheOnline(e) {
    if (!dl.isOnline()) {
      console.debug("ApplicationCache online (" + e.type + ")");
      dl.online();
    }
  }

  function appCacheObsolete() {
    clearInterval(appCacheUpdateTimer);
    dl.showMessage("There is a new version available. <a href='#' onClick='location.reload()'>reload</a>");
  }

  function appCacheOffline() {
    dl.offline();
  }

  // -------------------- Page Init ----------------------

  $(_doc).ready(function () {

    signedOut();

    $('#signin')
      .click(function () {
        dl.authorize(function () {
          if (dl.isSignedIn()) {
            signedIn(dl.getUserinfo());
          } else {
            signedOut();
          }
        });
      })
      .hide();

    _wnd.gapiInit = function() {
      console.debug("Google Client API loaded");
      dl.initApi(function () {
        console.log("API initialized");
        dl.online();
      });
    }

    initAppCache();

    setTimeout(function () {
      // Hide the address bar!
      _wnd.scrollTo(0, 1);
    }, 0);

    dl.syncstate(dl.syncApi.getSyncCount());

  }); // -- document.ready



}(window, document, jQuery))