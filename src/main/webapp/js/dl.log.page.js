(function(_wnd, _doc, $){

  $(_doc).delegate("#bmlog", "pageinit", function () {
     $('#log-content').html('Page Loaded' +  new Date().toISOString());
  });

}(window, document, jQuery))