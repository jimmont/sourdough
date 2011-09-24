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

// dictionary for eventNames
// TODO handle special-cases (somewhere) like ready
// http://www.kaizou.org/2010/03/generating-custom-javascript-events/
// https://developer.mozilla.org/En/DOM/Document.createEvent
$.eventType = {
	// TODO when it's ready we have special case where we need to check
	// document.readyState
	ready: 'DOMContentLoaded'

};
$.cache = {
_uid: { }, // elements by uN {l: element, "event-" + event-handler-namespace: [{fn,bubble},{fn,bubble}...] }
_re: {} // regex
};
$.prototype = {
is$: true,
toString: function(){ return this.selector; },
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
trigger: function(_type){
	// TODO create and dispatch an event on elements
	// TODO convert _type to something appropriate using $.eventType
	// like UIEvent, 
	// TODO handle arguments for initEvent
	//var _create = document.createEvent;//,
	var type = $.eventType[_type] || 'UIEvent';
	this.each(function(){
		var e = document.createEvent(type);
		// do appropriate init: initEvent, initUIEvent, etc
		e.initUIEvent(_type, false, false);
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
var s, synonyms = 'listen:bind,after:insertAfter,before:insertBefore'.split(',');
while(s=synonyms.shift()){
	s=s.split(':');
	$.prototype[s[0]] = $.prototype[s[1]];
};

// make some events dispatch to specific elements
//$('body').listen('DOMContentLoaded',function(){ /*TODO trigger event on body,document,html */ },false);
window.$ = $;
})();
