(function(){
if(window.$) return;
if(!document.querySelectorAll){
// TODO ie compat, etc
	return;
}; // document.querySelectorAll
var push = Array.prototype.push,
	concat = Array.prototype.concat,
	splice = Array.prototype.splice,
	slice = Array.prototype.slice;
var $ = function(_){
	_ = typeof _ != 'undefined' ? _ : false;
	if(!(this instanceof $)) return new $(_);
	this.length = 0;
	this.noDupe = 0;
	this.uid = {};
	this.selector = _.toString();
	if(_.constructor == String){ // css selector
		this[this.length++] = document;
		this.query(_);
	}else if(_ instanceof NodeList){
		push.apply(this, slice.call(_,0));
	}else if(_.constructor == Array){
		// map the list items over onto this object
		concat.apply(this, _);
		this.uniq();
	}else if(_ && (_.constructor != Function) ){
		push.call(this, _);
	};
	// TODO do we want to do something with functions?
	
	return this;
};

var _u=0;
function uid(){ return 'u'.concat(_u++); }

$.eventType = {};
var events = {
/* event,name,list: FirstInList,Event,Types,To,Fall,Thru,SupportedEventTypeList
	which becomes {type:Supported-Event-Type, original:FirstInList}
	and is used for: createEvent('Supported-Event-Type')

	note special '_custom' type used for any undefined types
*/
	'click,contextmenu,dblclick,DOMMouseScroll,drag,dragdrop,dragend,dragenter,dragexit,draggesture,dragleave,dragover,dragstart,drop,mousedown,mousemove,mouseout,mouseover,mouseup,mousewheel': 'MouseEvent',
	'_custom,DOMContentLoaded,afterprint,beforecopy,beforecut,beforepaste,beforeprint,beforeunload,blur,bounce,change,CheckboxStateChange,copy,cut,error,finish,focus,hashchange,help,input,load,offline,online,paste,RadioStateChange,readystatechange,reset,resize,scroll,search,select,selectionchange,selectstart,start,stop,submit,unload': 'Event',
	'keydown,keypress,keyup': 'KeyEvent,KeyboardEvent',
	'beforecopy,beforecut,beforepaste,copy,cut,drag,dragend,dragenter,dragexit,draggesture,dragleave,dragover,dragstart,drop,paste': 'DragEvent,MouseEvent',
	'message': 'MessageEvent',
	'DOMAttrModified,DOMCharacterDataModified,DOMNodeInserted,DOMNodeInsertedIntoDocument,DOMNodeRemoved,DOMNodeRemovedFromDocument,DOMSubtreeModified': 'MutationEvent',
	'textInput': 'TextEvent',
	'abort,activate,beforeactivate,beforedeactivate,deactivate,DOMActivate,DOMFocusIn,DOMFocusOut,overflow,resize,scroll,select,underflow': 'UIEvent',
	'touchstart,touchmove,touchend,touchcancel': 'TouchEvent,MouseEvent',
	'gesturestart,gesturechange,gestureend': 'GestureEvent,MouseEvent'
};
/*
Event == Events == HTMLEvents
KeyboardEvent
MessageEvent
MouseEvent == MouseEvents
MutationEvents == MutationEvent
*ProgressEvent
*StorageEvent
*SVGZoomEvents
TextEvent (in FF this is same as UIEvent)
*WheelEvent
UIEvent == UIEvents

MouseEvent
click,contextmenu,dblclick,DOMMouseScroll,drag,dragdrop,dragend,dragenter,dragexit,draggesture,dragleave,dragover,dragstart,drop,mousedown,mousemove,mouseout,mouseover,mouseup,mousewheel,
object.initMouseEvent (eventName, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);

Event
DOMContentLoaded,afterprint,beforecopy,beforecut,beforepaste,beforeprint,beforeunload,blur,bounce,change,CheckboxStateChange,copy,cut,error,finish,focus,hashchange,help,input,load,offline,online,paste,RadioStateChange,readystatechange,reset,resize,scroll,search,select,selectionchange,selectstart,start,stop,submit,unload,
object.initEvent (eventName, bubbles, cancelable);

KeyEvent
keydown,keypress,keyup
Firefox: object.initKeyEvent (eventName, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
IE9 and all others: object.initKeyboardEvent (eventName, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);

DragEvent
beforecopy,beforecut,beforepaste,copy,cut,drag,dragend,dragenter,dragexit,draggesture,dragleave,dragover,dragstart,drop,paste,
object.initDragEvent (eventName, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget, dataTransfer);

MessageEvent
message
object.initMessageEvent (eventName, bubbles, cancelable, data, origin, lastEventId, source, ports);
see postMessage

MutationEvent
DOMAttrModified,DOMCharacterDataModified,DOMNodeInserted,DOMNodeInsertedIntoDocument,DOMNodeRemoved,DOMNodeRemovedFromDocument,DOMSubtreeModified,
object.initMutationEvent (eventName, bubbles, cancelable, relatedNode, prevValue, newValue, attrName, attrChange);

object.initOverflowEvent (orient, horizontalOverflow, verticalOverflow);

TextEvent
textInput
object.initTextEvent (eventName, bubbles, cancelable, view, data, inputMethod, locale);

UIEvent
abort,activate,beforeactivate,beforedeactivate,deactivate,DOMActivate,DOMFocusIn,DOMFocusOut,overflow,resize,scroll,select,underflow,
object.initUIEvent (eventName, bubbles, cancelable, view, detail);

TouchEvent
touchstart,touchmove,touchend,touchcancel
initTouchEvent(type, canBubble, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, <TouchList>touches, <TouchList>targetTouches, <TouchList>changedTouches, scale, rotation);

GestureEvent
gesturestart,gesturechange,gestureend
initGestureEvent(type, canBubble, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, target, scale, rotation);
*/
$.eventDefaults = {
	Event: {bubbles:true, cancelable:true, init: function(v){
		this.initEvent.call(v.type, v.bubbles, v.cancelable);
	}},
	UIEvent: {bubbles:true, cancelable:true, view:window, detail:1, init: function(v){
console.log('?',this,v);
		this.initUIEvent(v.type, v.bubbles, v.cancelable, v.view, v.detail);
	}},
	MouseEvent: {bubbles:true, cancelable:true, view:window, detail:1, screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: 0, altKey: 0, shiftKey: 0, metaKey: 0, button: 0, init: function(v){
		this.initMouseEvent(v.type, v.bubbles, v.cancelable, v.view, v.detail, v.screenX, v.screenY, v.clientX, v.clientY, v.ctrlKey, v.altKey, v.shiftKey, v.metaKey, v.button, v.relatedTarget);
	}},
	KeyboardEvent: {bubbles:true, cancelable:true, view:window, ctrlKey: 0, altKey: 0, shiftKey: 0, metaKey: 0, keyCode: 0, charCode: 0, init: function(v){
// TODO cleanup?
		this['init'.concat(v.typeMap.type)](v.type, v.bubbles, v.cancelable, v.view, v.ctrlKey, v.altKey, v.shiftKey, v.metaKey, v.keyCode, v.charCode);
	}},
// TODO are the datatype defaults correct?
	DragEvent: {bubbles:true, cancelable:true, view:window, detail:1, screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: 0, altKey: 0, shiftKey: 0, metaKey: 0, button: 0, relatedTarget:0, dataTransfer:0, init: function(v){
		this.initDragEvent(v.type, v.bubbles, v.cancelable, v.view, v.detail, v.screenX, v.screenY, v.clientX, v.clientY, v.ctrlKey, v.altKey, v.shiftKey, v.metaKey, v.button, v.relatedTarget, v.dataTransfer);
	}},
	MessageEvent: {bubbles:true, cancelable:true, data:0, origin:0, lastEventId:0, source:0, ports:0, init: function(v){
		this.initMessageEvent(v.type, v.bubbles, v.cancelable, v.data, v.origin, v.lastEventId, v.source, v.ports);
	}},
	MutationEvent: {bubbles:true, cancelable:true, relatedNode:0, prevValue:0, newValue:0, attrName:0, attrChange:0, init: function(v){
		this.initMutationEvent (v.type, v.bubbles, v.cancelable, v.relatedNode, v.prevValue, v.newValue, v.attrName, v.attrChange);
	}},
	TextEvent: {bubbles:true, cancelable:true, view:window, data:0, inputMethod:0, locale:0, init: function(v){
		this.initTextEvent (v.type, v.bubbles, v.cancelable, v.view, v.data, v.inputMethod, v.locale);
	}},
	TouchEvent: {bubbles:true, cancelable:true, view:window, detail:1, screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: 0, altKey: 0, shiftKey: 0, metaKey: 0, touches:[], targetTouches:[], changedTouches:[], scale:1, rotation:0, init: function(v){
		this.initTouchEvent(v.type, v.bubbles, v.cancelable, v.view, v.detail, v.screenX, v.screenY, v.clientX, v.clientY, v.ctrlKey, v.altKey, v.shiftKey, v.metaKey, v.touches, v.targetTouches, v.changedTouches, v.scale, v.rotation);
	}},
	GestureEvent: {bubbles:true, cancelable:true, view:window, detail:1, screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: 0, altKey: 0, shiftKey: 0, metaKey: 0, target:0, scale:1, rotation:0, init: function(v){
		this.initTouchEvent(v.type, v.bubbles, v.cancelable, v.view, v.detail, v.screenX, v.screenY, v.clientX, v.clientY, v.ctrlKey, v.altKey, v.shiftKey, v.metaKey, v.target, v.scale, v.rotation);
	}}
};
$.eventDefaults.KeyEvent = $.eventDefaults.KeyboardEvent;

var _, eventName, originalType, eventType, eventSupported, di = document.implementation, isPlural = /s$/;
for(eventName in events){
	eventName = eventName.split(',');
	eventType = events[eventName].split(',');
	originalType = eventType[0];
	while(eventSupported = eventType.shift()){
		if(
			di.hasFeature(isPlural.test(eventSupported) ? eventSupported : eventSupported.concat('s'), '')
			|| window[eventSupported]
		) break;
	};
	eventType = {
		type: eventSupported || 'Event',
		original: originalType
	};

	while(_ = eventName.shift()){
		$.eventType[_] = eventType;
	};
};

$.xhr = function(url, o){
	var xhr = new XMLHttpRequest(), z, fn = function(){};
	o = o || {};
	z={
		url: url || '',
		type: o.type || 'GET',
		data: o.data || false,
		before: o.before || fn,
		error: o.error || fn,
		success: o.success || fn,
		after: o.after || fn
	};
	xhr.open(z.type, z.url, true);
	z.before.call(xhr, xhr);
	xhr.onreadystatechange = function(e){
		if(xhr.readyState != 4) return;
		switch(xhr.status){
		case 200:
			z.success.call(xhr, e);
		break;
		case 301:
			z.success.call(xhr, e);
		break;
		default:
			z.error.call(xhr, e);
		}
		z.after.call(xhr, e);
	};
	xhr.send(z.data);
	return xhr;
}; // xhr()

$.cache = {
_uid: { }, // elements by uN {l: element, "event-" + event-handler-namespace: [{fn,bubble},{fn,bubble}...] }
_re: {} // regex
};
$.prototype = {
is$: true,
toString: function(){ return this.selector; },
xhr: function(url, o){
	$.xhr(url, o);
	return this;
},
//bind: subscribe: listen:
bind: function(_event, fn, capture){
	// TODO handle special case like ready, so if document.readyState = loaded/ready
	// then just trigger the handler
	this.each(function(){
		// TODO cache the handler, fn etc for removal
		this.addEventListener(_event, fn, capture || false);
	});
	return this;
},
// ignore: unsubscribe: ?
unbind: function(_event, fn, capture){
	// TODO, all args, event-name only, none:remove all events
	this.each(function(){
		// TODO grab handler from cache in certain cases
		this.removeEventListener(_event, fn, capture || false);
	});
	return this;
},
// trigger: fire: dispatch:
trigger: function(_type, _event){
	// create and dispatch an event on elements
	var eventType = $.eventType[_type] || $.eventType._custom, v = _event || {}, defaults = $.eventDefaults[eventType.type];
	for(var p in defaults){
		v[p] = v[p] || defaults[p];
	};
	v.typeMap = eventType;
	v.type = _type;
// TODO ? for MouseEvent do: v.relatedTarget = DOMELEMENT; or a way to interpolate things like this?
// TODO do we want to createEvent out here and then copy it within, or use original, or ?
	this.each(function(){
		var e = document.createEvent(eventType.type);
		// do appropriate init: initEvent, initUIEvent, etc
		v.init.call(e, v);
		// TODO for types that aren't supported:
		// how to apply original event props to new event so handler sees them?
		// OR check to see that non-standard props are applied to the new event somehow
		// OR normalize the event object
		this.dispatchEvent(e);
	});
	return this;
},
children: function(){
	return this;
},
parent: function(){
	var list = $();
	this.each(function(i,l){
		if(l = l.parentNode) list.push(l);
	});
	return list;
},
parents: function(){
	var list = $([document, document.documentElement, document.body]);
	this.each(function(i,l){
		while(l && (l = l.parentNode) && (l != document.body)){
			list.push(l);
		};
	});
	return list;
},
query: function(_){ // querySelectorAll
	var list = [0,this.length], isDOMelement = false, j = 0;
	this.selector = _;
	this.each(function(i){
		if(!this.querySelectorAll) return;
		isDOMelement = true;
		this.uid = this.uid || uid();
		if(list[this.uid]) return;
		++j; // count queries
		list[this.uid] = true;
		list = list.concat( slice.call(this.querySelectorAll(_), 0) );
	});
	if(isDOMelement && j > 1){
		this.uniq();
	// allow for things like: window.querySelectorAll, TODO is this a good idea?
	}else if(!isDOMelement) list = list.concat( slice.call( document.querySelectorAll(_), 0) );
	splice.apply(this, list);
	return this;
}, // query

animate: function(){
	return this;
}, // fade, show/hide, etc
ajax: function(){
	return this;
},
css: function(){
	return this;
},
hasClass: function(){
	return this;
},
offset: function(){
	return this;
}, // offsetLeft, scroll, etc, offsetParent, width, etc outside+inside the box
attr: function(){
	return this;
},
html: function(_html){
	// TODO review window.innerHTML, need checks, esp Fragment.innerHTML
	this.each(function(){
		this.innerHTML = _html;
	});
	return this;
},
text: function(txt, append){
	append = append || false;
	var ct = document.createTextNode;
	if(arguments.length){
		this.each(function(){
			if(append){ this.appendChild(ct(txt));
			}else{ this.textContent = txt; }
		});
	return this;
	}else if(this.length){
	var list = [];
		this.each(function(){
			list.push(this.textContent);
		});
	return list.length > 1 ? list:(list.length?list[0]:'');
	};
},

clone: function(deep){
	var nodes = [];
	this.each(function(){
		nodes.push(this.cloneNode(deep||false));
	});
	return new $(nodes);
},
replace: function(l){
	var list = $();
	this.each(function(){
		if(!l.nodeType) l = document.createTextNode(l);
		list.push(this.parentNode.replaceChild(this, l));
	});
	return list;
},
remove: function(){
	this.each(function(){
		if(!this.parentNode) return;
		this.parentNode.removeChild(this);
	});
	return this;
},
append: function(l){
	// text-nodes or dom-nodes (like prepend)
	var list = (l && l.is$) ? l : $(l), t = this;
	// TODO does it make sense to loop?
	this.each(function(){
	// TODO when $('#b') fails this incorrectly creates a textnode
		if(!l.nodeType) l = document.createTextNode(l);
		this.appendChild(l);
		list.push(l);
	});
	return list;
},
prepend: function(l){
	return this.insertBefore(l, this.firstChild);
},
insertBefore: function(l, before){
	// like append
	var list = $(), ct = document.createTextNode;
	this.each(function(){
		if(!l.nodeType) l = ct(l);
		this.appendChild(l);
		list.push(l);
	});
	return list;
},
insertAfter: function(l, after){
	if(after.nextSibling) return this.insertBefore(l, after.nextSibling);
	return this.append(l);
},

each: function(fn){
	var item, i=0, l=this.length;
	while(i<l){
		item = this[i];
		fn.call(item, i, item);
		++i;
	}
	return this;
},
item: function(i){
	i = i||0;
	return this[i] || false;
},
push: function(l){
// TODO push in multiple arguments
	var u = this.uid;
	l.uid = l.uid || uid();
	if(!u[l.uid]){
		u[l.uid] = true;
		push.call(this, l);
	};
	return this;
},
uniq: function(){
	var list = new $;
	list.selector = this.selector;
	this.each(function(){
		list.push(this);
	});
	list.noDupe = 1;
	return list;
},
// TODO push,pop,shift,unshift,slice,concat

animation: function(){
	return this;
}
}; // $.prototype

// setup synonyms
var s, synonyms = 'listen:bind,after:insertAfter,before:insertBefore,find:query,ajax:xhr'.split(',');
while(s=synonyms.shift()){
	s=s.split(':');
	$.prototype[s[0]] = $.prototype[s[1]];
};

// make some events dispatch to specific elements
//$('body').listen('DOMContentLoaded',function(){ /*TODO trigger event on body,document,html */ },false);
window.$ = $;
})();
