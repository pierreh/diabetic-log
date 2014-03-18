(function (_wnd, _doc) {

  _wnd.diabeticlog = _wnd.diabeticlog || {}

  var dl = _wnd.diabeticlog;

  var api = dl.syncApi = dl.syncApi || {}


  api.getVersion = function (callback) {
    getApi().getVersion().execute(function (response) {
      if (!response.code) {
        callback(response.result);
      }
    });
  }

  api.getUsername = function (callback) {
    getApi().getUsername().execute(function (response) {
      if (!response.code) {
        callback(response.result.nickname);
      } else {
        console.error(response.code + ": " + response.message);
      }
    });
  }

  api.addToQueue = function (key) {
    var queue = getSyncQueue();
    if (queue.indexOf(key) > -1) {
      console.debug('key already in the queue');
      return;
    }
    var nr = queue.push(key);
    updateSyncQueue(queue);
    console.log('key added to syncqueue: ' + key);
    console.log('nr keys in syncqueue: ' + nr);
  }


  var syncQueueKey = dl.appname + '.syncQueue';
  var activeSyncQueueKey = dl.appname + '.activeSyncQueue';
  var syncTimer = null;
  var syncInProgress = false;

  function getApi() {
    return gapi.client.dl.syncApi;
  }

  function startSyncing() {
    if (!syncTimer) {
      syncTimer = setInterval(syncTimeout, 5000);
    }
  }

  startSyncing(); // start immediately

  function stopSyncing() {
    if (syncTimer) {
      clearInterval(syncTimer);
    }
  }

  function updateDay(day, callback) {
    getApi().updateDay(day).execute(callback);
  }

  function getSyncQueue() {
    return getQueue(syncQueueKey);
  }

  function getActiveSyncQueue() {
    return getQueue(activeSyncQueueKey);
  }

  function getQueue(queueKey) {
    if (!(queueKey in localStorage) || localStorage[queueKey] === "") {
      localStorage[queueKey] = "[]";
    }
    return JSON.parse(localStorage[queueKey]);
  }

  function updateSyncQueue(queue) {
    return updateQueue(queue, syncQueueKey);
  }

  function updateActiveSyncQueue(queue) {
    return updateQueue(queue, activeSyncQueueKey);
  }

  function updateQueue(queue, queueKey) {
    localStorage[queueKey] = JSON.stringify(queue);
  }

  function isReadyToSync() {
    return syncInProgress == false && dl.isOnline() && dl.isApiInitialized() && dl.isSignedIn();
  }

  function syncTimeout() {
    if (isReadyToSync()) {
      syncInProgress = true;
      var q = getSyncQueue();
      updateActiveSyncQueue(q);
      updateSyncQueue([]);
      syncDaysRecursive();
    }
  }

  function localDay2ServerDay(key) {
    var o = JSON.parse(localStorage[key]);
    o.date = new Date(key.split(".").pop());
    return o;
  }

  function syncDaysRecursive() {

    var q = getActiveSyncQueue();
    if (q.length == 0) {
      syncInProgress = false;
      return;
    }

    var key = q[0];
    if (key in localStorage) {
      console.log('Syncing key : ' + key);
      updateDay(localDay2ServerDay(key), function (response) {
        if (!response.code) {
          // day successfully stored
          console.log(key + " synced to server");
          q.shift();
          updateActiveSyncQueue(q);
          syncDaysRecursive();
        } else {
          console.error("Failed to store day: " + key);
          // try again later
          updateSyncQueue(getActiveSyncQueue().concat(getSyncQueue()));
          updateActiveSyncQueue([]);
          syncInProgress = false;
        }
      });
    } else {
      // key not available in local storage, try the next one
      console.warn("Failed to find key in localstorage: " + key);
      q.shift();
      updateActiveSyncQueue(q);
      syncDaysRecursive();
    }
  }

}(window, document))

