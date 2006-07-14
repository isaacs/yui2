/**
 * @class Anim subclass for moving elements along a path defined by the "points" member of "attributes".  All "points" are arrays with x, y coordinates.
 * <p>Usage: <code>var myAnim = new YAHOO.util.Motion(el, { points: { to: [800, 800] } }, 1, YAHOO.util.Easing.easeOut);</code></p>
 * @requires YAHOO.util.Anim
 * @requires YAHOO.util.AnimMgr
 * @requires YAHOO.util.Easing
 * @requires YAHOO.util.Bezier
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 * @requires YAHOO.util.CustomEvent 
 * @constructor
 * @param {String or HTMLElement} el Reference to the element that will be animated
 * @param {Object} attributes The attribute(s) to be animated.  
 * Each attribute is an object with at minimum a "to" or "by" member defined.  
 * Additional optional members are "from" (defaults to current value), "units" (defaults to "px").  
 * All attribute names use camelCase.
 * @param {Number} duration (optional, defaults to 1 second) Length of animation (frames or seconds), defaults to time-based
 * @param {Function} method (optional, defaults to YAHOO.util.Easing.easeNone) Computes the values that are applied to the attributes per frame (generally a YAHOO.util.Easing method)
 */
(function() {
   YAHOO.util.Motion = function(el, attributes, duration,  method) {
      if (el) { // dont break existing subclasses not using YAHOO.extend
         YAHOO.util.Motion.superclass.constructor.call(this, el, attributes, duration, method);
      }
   };

   YAHOO.extend(YAHOO.util.Motion, YAHOO.util.ColorAnim);
   
   // shorthand
   var Y = YAHOO.util;
   var superclass = Y.Motion.superclass;
   var proto = Y.Motion.prototype;

   /**
    * toString method
    * @return {String} string represenation of anim obj
    */
   proto.toString = function() {
      var el = this.getEl();
      var id = el.id || el.tagName;
      return ("Motion " + id);
   };
   
   proto.patterns.points = /^points$/i;
   
   /**
    * Applies a value to an attribute
    * @param {String} attr The name of the attribute.
    * @param {Number} val The value to be applied to the attribute.
    * @param {String} unit The unit ('px', '%', etc.) of the value.
    */
   proto.setAttribute = function(attr, val, unit) {
      if (  this.patterns.points.test(attr) ) {
         unit = unit || 'px';
         superclass.setAttribute.call(this, 'left', val[0], unit);
         superclass.setAttribute.call(this, 'top', val[1], unit);
      } else {
         superclass.setAttribute.call(this, attr, val, unit);
      }
   };
   
   /**
    * Sets the default value to be used when "from" is not supplied.
    * @param {String} attr The attribute being set.
    * @param {Number} val The default value to be applied to the attribute.
    */
   proto.getAttribute = function(attr) {
      if (  this.patterns.points.test(attr) ) {
         var val = [
            superclass.getAttribute.call(this, 'left'),
            superclass.getAttribute.call(this, 'top')
         ];
      } else {
         val = superclass.getAttribute.call(this, attr);
      }

      return val;
   };
   
   /**
    * Returns the value computed by the animation's "method".
    * @param {String} attr The name of the attribute.
    * @param {Number} start The value this attribute should start from for this animation.
    * @param {Number} end  The value this attribute should end at for this animation.
    * @return {Number} The Value to be applied to the attribute.
    */
   proto.doMethod = function(attr, start, end) {
      var val = null;

      if ( this.patterns.points.test(attr) ) {
         var t = this.method(this.currentFrame, 0, 100, this.totalFrames) / 100;				
         val = Y.Bezier.getPosition(this.runtimeAttributes[attr], t);
      } else {
         val = superclass.doMethod.call(this, attr, start, end);
      }
      return val;
   };
   
   /**
    * Sets the actual values to be used during the animation.
    * Should only be needed for subclass use.
    * @param {Object} attr The attribute object
    * @private 
    */
   proto.setRuntimeAttribute = function(attr) {
      if ( this.patterns.points.test(attr) ) {
         var el = this.getEl();
         var attributes = this.attributes;
         var start;
         var control = attributes['points']['control'] || [];
         var end;
         var i, len;
         
         if (control.length > 0 && !(control[0] instanceof Array) ) { // could be single point or array of points
            control = [control];
         } else { // break reference to attributes.points.control
            var tmp = []; 
            for (i = 0, len = control.length; i< len; ++i) {
               tmp[i] = control[i];
            }
            control = tmp;
         }

         if (Y.Dom.getStyle(el, 'position') == 'static') { // default to relative
            Y.Dom.setStyle(el, 'position', 'relative');
         }
   
         if ( isset(attributes['points']['from']) ) {
            Y.Dom.setXY(el, attributes['points']['from']); // set position to from point
         } 
         else { Y.Dom.setXY( el, Y.Dom.getXY(el) ); } // set it to current position
         
         start = this.getAttribute('points'); // get actual top & left
         
         // TO beats BY, per SMIL 2.1 spec
         if ( isset(attributes['points']['to']) ) {
            end = translateValues.call(this, attributes['points']['to'], start);
            
            var pageXY = Y.Dom.getXY(this.getEl());
            for (i = 0, len = control.length; i < len; ++i) {
               control[i] = translateValues.call(this, control[i], start);
            }

            
         } else if ( isset(attributes['points']['by']) ) {
            end = [ start[0] + attributes['points']['by'][0], start[1] + attributes['points']['by'][1] ];
            
            for (i = 0, len = control.length; i < len; ++i) {
               control[i] = [ start[0] + control[i][0], start[1] + control[i][1] ];
            }
         }

         this.runtimeAttributes[attr] = [start];
         
         if (control.length > 0) {
            this.runtimeAttributes[attr] = this.runtimeAttributes[attr].concat(control); 
         }

         this.runtimeAttributes[attr][this.runtimeAttributes[attr].length] = end;
      }
      else {
         superclass.setRuntimeAttribute.call(this, attr);
      }
   };
   
   var translateValues = function(val, start) {
      var pageXY = Y.Dom.getXY(this.getEl());
      val = [ val[0] - pageXY[0] + start[0], val[1] - pageXY[1] + start[1] ];

      return val; 
   };
   
   var isset = function(prop) {
      return (typeof prop !== 'undefined');
   };
})();
