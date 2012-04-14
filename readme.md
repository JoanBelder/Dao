# Dao #

An [JSONML](http://jsonml.org/) implemenation.

Dao is an JSONML implementation with a few extra features, to make it more powerful.
It allows to work on direct dom element, as well on jQuery objects, and even direct array-like manipulation.
Dao does not extend any core javascript object and does not have any dependencies.
Although jQuery must be enabled in order to support it.

# Usage #
## Constructing Dao object ##

Dao simply functions as a wrapper of jsonml objects. So to create a Dao object 
one can create one by using some standard jsonml, array. Another Dao object, a 
jQuery object or an arbitrary DOM Node. Or a simple string to construct an element
with that as tagname.

All of these examples are valid constructors:
```
	var dao = new Dao(["a", {"href":"http://example.com"}, "a link"]);
	var dao = new Dao(document.body);
	var dao = new Dao($("a"));
	var dao = new Dao(SomeDaoObject); // returns SomeDaoObject
	var dao = new Dao("a"); 
	// the pequals new Dao(document.createElement("a"));
```
Omitting the `new` keyword does exactly the same. 
``` 
	var dao = Dao(document.body);
```

To construct a Dao element from a JSON string one should use the `Dao.util.fromJSON` function
```
	var dao = Dao.util.fromJSON( SomeJSONString );
```

## To DOM or JSON ##
To go to a JSON string it's possible to simply use JSON.stringify
```
var someArray = JSON.stringify(new Dao(document.body));
```
To get a DOM node out of the Dao object call the `build` method. If the Dao represented an array 
of elements it will return a DocumentFragment rather than an Element.
```
	var dao = new Dao(["a", {"href":"http://example.com"}, "a link"]);
	document.body.appendChild(dao.build());
	
	// works too
	var allLinks = new Dao($("a"));
	document.body.appendChild(allLinks.build);
```

## modifying a Dao object ##
Dao has as prototype the array object, so one can modify the Dao by the default array operations.
```
	var dao = new Dao(["div"]);
	dao.unshift("newTagName");
	dao.push( "some text" );
	dao.push( ["p", {"class" : "dao-paragraph"}, "some paragraph" ]);
	dao[2] = new Dao ("strong", "bold text");
	dao.build();
```

# license #
Dao is MIT Licensed