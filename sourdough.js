var load_time = (new Date()).getTime();

(function(){
if(window.$) return;
if(!document.querySelectorAll){
// TODO ie compat, etc
	return;
}; // document.querySelectorAll
var Ap = Array.prototype, push = Ap.push,
	concat = Ap.concat,
	splice = Ap.splice,
	slice = Ap.slice;
var $ = function(){
	var _, undef, self = this, i=0, l=arguments.length;
	if(!(self instanceof $)) self = new $();
	self.length = 0;
	self.noDupe = 0;
	self.uid = {};
	self.selector = [];
	while(i<l){
		_ = arguments[i++];
		if(_.constructor == String){ // css selector
			push.apply(self, slice.call($().query(_),0));
		}else if(_ instanceof NodeList){
			push.apply(self, slice.call(_,0));
		}else if(_.constructor == Array){
			// map the list items over onto self object
			push.apply(self,slice.call($.apply(null,_),0));
		}else if(_){
			push.call(self, _);
	 	};
	};
	if(l>1) self = self.uniq();

	return self;
};

$.version = new String('0.1');
$.version.number = 0.1;
$.version.released = "2011-10-2";

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
	'keydown,keypress,keyup': 'KeyboardEvent',
	'beforecopy,beforecut,beforepaste,copy,cut,drag,dragend,dragenter,dragexit,draggesture,dragleave,dragover,dragstart,drop,paste': 'DragEvent,MouseEvent',
	'message': 'MessageEvent',
	'DOMAttrModified,DOMCharacterDataModified,DOMNodeInserted,DOMNodeInsertedIntoDocument,DOMNodeRemoved,DOMNodeRemovedFromDocument,DOMSubtreeModified': 'MutationEvent',
	'textInput': 'TextEvent,UIEvent',
	'abort,activate,beforeactivate,beforedeactivate,deactivate,DOMActivate,DOMFocusIn,DOMFocusOut,overflow,resize,scroll,select,underflow': 'UIEvent',
	'touchstart,touchmove,touchend,touchcancel': 'TouchEvent,MouseEvent',
	'gesturestart,gesturechange,gestureend': 'GestureEvent,MouseEvent'
};
$.eventDefaults = {
	default: function(v, props){
		// TODO are the datatype defaults correct?
		var undef, item, result = [], _default = {bubbles:true,cancelable:true,view:window,detail:0,screenX:0,screenY:0,clientX:0,clientY:0,ctrlKey:0,altKey:0,shiftKey:0,metaKey:0,button:0,relatedTarget:0,keyCode:0,charCode:0,dataTransfer:0,data:0,origin:0,lastEventId:0,source:0,ports:0,relatedNode:0,prevValue:'',newValue:'',attrName:'',attrChange:'',inputMethod:0,locale:'',target:0,touches:[],targetTouches:[],changedTouches:[],scale:0,rotation:0};
		props = props.split(',');
		while(item = props.shift()){
				result.push( v[item] !== undef ? v[item] : _default[item] );
		};
		return result;
	},
	Event: function(v){
		this.initEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable'));
	},
	UIEvent: function(v){
		this.initUIEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,detail'));
	},
	MouseEvent: function(v){
		this.initMouseEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,button,relatedTarget'));
	},
	KeyboardEvent: function(v){
		// FF uses initKeyEvent
		this[this.initKeyEvent ? 'initKeyEvent':'initKeyboardEvent'].apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,ctrlKey,altKey,shiftKey,metaKey,keyCode,charCode'));
	},
	DragEvent: function(v){
		this.initDragEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,button,relatedTarget,dataTransfer'));
	},
	MessageEvent: function(v){
		this.initMessageEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,data,origin,lastEventId,source,ports'));
	},
	MutationEvent: function(v){
		this.initMutationEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,relatedNode,prevValue,newValue,attrName,attrChange'));
	},
	TextEvent: function(v){
		this.initTextEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,data,inputMethod,locale'));
	},
	TouchEvent: function(v){
		this.initTouchEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,touches,targetTouches,changedTouches,scale,rotation'));
	},
	GestureEvent: function(v){
		this.initGestureEvent.apply(this, $.eventDefaults.default(v, 'type,bubbles,cancelable,view,detail,screenX,screenY,clientX,clientY,ctrlKey,altKey,shiftKey,metaKey,target,scale,rotation'));
	}
};

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
		else eventSupported = '';
	};
	eventType = {
		supported: eventSupported || 'Event',
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
constructor: $,
version: $.version,
is$: true,
toString: function(){ return this.selector; },
xhr: function(url, o){
	$.xhr(url, o);
	return this;
},
//bind: subscribe: listen:
on: function(_event, fn, capture){
	// TODO handle special case like ready, so if document.readyState = loaded/ready
	// then just trigger the handler
	this.each(function(){
		// TODO cache the handler, fn etc for removal
		this.addEventListener(_event, fn, capture || false);
	});
	return this;
},
// ignore: unsubscribe: ?
off: function(_event, fn, capture){
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
	var v = _event || {};
	// default eventType maps onto eventType, can set it directly via optional _event, or try to get it based on _type, otherwise default to '_custom'
	v.eventType = v.eventType || $.eventType[_type] || $.eventType._custom;
	v.type = _type;
// TODO ? for MouseEvent do: v.relatedTarget = DOMELEMENT; or a way to interpolate things like this?
	var e = document.createEvent(v.eventType.supported);
	// do appropriate init: initEvent, initUIEvent, etc
	$.eventDefaults[v.eventType.supported].call(e, v);
	this.each(function(){
		// TODO for types that aren't supported:
		// how to apply original event props to new event so handler sees them?
		// OR check to see that non-standard props are applied to the new event somehow
		// OR normalize the event object
		this.dispatchEvent(e);
	});
	return this;
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
push: function(){
	var i = 0, j = arguments.length, l, u = this.uid;
	while(i<j){
		l = arguments[i++];
		l.uid = l.uid || uid();
		if(u[l.uid]) continue;
		u[l.uid] = true;
		push.call(this, l);
	};
	return this;
},
uniq: function(){
	var list = new $, u;
	list.selector = this.selector;
	u = list.uid;
	this.each(function(){
		this.uid = this.uid || uid();
		if(u[this.uid]) return;
		u[this.uid] = list.push(this);
	});
	list.noDupe = 1;
	return list;
}
}; // $.prototype

// setup synonyms
var s, synonyms = 'subscribe:on,listen:on,after:insertAfter,before:insertBefore,find:query,ajax:xhr'.split(',');
while(s=synonyms.shift()){
	s=s.split(':');
	$.prototype[s[0]] = $.prototype[s[1]];
};

// make some events dispatch to specific elements
//$('body').listen('DOMContentLoaded',function(){ /*TODO trigger event on body,document,html */ },false);
window.$ = $;
})();
load_time = (new Date()).getTime() - load_time;
