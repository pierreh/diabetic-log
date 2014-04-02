(function(_wnd, _doc, $){

  var currentInput = null;

  function showKeypad() {
    var p = $(currentInput).position();
    $('#n_keypad').show('fast');
  }

  function hideKeypad() {
    currentInput = null;
    $('#n_keypad').hide('fast');
  }


  $(_doc).ready(function () {
    // when a new mobile page loads...

    $('input[type="number"]').click(function (e) {
      currentInput = this;
      showKeypad();
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

  }); // --- _doc.mobileinit

  $(_doc).ready(function(){

    $('#n_keypad').find('a[data-role="button"]').css({display: 'block'});

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
    $('.done').click(function () {
      hideKeypad();
    });

  }); // --- doc.ready

}(window, document, jQuery));