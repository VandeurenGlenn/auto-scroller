'use strict';
/**
 * class AutoScroller
 * @extends HTMLElement
 */
export default class AutoScroller extends HTMLElement {

   static get observedAttributes() {
     return ['target']
   };

   /**
    * set 'disable-on-start' attribute or when using in other class,
    * pass 'start' in super,
    * @param {Object} opts options
    * @param {Boolean} opts.start wether or not to start on creation
    * @param {HTMLElement} opts.target the target to scroll
    * @example super({start: false})
    *
    * @defaultvalue {Object} {start: true, target: document}
    */
   constructor(opts={start:true, target: document}) {
     super();
     this.target = opts.target;
     if (opts && opts.start || !this.hasAttribute('disable-on-start')) {
       this.start();
     }
   }

   /**
    * @param {HTMLElement} value
    * @private
    */
   set target(value) {
     this._target = value;
     this._setEventListeners();
   }

   /**
    * @param {Number} value
    * @private
    */
   set scrollPosition(value) {
     this._scrollPosition = value;
   }

   /**
    * @param {Number} value
    * @private
    */
   set previousScrollPosition(value) {
     this._previousScrollPosition = value;
   }

   /**
    * @param {Number} value
    * @private
    */
   set scrollSpeed(value) {
     this._scrollSpeed = value;
   }

   /**
    * @return {HTMLElement} target
    * @default {HTMLElement} document
    */
   get target() {
     return this._target;
   }

   /**
    * @return {Number} scrollSpeed * 16
    * @default {Number} 16
    */
   get scrollSpeed() {
     return (this._scrollSpeed * 16) || 16;
   }

   /**
    * @return {Number}
    * @default {Number} 0
    */
   get scrollPosition() {
     return this._scrollPosition || 0;
   }

   /**
    * @return {Number}
    * @default {Number} 0
    */
   get previousScrollPosition() {
     return this._previousScrollPosition || 0;
   }

   /**
    * @type {boolean}
    * @returns false when no-propagation is defined
    * @default true
    */
   get stopPropagation() {
     return !this.hasAttribute('no-propagation') || true;
   }

   /**
    * @type {Boolean}
    * @private
    */
   set scrolledBottom(value) {
     this._scrolledBottom = value;
   }

  /**
   * @type {Boolean}
   * @returns {Boolean}
   * @private
   */
   get scrolledBottom() {
     return this._scrolledBottom;
   }

   /**
    * Runs whenever given attribute in the observedAttributes array changes
    * @param {String} name attribute name
    * @param {HTMLElement} oldVal
    * @param {HTMLElement} newVal
    */
   attributeChangedCallback(name, oldVal, newVal) {
     if (oldVal !== newVal) {
       this[name] = newVal;
     }
   }

   /**
    * Starts scrolling
    */
   start() {
     this._scroll(this.target);
   }

   /**
    * @param {HTMLElement} target the chosen target to scroll
    */
   _scroll(target) {
     let scrollSpeed = this.scrollSpeed;
     let scrollingElement = target.scrollingElement || target;
     let scrollHeight = (scrollingElement.scrollHeight / 3);

     setInterval(() => {
       if (this.previousScrollPosition === scrollHeight) {
         this.scrolledBottom = true;
      } else if (this.previousScrollPosition === 0) {
        this.scrolledBottom = false;
      }

      if (this.scrolledBottom) {
        this.scrollPosition -= this.scrollSpeed;
      } else {
        this.scrollPosition += this.scrollSpeed / 32;
      }
      this.scrollPosition = this._between(this.scrollPosition, 0, scrollHeight);
      requestAnimationFrame(() => {
        scrollingElement.style.transform = 'translateY(-' + this.scrollPosition + 'px)';
      });
      this.previousScrollPosition = this.scrollPosition;
    }, 16);
   }

   /**
    * Listens for scroll events on the target
    */
   _setEventListeners() {
     this.target.addEventListener('scroll', this._onScroll);
   }

   /**
    * @event auto-scroller-scroll
    * @type {object}
    * @property {Number} position the current scroll position
    * @property {String} direction
    */
    /**
     * @fires auto-scroller-scroll
     */
   _onScroll(event) {
     event.preventDefault();
     if (this.stopPropagation) {
       event.stopPropagation();
     }
     document.dispatchEvent(
       new CustomEvent(`auto-scroller-scroll`, {
         detail: {
           position: (this.scrollPosition / 100),
           direction: this.scrolledBottom ? 'up' : 'down'
         }
       }));
   }

   _between(value, min, max) {
     return Math.min(max, Math.max(min, value))
   }
}
customElements.define('auto-scroller', AutoScroller);
