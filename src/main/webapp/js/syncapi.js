(function(_wnd,_doc) {

    _wnd.diabeticlog = _wnd.diabeticlog || {}

    var dl = _wnd.diabeticlog;

    var api = dl.syncApi = dl.syncApi || {}

    function getApi() {
        return gapi.client.dl.syncApi;
    }

    api.getVersion = function(callback) {
        getApi().getVersion().execute(function(response) {
            if (!response.code) {
                callback(response.result);
            }
        });
    }

    api.getUsername= function(callback) {
        getApi().getUsername().execute(function(response) {
            if (!response.code) {
                callback(response.result.nickname);
            } else {
                console.error(response.code + ": " + response.message);
            }
        });
    }

}(window,document))

