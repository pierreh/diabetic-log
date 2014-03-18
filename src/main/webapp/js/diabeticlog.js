(function (_wnd, _doc, $) {

  var isDebug = false;

  var dl = _wnd.diabeticlog = _wnd.diabeticlog || {}

  var appname = dl.appname = "diabetic-log";

  dl._online = false;

  var debug = function (m) {
    if (isDebug) {
      console.log(m);
    }
  }

  var error = function (e) {
    console.error(e);
  }

  var months = new Array();
  months[0] = "January";
  months[1] = "February";
  months[2] = "March";
  months[3] = "April";
  months[4] = "May";
  months[5] = "June";
  months[6] = "July";
  months[7] = "August";
  months[8] = "September";
  months[9] = "October";
  months[10] = "November";
  months[11] = "December";

  var days = [
    "Monday",
    "Thuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  function supports_html5_storage() {
    try {
      return 'localStorage' in _wnd && _wnd['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  function Day(date) {
    this.entries = [];
    this.date = date;
    this.activeIndex = -1;
  }

  Day.prototype.add = function () {
    var e = { time: new Date().toTimeField() };
    this.entries.push(e);
    this.activeIndex = this.entries.length - 1;
    this.dirty = true;
  }

  Day.prototype.active = function () {
    if (this.activeIndex >= 0 && this.activeIndex < this.entries.length) {
      return this.entries[this.activeIndex];
    } else {
      return null;
    }
  }

  Day.prototype.next = function () {
    if (this.activeIndex < (this.entries.length - 1)) {
      this.activeIndex++;
    }
  }

  Day.prototype.previous = function () {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  Day.prototype.first = function () {
    this.activeIndex = 0;
  }

  Day.prototype.last = function () {
    this.activeIndex = this.entries.length - 1;
  }

  Day.prototype.averageGlucose = function () {
    var sum = 0;
    var count = 0;
    for (e in this.entries) {
      if (this.entries[e].glucose) {
        sum += parseFloat(this.entries[e].glucose);
        count++;
      }
    }
    if (count > 0) {
      this.averageGlucose_ = (sum / count).toFixed(1);
    } else {
      this.averageGlucose_ = undefined;
    }
    return this.averageGlucose_;
  }

  Day.prototype.store = function () {
    var key = appname + ".day." + this.date.toDateField();
    this.prune();
    if (this.entries.length == 0) {
      if (localStorage[key]) {
        // pruned record
        debug('removing day from storage because it is empty ' + this.date.toDateField());
        localStorage.removeItem(key);
      }
      return;
    }
    if (!this.dirty) {
      return;
    }
    var r = this.validate();
    if (r.length > 0) {
      alert(r.join('\n'));
      return;
    }
    this.sort();
    var item = { entries: this.entries };
    var s = JSON.stringify(item)
    localStorage[key] = s;
    if (dl.syncApi) {
      dl.syncApi.addToQueue(key);
    } else {
      error('SyncApi not available');
    }
    this.dirty = false;
    debug('Day saved. key : ' + key + " data: " + s);
    if (isDebug) {
      debug('Total number of days stored ' + (Object.keys(localStorage).length));
    }
  }

  Day.prototype.prune = function () {
    for (var i = 0; i < this.entries.length; i++) {
      var e = JSON.parse(JSON.stringify(this.entries[i]));
      if (Object.keys(e).length == 1) {
        // entry only has the time field filled in, prune it
        debug('pruning entry[' + i + '] : ' + JSON.stringify(e));
        this.entries.splice(i, 1);
        if (this.activeIndex >= i) {
          // shift back the activeIndex
          this.activeIndex--;
        }
        i--; // we need to recheck the current index because it will contain the next item after pruning
      }
    }
  }

  Day.prototype.sort = function () {
    debug('before sort: ' + JSON.stringify(this.entries));
    this.entries.sort(function (a, b) {
      var aspl = a.time.split(':');
      var bspl = b.time.split(':');
      return (aspl[0] * 60 + aspl[1]) - (bspl[0] * 60 + bspl[1]);
    });
    debug('after sort: ' + JSON.stringify(this.entries));
  }

  Day.prototype.validate = function () {
    var res = [];
    for (var i = 0; i < this.entries.length; i++) {
      var e = this.entries[i];
      var errors = [];
      if (!e.time || !e.time.match(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) {
        errors.push(' Invalid time');
      }
      if (!validateNumberStr(e.glucose)) {
        errors.push(' Invalid glucose number');
      }
      if (!validateNumberStr(e.insulatard)) {
        errors.push(' Invalid insulatard number');
      }
      if (!validateNumberStr(e.actrapid)) {
        errors.push(' Invalid actrapid number');
      }
      if (errors.length > 0) {
        res.push('Entry ' + (i + 1) + " has errors:");
        res = res.concat(errors);
      }
    }
    return res;
  }

  function validateNumberStr(s) {
    if (typeof s === 'undefined') {
      return true;
    }
    return /^[0-9]{1,2}(\.[0-9])?$/.test(s);
  }

  Day.load = function (date) {
    var s = localStorage[appname + ".day." + date.toDateField()];
    if (s) {
      var item = JSON.parse(s);
      debug("item loaded");
      debug(item);
      var d = new Day(date);
      d.entries = item.entries;
      d.date = date;
      d.activeIndex = d.entries.length - 1;
      return d;
    }
    return null;
  }

//=======================================================================
// Date helper functions
//=======================================================================

  Date.prototype.toDateField = function () {
    return this.toISOString().substr(0, 10);
  }

  Date.prototype.toTimeField = function () {
    return this.toTimeString().substr(0, 5);
  }


//data.prevMonthUrl = scriptUrl + "?month=" + (date.getMonth() - 1) + "&year=" + date.getYear() + "&day=" + date.getDate();
//data.nextMonthUrl = scriptUrl + "?month=" + (date.getMonth() + 1) + "&year=" + date.getYear() + "&day=" + date.getDate();

//data.prevDayUrl = scriptUrl + "?month=" + (date.getMonth()) + "&year=" + date.getYear() + "&day=" + (date.getDate() - 1);
//data.nextDayUrl = scriptUrl + "?month=" + (date.getMonth()) + "&year=" + date.getYear() + "&day=" + (date.getDate() + 1);


  var current = null;

  $(_doc).delegate("#bmentry", "pageinit", function () {
    if (!supports_html5_storage()) {
      alert('no storage available');
      return;
    }

    if (isDebug) {
      $('#footer-bottom').append('<div>[DEBUG MODE]</div>');
    }

    $('#btn-earlier').click(function () {
      var currentDate = new Date(current.date);
      currentDate.setDate(currentDate.getDate() - 1);
      changeToDate(currentDate);
    });

    $('#btn-later').click(function () {
      var currentDate = new Date(current.date);
      currentDate.setDate(currentDate.getDate() + 1);
      changeToDate(currentDate);
    });

    $('#btn-next').click(function () {
      current.next();
      updateForm();
    });

    $('#btn-next').on('taphold', function () {
      current.last();
      updateForm();
      return false;
    });

    $('#btn-prev').click(function () {
      current.previous();
      updateForm();
    });

    $('#btn-prev').on('taphold', function () {
      current.first();
      updateForm();
      return false;
    });

    $('#btn-save').click(function () {
      current.store();
      if (current.entries.length == 0) {
        current.add();
      }
      updateForm();
    });

    $('#btn-add').click(function () {
      current.add();
      updateForm();
    });

    $('#btn-info').click(function () {
    });

    $('#cal').click(function () {
      $('#mydate').trigger('click');
    });

    changeToDate(new Date());

  });

  function fieldUpdate($element, name, value) {
    current.dirty = true;
    if (value === '') {
      var e = current.active();
      e[name] = undefined;
    }
    updateStatus();
  }

  function updateForm() {
    $('#bmentryform').find('input,textarea,select').val('');
    $('#bmentryform').binddata(current.active(), {updateHandler: fieldUpdate});
    //$('input[name="date"]').val(current.date.toDateField());
    $('#entry-title').html(current.date.getDate() + ' ' + (months[current.date.getMonth()]) + ' ' + current.date.getFullYear());
    $('select').selectmenu('refresh');
    updateStatus();
  }

  function updateStatus() {
    if (current.entries.length > 0) {
      var avg = current.averageGlucose();
      if (avg) {
        avg = '[avg: ' + avg + '] ';
      } else {
        avg = '';
      }
      $('#status').html(
        (current.dirty ? '* ' : '')
          + avg
          + '[' + (current.activeIndex + 1) + '/' + current.entries.length + ']');
    } else {
      $('#status').html('');
    }
  }

  function changeToDate(date) {
    current = Day.load(date);
    if (!current) {
      current = new Day(date);
      current.add();
    }
    updateForm();
  }

  $(_doc).on("mobileinit", function () {
    //$.mobile.page.prototype.options.degradeInputs.date = true; // do this when using the datepicker component
    //$.mobile.page.prototype.options.degradeInputs.time = true;
    //$.mobile.page.prototype.options.degradeInputs.number = true;
  });

  $(_doc).ready(function () {

    signedOut();

    var currentInput = null;

    function showKeypad() {
      var p = $(currentInput).position();
      $('#n_keypad')
        .show('fast');
      $('#navbar').hide();
    }

    function hideKeypad() {
      currentInput = null;
      $('#n_keypad').hide('fast');
      $('#navbar').show();
    }

    $('#n_keypad').find('a[data-role="button"]').css({display: 'block'});

    $('input[type="number"]').click(function (e) {
      currentInput = this;
      showKeypad();
    });
    $('.done').click(function () {
      hideKeypad();
    });
    $('input[type="text"]').click(function () {
      hideKeypad();
    });
    $('textarea').click(function () {
      hideKeypad();
    });
    $('input[type="time"]').click(function () {
      hideKeypad();
    });

    $('.digit').click(function () {
      if (currentInput && !isNaN($(currentInput).val())) {
        if (parseInt($(currentInput).val()) == 0) {
          $(currentInput).val($(this).text());
        } else {
          $(currentInput).val($(currentInput).val() + $(this).text());
        }
        $(currentInput).change();
      }
    });

    $('.decimal').click(function () {
      if (currentInput && !isNaN($(currentInput).val()) && $(currentInput).val().length > 0) {
        $(currentInput).val($(currentInput).val() + '.');
        $(currentInput).change();
      }
    });

    $('.del').click(function () {
      $(currentInput).val($(currentInput).val().substring(0, $(currentInput).val().length - 1));
      $(currentInput).change();
    });
    $('.clear').click(function () {
      $(currentInput).val('');
      $(currentInput).change();
    });
    $('.zero').click(function () {
      if (!isNaN($(currentInput).val())) {
        if (parseInt($(currentInput).val()) != 0) {
          $(currentInput).val($(currentInput).val() + $(this).text());
          $(currentInput).change();
        }
      }
    });


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
          signedIn(diabeticlog.getUserinfo());
        } else {
          signedOut();
        }
      });
    }

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


    $(document).ready(function () {

      function loadGoogleApi() {
        console.debug("Loading Google Client API...");
        var script = document.createElement( 'script' );
        script.type = 'text/javascript';
        script.src = "https://apis.google.com/js/client.js?onload=gapiInit";
        $("body").append(script);
      }

      setTimeout(function () {
        // Hide the address bar!
        _wnd.scrollTo(0, 1);
        if (diabeticlog.isOnline()) {

        }
      }, 0);

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
      }

      $(_wnd.applicationCache)
        .on("checking", appCacheEventHandler)
        .on("downloading", appCacheEventHandler)
        .on("progress", appCacheEventHandler)
        .on("updateready", appCacheEventHandler)
        .on("error", appCacheOffline)
        .on("obsolete", appCacheObsolete)
        .on("noupdate", appCacheOnline)
        .on("cached", appCacheOnline)
      ;

    }); // -- document.ready

  });


}(window, document, jQuery))