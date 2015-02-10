(function(_wnd, _doc, $){

  _wnd.diabeticlog = _wnd.diabeticlog || {}

  var dl = _wnd.diabeticlog;

  var currentDate = new Date();

  var strings = {
    no_entries: "No entries"
  };

  function changeToDate(date) {
    currentDate = date;

    $ul = $("#log-content ul:first");
    if (dl.isOnline() && dl.isApiInitialized()) {
      $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
      $ul.addClass("ui-loading");
      $ul.listview( "refresh" );
      dl.syncApi.getDay(currentDate.toDateField(), showDay);
    } else {
      $ul.html( "<li><div class='ui-loader'>Offline</div></li>" );
      $ul.addClass("ui-loading");
      $ul.listview( "refresh" );
    }
  }

  dl.logGoToPrevious = function() {
    var d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    changeToDate(d);
  }

  dl.logGoToNext = function() {
    var d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    changeToDate(d);
  }

  function showDay(day) {
    $ul = $("#log-content ul:first");
    var html = '';
    var beforeDate = new Date(currentDate);
    beforeDate.setDate(beforeDate.getDate() - 1);
    html += '<li data-icon="carat-u" class="daynav"><a href="#" onClick="diabeticlog.logGoToPrevious()"><p>'+beforeDate.toDateField() + '</p></a></li>';
    if (day && day.entries) {
      html += '<li data-role="list-divider">'+day.date+'<span class="ui-li-count">'+day.entries.length+'</span></li>';
      $.each(day.entries, function(i,val) {
        html += "<li><a href='#'>";
        html += '<p><strong>';
        html += val.glucose ? 'glucose: ' + val.glucose + ' ' : '';
        html += val.actrapid ? 'actrapid: ' + val.actrapid + ' ' : '';
        html += val.insulatard ? 'insulatard: ' + val.insulatard + ' ' : '';
        html += '</strong></p>';
        html += val.comments ? '<p>' + val.comments + '</p>' : '';
        html += '<p class="ui-li-aside">'+val.time+'</p>';
        html += "</a></li>";
      });
      $ul.removeClass("ui-loading");
    } else {
      html += '<li data-role="list-divider">'+currentDate.toDateField()+'<span class="ui-li-count">0</span></li>';
      html += "<li><p>"+strings.no_entries + "</p></li>";
    }
    var afterDate = new Date(currentDate);
    afterDate.setDate(afterDate.getDate() + 1);
    html += '<li data-icon="carat-d" class="daynav"><a href="#" onClick="diabeticlog.logGoToNext()"><p>'+afterDate.toDateField() + '</p></a></li>';
    $ul.html(html);
    $ul.listview( "refresh" );
    $ul.trigger( "updatelayout");
  }

  $(_doc).delegate("#bmlog", "pageinit", function () {

    $('#pagecontainer').on("pagecontainertransition", function( event, ui ) {
      if (ui.toPage.attr("id") === "bmlog") {
        changeToDate(currentDate);
      }
    });

    $('#btn-log-today').click(function(){
       changeToDate(new Date());
    });

    if (dl.isSignedIn()) {
      changeToDate(new Date());
    }
  });


}(window, document, jQuery))