(function(_wnd, _doc, $) {

  _wnd.diabeticlog = _wnd.diabeticlog || {}

  var dl = _wnd.diabeticlog;

  var current = null;

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


  $(_doc).delegate("#bmentry", "pageinit", function () {
    if (!dl.hasLocalStorage()) {
      alert('no storage available');
      return;
    }

    if (dl.isDebug) {
      $('#footer-bottom').append('<div>[DEBUG MODE]</div>');
    }

    $('#n_keypad').on('show', function() {
      $("#navbar").hide();
    });

    $('#n_keypad').on('hide', function() {
      $("#navbar").show();
    });

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
      dl.syncApi.getQ
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

}(window, document, jQuery));