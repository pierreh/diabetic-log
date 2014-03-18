(function (_wnd, _doc) {

  var CLIENT_ID = '653335348631-1j7bgtu7vorqecct9cecdosa8tice7bk.apps.googleusercontent.com';
  var SCOPES = 'https://www.googleapis.com/auth/userinfo.email';

  var dl = _wnd.diabeticlog = _wnd.diabeticlog || {};

  var signedIn = false;
  var apiInitialized = false;
  var userInfo = {};

  // initialize the server api
  dl.initApi = function (callback) {
    console.debug('Initializing Diabeticlog API...')
    var apiRoot = '//' + _wnd.location.host + '/_ah/api';

    var i = 2;
    var c = function () {
      if (--i == 0) {
        apiInitialized = (typeof gapi.client.dl !== 'undefined');
        if (apiInitialized) {
          console.debug("Diabeticlog API loaded. Trying to sign in...");
          signIn(true, function () {
            userSignedIn(callback);
          });
        } else {
          console.error("Diabeticlog has failed to initialize");
        }
      }
    }

    gapi.client.load('dl', '0.1', c, apiRoot);

    gapi.client.load('oauth2', 'v2', c);


  };

  dl.isApiInitialized = function () {
    return apiInitialized;
  }

  dl.isSignedIn = function () {
    return signedIn;
  }

  dl.getUserinfo = function () {
    return userInfo;
  }

  dl.authorize = function (callback) {
    if (!signedIn) {
      signIn(false, function () {
        userSignedIn(callback);
      });
    } else {
      if (callback) {
        callback();
      }
    }
  }

  dl.logout = function () {
    if (signedIn) {
      signedIn = false;
      userInfo = {};
      gapi.auth.setToken(null);
    }
  }

  dl.isOnline = function () {
    return dl._online;
  }

  function userSignedIn(callback) {
    var request = gapi.client.oauth2.userinfo.get().execute(function (resp) {
      if (!resp.code) {
        console.debug('signed in with user ' + resp.name);
        signedIn = true;
        userInfo = resp.result;
      } else {
        console.debug('not logged in');
      }
      if (callback) {
        callback();
      }
    });
  }

  function signIn(mode, callback) {
    gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES,
      immediate: mode}, callback);
  }

}(window, document));