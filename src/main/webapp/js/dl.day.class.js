
var dl = window.diabeticlog;

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
  var key = dl.appname + ".day." + this.date.toDateField();
  this.prune();
  if (this.entries.length == 0) {
    if (localStorage[key]) {
      // pruned record
      dl.debug('removing day from storage because it is empty ' + this.date.toDateField());
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
  var s = JSON.stringify(item);
  try {
    localStorage[key] = s;
    if (dl.syncApi) {
      dl.syncApi.addToQueue(key);
    } else {
      console.error('SyncApi not available');
    }
    this.dirty = false;
    if (dl.isDebug) {
      dl.debug('Day saved. key : ' + key + " data: " + s);
      dl.debug('Total number of days stored ' + (Object.keys(localStorage).length));
    }
  } catch (e) {
    if (e == QUOTA_EXCEEDED_ERR) {
      alert("ERROR: Storage is full! Entry is not saved");
    }
  }
}

Day.prototype.prune = function () {
  for (var i = 0; i < this.entries.length; i++) {
    var e = JSON.parse(JSON.stringify(this.entries[i]));
    if (Object.keys(e).length == 1) {
      // entry only has the time field filled in, prune it
      dl.debug('pruning entry[' + i + '] : ' + JSON.stringify(e));
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
  dl.debug('before sort: ' + JSON.stringify(this.entries));
  this.entries.sort(function (a, b) {
    var aspl = a.time.split(':');
    var bspl = b.time.split(':');
    return (aspl[0] * 60 + aspl[1]) - (bspl[0] * 60 + bspl[1]);
  });
  dl.debug('after sort: ' + JSON.stringify(this.entries));
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
  var s = localStorage[dl.appname + ".day." + date.toDateField()];
  if (s) {
    var item = JSON.parse(s);
    dl.debug("item loaded");
    dl.debug(item);
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
  var d = new Date(this.getTime());
  d.setHours(12);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.toISOString().substr(0, 10);
}

Date.prototype.toTimeField = function () {
  return this.toTimeString().substr(0, 5);
}

