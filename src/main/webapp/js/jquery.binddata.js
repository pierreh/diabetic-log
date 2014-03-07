// from https://github.com/jdavidw13/jquery-binddata

/*
jquery-binddata
===============

A jquery plugin to facilitate binding of javascript objects to form fields.  This plugin will set the value of form field elements based on the properties of the bound object, and update the bound object when changes are made to the form.

Usage
-----

Binddata expects names of form field elements to match properties in the model.  There is also support for nested properties.
```
var data = {prop1: 'value1', nestedProp: {prop2: 'someval2'}};

<form>
<input type="text" name="prop1" />
<input type="radio" name="nestedProp.prop2" value="someval" />
<input type="radio" name="nestedProp.prop2" value="someval2" />
...
$('form').binddata(data);
```
Will result in the text field's value being set to "value1" and the second radio button being selected.

Binddata, by default, will bind change handlers to all input and select elements within a form to a model.  You can easily retrieve field values by binding and empty, or partially populated model.
```
<form>
<input type="text" name="prop1" />
<input type="text" name="prop2" />
...
var data = {};
$('form').binddata(data);
```
When the values in the text fields change, the data model will be updated accordingly.


Binddata can be used to set or get the values from a form without binding change elements to them.
```
<form>
<input type="text" name="text1" />
<input type="text" name="text2" />
</form>
var data = {};
$('form').binddata(data, {onlyGetOrSet: 'get'});
// data will contain two properties, text1 and text2, with the values of those elements
```
```
<form>
<input type="text" name="text1" />
<input type="text" name="text2" />
</form>
var data = {text1: 'hello', text2: 'there'};
$('form').binddata(data, {onlyGetOrSet: 'set'});
// the text field text1 will contain "hello" and text2 will contain "there"
```


Data transformers can be used to modify the value being set in the form, or the value retrieved into the model.
```
<form>
<input type="text" name="prop" />
</form>
var data = {prop: 'getTest'};
$('form').binddata(data, {transforms: [{
    name: /prop/,
    getset: function(type, value) {
        if ('set' == type && value == 'getTest') {
            return 'setTest';
        }
        if ('get' == type && value == 'setTest') {
            return 'getTest';
        }
    }
}]});
// will result in prop being set to "setTest".  If the field is ever changed to "setTest" data.prop will be set to "getTest".

```

Options
-------

A parameter object may optionally be passed to binddata to change the way it works.  These parameters are listed here.
* bindAll - boolean (default true) - If set to false, binddata will only listen for changes in form fields that are contained within the data model.  If other field elements belong to a form, but a property for it did not exist in the model when it was bound, changes to that field will not be reflected in the model.
* onlyGetOrSet - string 'get' | 'set' (default '') - If set to 'get', binddata will populate field data into the model without performing data binding.  If set to 'set', binddata will populate the form from the model without binding data.
* transforms - array of {name: regex, getset: function('get'|'set', value)} (default []) - Provides a list of data transformers to binddata to transform the data from the model to the form, or from the form to the model.  The name property is a regular expression tested against the names of field elements.  All transformers that pass this test will be used to transform the value.  A value from the model will be transformed by taking the returned value from the getset function.  When the getset function is called, it's first parameter will be the string 'set', and the second parameter the value from the model.  Similarly, if a value is being retrieved from the form to be populated in the model, the first parameter to the getset function will be the string 'get', and the second parameter will be the value from the form field element.  If more than one transformer name regex passes the field name test, then they will be called in order, each output providing input to the next getset call, until the final value is retrieved.

License
-------
Copyright (c) 2012 Josiah Wilkerson <jdavidw13@yahoo.com> (https://github.com/jdavidw13)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function( $ ) {
    var getPropValue = function(bean, propname) {
        var props = propname.split('.');
        var val = bean;
        for (var i = 0; i < props.length; i++) {
            val = val[props[i]];
        }
        return val;
    };

    var setPropValue = function(bean, propname, value) {
        var props = propname.split('.');
        var obj = bean;
        for (var i = 0; i < props.length; i++) {
            if (i + 1 >= props.length) {
                obj[props[i]] = value;
            }
            else {
                if (null == obj[props[i]]) {
                    obj[props[i]] = {};
                }
                obj = obj[props[i]];
            }
        }
    };

    var getPropNamesAndValues = function(bean, propPrefix, ret) {
        for (var prop in bean) {
            var propname = (propPrefix) ? propPrefix + '.' + prop : prop;
            var type = typeof(bean[prop]);
            if ('object' === type) {
                ret = getPropNamesAndValues(bean[prop], propname, ret);
            }
            else if ('function' === type) {
            }
            else {
                if (ret == null) ret = {};
                ret[propname] = getPropValue(bean, prop);
            }
        }

        return ret;
    };

    var getElementType = function($el) {
        var type = $el.attr('type');
        if (type == null) {
            type = $el[0].tagName.toLowerCase();
        }
        return type;
    };

    var changeHandler = function() {
        var type = getElementType($(this));
        var bean = $(this).data('bindData.data').bean;
        var transforms = $(this).data('bindData.data').transforms;
		var updateHandler = $(this).data('bindData.data').updateHandler;
        var propname = $(this).attr('name');
        var value = null;
        switch (type) {
            case 'checkbox':
                value = $(this).is(':checked');
                break;
            default:
                value = $(this).val();
                break;
        }
        value = applyTransforms('get', value, getTransformsForField(propname, transforms));
        setPropValue(bean, propname, value);
		if (updateHandler) {
			updateHandler($(this), propname, value);
		}
        console.log(propname + ' changed: '+value);
    };

    var getTransformsForField = function(name, transforms) {
        var ret = [];
        $.each(transforms, function(index, transform) {
            if (transform.name.test(name)) {
                ret.push(transform.getset);
            }
        });
        return ret;
    };

    var applyTransforms = function(type, value, transforms) {
        var ret = value;
        $.each(transforms, function(index, transform) {
            ret = transform(type, ret);
        });
        return ret;
    };

    var setFormFields = function($form, data, transforms) {
        for (var prop in data) {
            var propTransforms = getTransformsForField(prop, transforms);
            var value = applyTransforms('set', data[prop], propTransforms);
            setFormField($form, prop, value);
        }
    };

    var getFormFields = function($form, data, transforms) {
        var getFieldData = function(index, el) {
            var name = $(el).attr('name');
            var type = getElementType($(el));
            var val = null;
            switch (type) {
                case 'hidden':
                case 'text':
                case 'select':
				case 'time':
				case 'date':
				case 'number':
				case 'textarea':
                    val = $(el).val();
                    break;
                case 'radio':
                    if ($(el).is(':checked')) {
                        val = $(el).val();
                    }
                    else {
                        return;
                    }
                    break;
                case 'checkbox':
                    val = $(el).is(':checked');
                    break;
            }
            val = applyTransforms('get', val, getTransformsForField(name, transforms));
            setPropValue(data, name, val);
        };
        $form.find('input').each(getFieldData);
        $form.find('select').each(getFieldData);
    };

    var setFormField = function($form, name, value) {
        var $el = $form.find('[name="'+name+'"]');
		if ($el.length == 0) {
			return;
		}
        var type = getElementType($el);

        switch (type) {
            case 'hidden':
            case 'text':
            case 'select':
			case 'time':
			case 'date':
			case 'number':
			case 'textarea':
                $el.val(value);
                break;
            case 'radio':
                $el.filter('[value="'+value+'"]').prop('checked', true);
                break;
            case 'checkbox':
                if (true === value) {
                    $el.prop('checked', true);
                }
                else {
                    $el.prop('checked', false);
                }
                break;
        }
    };

    $.fn.binddata = function(bean, properties) {
        if (null == bean) {
            return this;
        }

        var _this = this;
        var defaultProperties = {
            bindAll: true,
            onlyGetOrSet: '',
            transforms: [],
			updateHandler: null
        };
        $.extend(defaultProperties, properties);
        var data = getPropNamesAndValues(bean);

        switch (defaultProperties.onlyGetOrSet) {
            case 'set':
                setFormFields(this, data, defaultProperties.transforms);
                return this;
            case 'get':
                getFormFields(this, bean, defaultProperties.transforms);
                return this;
        }

        var elData = {bean: bean, transforms: defaultProperties.transforms, updateHandler: defaultProperties.updateHandler};

		var doUnBind = function(index, el) {
			var $el = $(el);
			$el.off('change');
		};
		this.find('input').each(doUnBind);
		this.find('select').each(doUnBind);
		this.find('textarea').each(doUnBind);
        if (defaultProperties.bindAll === false) {
            for (var prop in data) {
                var $el = this.find('[name="'+prop+'"]');
				if ($el.length > 0) {
					$el.data('bindData.data', elData);
					$el.on('change', changeHandler);
				}
            }
            setFormFields(this, data, elData.transforms);
        }
        else {
            var doBind = function(index, el) {
                var $el = $(el);
                var name = $el.attr('name');
                $el.data('bindData.data', elData);
                $el.on('change', changeHandler);
            };
            this.find('input').each(doBind);
            this.find('select').each(doBind);
			this.find('textarea').each(doBind);
            setFormFields(this, data, elData.transforms);
        }

        return this;
    };
})(jQuery);