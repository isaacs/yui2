/*                                                                                                                                                      Copyright (c) 2006, Yahoo! Inc. All rights reserved.Code licensed under the BSD License:http://developer.yahoo.net/yui/license.txtversion: 0.12.0*/ YAHOO.util.CustomEvent=function(_1,_2,_3,_4){this.type=_1;this.scope=_2||window;this.silent=_3;this.signature=_4||YAHOO.util.CustomEvent.LIST;this.subscribers=[];if(!this.silent){}var _5="_YUICEOnSubscribe";if(_1!==_5){this.subscribeEvent=new YAHOO.util.CustomEvent(_5,this,true);}};YAHOO.util.CustomEvent.LIST=0;YAHOO.util.CustomEvent.FLAT=1;YAHOO.util.CustomEvent.prototype={subscribe:function(fn,_7,_8){if(this.subscribeEvent){this.subscribeEvent.fire(fn,_7,_8);}this.subscribers.push(new YAHOO.util.Subscriber(fn,_7,_8));},unsubscribe:function(fn,_9){var _10=false;for(var i=0,len=this.subscribers.length;i<len;++i){var s=this.subscribers[i];if(s&&s.contains(fn,_9)){this._delete(i);_10=true;}}return _10;},fire:function(){var len=this.subscribers.length;if(!len&&this.silent){return true;}var _14=[],ret=true,i;for(i=0;i<arguments.length;++i){_14.push(arguments[i]);}var _15=_14.length;if(!this.silent){}for(i=0;i<len;++i){var s=this.subscribers[i];if(s){if(!this.silent){}var _16=s.getScope(this.scope);if(this.signature==YAHOO.util.CustomEvent.FLAT){var _17=null;if(_14.length>0){_17=_14[0];}ret=s.fn.call(_16,_17,s.obj);}else{ret=s.fn.call(_16,this.type,_14,s.obj);}if(false===ret){if(!this.silent){}return false;}}}return true;},unsubscribeAll:function(){for(var i=0,len=this.subscribers.length;i<len;++i){this._delete(len-1-i);}},_delete:function(_18){var s=this.subscribers[_18];if(s){delete s.fn;delete s.obj;}this.subscribers.splice(_18,1);},toString:function(){return "CustomEvent: "+"'"+this.type+"', "+"scope: "+this.scope;}};YAHOO.util.Subscriber=function(fn,obj,_20){this.fn=fn;this.obj=obj||null;this.override=_20;};YAHOO.util.Subscriber.prototype.getScope=function(_21){if(this.override){if(this.override===true){return this.obj;}else{return this.override;}}return _21;};YAHOO.util.Subscriber.prototype.contains=function(fn,obj){return (this.fn==fn&&this.obj==obj);};YAHOO.util.Subscriber.prototype.toString=function(){return "Subscriber { obj: "+(this.obj||"")+", override: "+(this.override||"no")+" }";};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var _22=false;var _23=[];var _24=[];var _25=[];var _26=[];var _27=[];var _28=0;var _29=[];var _30=[];var _31=0;return {POLL_RETRYS:200,POLL_INTERVAL:50,EL:0,TYPE:1,FN:2,WFN:3,OBJ:3,ADJ_SCOPE:4,isSafari:(/Safari|Konqueror|KHTML/gi).test(navigator.userAgent),isIE:(!this.isSafari&&!navigator.userAgent.match(/opera/gi)&&navigator.userAgent.match(/msie/gi)),addDelayedListener:function(el,_33,fn,obj,_34){_24[_24.length]=[el,_33,fn,obj,_34];if(_22){_28=this.POLL_RETRYS;this.startTimeout(0);}},startTimeout:function(_35){var i=(_35||_35===0)?_35:this.POLL_INTERVAL;var _36=this;var _37=function(){_36._tryPreloadAttach();};this.timeout=setTimeout(_37,i);},onAvailable:function(_38,_39,_40,_41){_29.push({id:_38,fn:_39,obj:_40,override:_41});_28=this.POLL_RETRYS;this.startTimeout(0);},addListener:function(el,_42,fn,obj,_43){if(!fn||!fn.call){return false;}if(this._isValidCollection(el)){var ok=true;for(var i=0,len=el.length;i<len;++i){ok=this.on(el[i],_42,fn,obj,_43)&&ok;}return ok;}else{if(typeof el=="string"){var oEl=this.getEl(el);if(_22&&oEl){el=oEl;}else{this.addDelayedListener(el,_42,fn,obj,_43);return true;}}}if(!el){return false;}if("unload"==_42&&obj!==this){_25[_25.length]=[el,_42,fn,obj,_43];return true;}var _46=el;if(_43){if(_43===true){_46=obj;}else{_46=_43;}}var _47=function(e){return fn.call(_46,YAHOO.util.Event.getEvent(e),obj);};var li=[el,_42,fn,_47,_46];var _50=_23.length;_23[_50]=li;if(this.useLegacyEvent(el,_42)){var _51=this.getLegacyIndex(el,_42);if(_51==-1||el!=_26[_51][0]){_51=_26.length;_30[el.id+_42]=_51;_26[_51]=[el,_42,el["on"+_42]];_27[_51]=[];el["on"+_42]=function(e){YAHOO.util.Event.fireLegacyEvent(YAHOO.util.Event.getEvent(e),_51);};}_27[_51].push(li);}else{this._simpleAdd(el,_42,_47,false);}return true;},fireLegacyEvent:function(e,_52){var ok=true;var le=_27[_52];for(var i=0,len=le.length;i<len;++i){var li=le[i];if(li&&li[this.WFN]){var _54=li[this.ADJ_SCOPE];var ret=li[this.WFN].call(_54,e);ok=(ok&&ret);}}return ok;},getLegacyIndex:function(el,_56){var key=this.generateId(el)+_56;if(typeof _30[key]=="undefined"){return -1;}else{return _30[key];}},useLegacyEvent:function(el,_58){if(!el.addEventListener&&!el.attachEvent){return true;}else{if(this.isSafari){if("click"==_58||"dblclick"==_58){return true;}}}return false;},removeListener:function(el,_59,fn,_60){if(!fn||!fn.call){return false;}var i,len;if(typeof el=="string"){el=this.getEl(el);}else{if(this._isValidCollection(el)){var ok=true;for(i=0,len=el.length;i<len;++i){ok=(this.removeListener(el[i],_59,fn)&&ok);}return ok;}}if("unload"==_59){for(i=0,len=_25.length;i<len;i++){var li=_25[i];if(li&&li[0]==el&&li[1]==_59&&li[2]==fn){_25.splice(i,1);return true;}}return false;}var _61=null;if("undefined"==typeof _60){_60=this._getCacheIndex(el,_59,fn);}if(_60>=0){_61=_23[_60];}if(!el||!_61){return false;}if(this.useLegacyEvent(el,_59)){var _62=this.getLegacyIndex(el,_59);var _63=_27[_62];if(_63){for(i=0,len=_63.length;i<len;++i){li=_63[i];if(li&&li[this.EL]==el&&li[this.TYPE]==_59&&li[this.FN]==fn){_63.splice(i,1);}}}}else{this._simpleRemove(el,_59,_61[this.WFN],false);}delete _23[_60][this.WFN];delete _23[_60][this.FN];_23.splice(_60,1);return true;},getTarget:function(ev,_65){var t=ev.target||ev.srcElement;return this.resolveTextNode(t);},resolveTextNode:function(_67){if(_67&&3==_67.nodeType){return _67.parentNode;}else{return _67;}},getPageX:function(ev){var x=ev.pageX;if(!x&&0!==x){x=ev.clientX||0;if(this.isIE){x+=this._getScrollLeft();}}return x;},getPageY:function(ev){var y=ev.pageY;if(!y&&0!==y){y=ev.clientY||0;if(this.isIE){y+=this._getScrollTop();}}return y;},getXY:function(ev){return [this.getPageX(ev),this.getPageY(ev)];},getRelatedTarget:function(ev){var t=ev.relatedTarget;if(!t){if(ev.type=="mouseout"){t=ev.toElement;}else{if(ev.type=="mouseover"){t=ev.fromElement;}}}return this.resolveTextNode(t);},getTime:function(ev){if(!ev.time){var t=new Date().getTime();try{ev.time=t;}catch(e){return t;}}return ev.time;},stopEvent:function(ev){this.stopPropagation(ev);this.preventDefault(ev);},stopPropagation:function(ev){if(ev.stopPropagation){ev.stopPropagation();}else{ev.cancelBubble=true;}},preventDefault:function(ev){if(ev.preventDefault){ev.preventDefault();}else{ev.returnValue=false;}},getEvent:function(e){var ev=e||window.event;if(!ev){var c=this.getEvent.caller;while(c){ev=c.arguments[0];if(ev&&Event==ev.constructor){break;}c=c.caller;}}return ev;},getCharCode:function(ev){return ev.charCode||ev.keyCode||0;},_getCacheIndex:function(el,_71,fn){for(var i=0,len=_23.length;i<len;++i){var li=_23[i];if(li&&li[this.FN]==fn&&li[this.EL]==el&&li[this.TYPE]==_71){return i;}}return -1;},generateId:function(el){var id=el.id;if(!id){id="yuievtautoid-"+_31;++_31;el.id=id;}return id;},_isValidCollection:function(o){return (o&&o.length&&typeof o!="string"&&!o.tagName&&!o.alert&&typeof o[0]!="undefined");},elCache:{},getEl:function(id){return document.getElementById(id);},clearCache:function(){},_load:function(e){_22=true;var EU=YAHOO.util.Event;EU._simpleRemove(window,"load",EU._load);},_tryPreloadAttach:function(){if(this.locked){return false;}this.locked=true;var _75=!_22;if(!_75){_75=(_28>0);}var _76=[];for(var i=0,len=_24.length;i<len;++i){var d=_24[i];if(d){var el=this.getEl(d[this.EL]);if(el){this.on(el,d[this.TYPE],d[this.FN],d[this.OBJ],d[this.ADJ_SCOPE]);delete _24[i];}else{_76.push(d);}}}_24=_76;var _78=[];for(i=0,len=_29.length;i<len;++i){var _79=_29[i];if(_79){el=this.getEl(_79.id);if(el){var _80=el;if(_79.override){if(_79.override===true){_80=_79.obj;}else{_80=_79.override;}}_79.fn.call(_80,_79.obj);delete _29[i];}else{_78.push(_79);}}}_28=(_76.length===0&&_78.length===0)?0:_28-1;if(_75){this.startTimeout();}this.locked=false;return true;},purgeElement:function(el,_81,_82){var _83=this.getListeners(el,_82);if(_83){for(var i=0,len=_83.length;i<len;++i){var l=_83[i];this.removeListener(el,l.type,l.fn);}}if(_81&&el&&el.childNodes){for(i=0,len=el.childNodes.length;i<len;++i){this.purgeElement(el.childNodes[i],_81,_82);}}},getListeners:function(el,_85){var _86=[];if(_23&&_23.length>0){for(var i=0,len=_23.length;i<len;++i){var l=_23[i];if(l&&l[this.EL]===el&&(!_85||_85===l[this.TYPE])){_86.push({type:l[this.TYPE],fn:l[this.FN],obj:l[this.OBJ],adjust:l[this.ADJ_SCOPE],index:i});}}}return (_86.length)?_86:null;},_unload:function(e){var EU=YAHOO.util.Event,i,j,l,len,index;for(i=0,len=_25.length;i<len;++i){l=_25[i];if(l){var _87=window;if(l[EU.ADJ_SCOPE]){if(l[EU.ADJ_SCOPE]===true){_87=l[EU.OBJ];}else{_87=l[EU.ADJ_SCOPE];}}l[EU.FN].call(_87,EU.getEvent(e),l[EU.OBJ]);delete _25[i];l=null;_87=null;}}if(_23&&_23.length>0){j=_23.length;while(j){index=j-1;l=_23[index];if(l){EU.removeListener(l[EU.EL],l[EU.TYPE],l[EU.FN],index);}j=j-1;}l=null;EU.clearCache();}for(i=0,len=_26.length;i<len;++i){delete _26[i][0];delete _26[i];}EU._simpleRemove(window,"unload",EU._unload);},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var dd=document.documentElement,db=document.body;if(dd&&(dd.scrollTop||dd.scrollLeft)){return [dd.scrollTop,dd.scrollLeft];}else{if(db){return [db.scrollTop,db.scrollLeft];}else{return [0,0];}}},_simpleAdd:function(){if(window.addEventListener){return function(el,_89,fn,_90){el.addEventListener(_89,fn,(_90));};}else{if(window.attachEvent){return function(el,_91,fn,_92){el.attachEvent("on"+_91,fn);};}else{return function(){};}}}(),_simpleRemove:function(){if(window.removeEventListener){return function(el,_93,fn,_94){el.removeEventListener(_93,fn,(_94));};}else{if(window.detachEvent){return function(el,_95,fn){el.detachEvent("on"+_95,fn);};}else{return function(){};}}}()};}();YAHOO.util.Event.on=YAHOO.util.Event.addListener;if(document&&document.body){YAHOO.util.Event._load();}else{YAHOO.util.Event._simpleAdd(window,"load",YAHOO.util.Event._load);}YAHOO.util.Event._simpleAdd(window,"unload",YAHOO.util.Event._unload);YAHOO.util.Event._tryPreloadAttach();}YAHOO.util.EventPublisher=function(){};YAHOO.util.EventPublisher.prototype={subscribe:function(_96,_97,_98,_99){this.__yui_events=this.__yui_events||{};var ce=this.__yui_events[_96];if(ce){ce.subscribe(_97,_98,_99);}else{this.__yui_subscribers=this.__yui_subscribers||{};var subs=this.__yui_subscribers;if(!subs[_96]){subs[_96]=[];}subs[_96].push({fn:_97,obj:_98,override:_99});}},createEvent:function(_102,_103){this.__yui_events=this.__yui_events||{};var opts=_103||{};var _105=this.__yui_events;if(_105[_102]){}else{var _106=opts.scope||this;var ce=new YAHOO.util.CustomEvent(_102,_106,opts.silent,YAHOO.util.CustomEvent.FLAT);_105[_102]=ce;if(opts.onSubscribeCallback){ce.subscribeEvent.subscribe(opts.onSubscribeCallback);}this.__yui_subscribers=this.__yui_subscribers||{};var qs=this.__yui_subscribers[_102];if(qs){for(var i=0;i<qs.length;++i){ce.subscribe(qs[i].fn,qs[i].obj,qs[i].override);}}}return _105[_102];},fireEvent:function(_108,arg1,arg2,etc){this.__yui_events=this.__yui_events||{};var ce=this.__yui_events[_108];if(ce){var args=[];for(var i=1;i<arguments.length;++i){args.push(arguments[i]);}return ce.fire.apply(ce,args);}else{return false;}}};