/*!
 * landingScrol 0.0.1 Beta
 * https://github.com/alvarotrigo/landingScroll.js
 * @license MIT licensed
 *
 * Copyright (C) 2015 alvarotrigo.com - A project by Alvaro Trigo
 */
function landingScroll(element, options){

    var defaults = {
        header: '.header',
        content: '.content',
        easingHeader: [0.7, 0, 0.3, 1],
        speedHeader: 1200,
        easingContent: [500,20],
        resistance: true,
        blockedScrollbar: false,
    };

    options = extend(defaults, options);

    var isMoving = false;
    var revealed = false;
    var startPoint = 0;
    var endPoint = 0;
    var usingScrollbar = false;
    var body = $("body");
    var headerObject = $(options.header);
    var contentObject = $(options.content);
    var scrollings = [];

    // Detect if the browser is IE or not.
    var isIE = document.all?true:false

    //use one or another syntax depending on the existance of jQuery library on the site
    if (window.jQuery) { var V = $.Velocity;} else { var V = Velocity;}

    //the fun begins!
    init();

    /**
    * Initializes the plugin.
    */
    function init(){
        styleElements();

        if(options.blockedScrollbar){
            addFakeScroll();
            addMouseDownHandler();
            addMouseUpHandler();
        }else{
            addScrollHandler();
        }

        addResizeHandler();
        addMouseWheelHandler();
        addKeydownHandler();
    }

    /**
    * Sets CSS properties to elements.
    */
    function styleElements(){
        css(headerObject, {
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            zIndex: '1500'
        });

        css(contentObject, {
            position: 'absolute',
            top: (getWindowHeight() / 2) + 'px',
            zIndex: '1000',
            opacity: '0'
        });
    }

    /**
    * Adds a fake scroll-bar.
    * This "hack" is used to solve problems with IE.
    */
    function addFakeScroll(){
        var div = document.createElement('div');

        var fakeScroll = '<div id="avoidScroll"></div><div id="fakeScroller"><div id="fakeContent" style="height:'+ contentObject.scrollHeight + 'px"></div></div>';
        div.innerHTML = fakeScroll;

        $('body').appendChild(div);
        window.scrollTo(0,0);
    }

    /**
    * Detection of click with the mouse.
    * Used to detect the start a drag on the fake scroll bar.
    */
    function addMouseDownHandler(){
        if (document.addEventListener) {
            document.addEventListener("mousedown", MouseDownHandler, false); //IE9, Chrome, Safari, Oper
        } else {
            document.attachEvent("onmousedown", MouseDownHandler); //IE 6/7/8
        }
    }


    /**
    * Adds the handler to detect the mouse up action.
    * Used to detect the end of a drag on the fake scroll bar.
    */
    function addMouseUpHandler(){
        if (document.addEventListener) {
            document.addEventListener("mouseup", removeMouseMove, false); //IE9, Chrome, Safari, Oper
        } else {
            document.attachEvent("onmouseup", removeMouseMove); //IE 6/7/8
        }
    }


    /**
    * Adds the handler to detect the move of the mouse.
    * Used to detect the "drag" of the mouse over the fake scroll bar.
    */
    function addMouseMoveHandler(){
        if (document.addEventListener) {
            document.querySelector("#avoidScroll").addEventListener("mousemove", MouseMoveHandler, false); //IE9, Chrome, Safari, Oper
        } else {
            document.querySelector("#avoidScroll").attachEvent("onmousemove", MouseMoveHandler); //IE 6/7/8
        }
    }


    /**
    * Removes the mouse move detection.
    */
    function removeMouseMove(){
        var fakeScroller = document.querySelector("#avoidScroll");
        if(fakeScroller){
            if (document.addEventListener) {
                fakeScroller.removeEventListener('mousemove', MouseMoveHandler, false); //IE9, Chrome, Safari, Oper
            } else {
                fakeScroller.detachEvent("onmousemove", MouseMoveHandler); //IE 6/7/8
            }
        }
    }

    /**
     * Adds the auto scrolling action for the mouse wheel and tackpad.
     * After this function is called, the mousewheel and trackpad movements will scroll only when we desire.
     */
    function addMouseWheelHandler() {
        if (document.addEventListener) {
            document.addEventListener("mousewheel", MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
            document.addEventListener("wheel", MouseWheelHandler, false); //Firefox
        } else {
            document.attachEvent("onmousewheel", MouseWheelHandler); //IE 6/7/8
        }
    }


     /**
     * Removes the auto scrolling action for the mouse wheel and tackpad.
     * After this function is called, the mousewheel will act normally.
     */
    function removesMouseWheelHandler() {
        if (document.addEventListener) {
            document.removeEventListener("mousewheel", MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
            document.removeEventListener("wheel", MouseWheelHandler, false); //Firefox
        } else {
            document.detachEvent("onmousewheel", MouseWheelHandler); //IE 6/7/8
        }
    }

    /**
    * MoveDown handler.
    * Used to detect the start a drag on the fake scroll bar.
    */
    function MouseDownHandler(e){
        e = e || window.event;
        var target = e.target || e.srcElement;

        //for dynamic elements: http://stackoverflow.com/a/9649651/1081396
        if(target.getAttribute('id') == "avoidScroll"){
            starPoint = 0;
            endPoint = 0;
            startPoint = getMouseY(e);
            addMouseMoveHandler(e);
        }
    }

    /**
     * Adds the handler for the scrolling event.
     */
    function addScrollHandler() {
        if (document.addEventListener) {
            window.addEventListener("scroll", scrollHandler, false); //IE9, Chrome, Safari, Oper
        } else {
            window.attachEvent("onscroll", scrollHandler); //IE 6/7/8
        }
    }

    /**
    * Adds the handler for the keydown event
    */
    function addKeydownHandler() {
        if (document.addEventListener) {
            document.addEventListener("keydown", keydownHandler, false); //IE9, Chrome, Safari, Oper
        } else {
            document.attachEvent("onkeydown", keydownHandler); //IE 6/7/8
        }
    }

    function addResizeHandler(){
        if (document.addEventListener) {
            window.addEventListener("resize", resizeHandler, false);
        }else{
            window.attachEvent('onresize', resizeHandler);
        }
    }

    var resizeId;
    function resizeHandler(){
        //in order to call the functions only when the resize is finished
        resizeId = setTimeout(function(){
            doneResizing();
        },500);
    }

    function doneResizing(){
        //updateElementsDisplay();
    }

    /*
    * Used to detect the "drag" of the mouse over the fake scroll bar.
    */
    function MouseMoveHandler(event){
        endPoint = getMouseY(event);

        if(startPoint < endPoint){
            moveDown();
        }
    }

    /**
    * Gets the Y axis of the mouse's position.
    */
    function getMouseY(e){
        if(isIE){
            return e.clientY;
        }

        return e.pageY
    }

    /**
    * Moves the site down and brings the content into the viewport.
    */
    function moveDown() {
        if(!isMoving){
            isMoving = true;

            V(headerObject, {
                'top': '-100%',
                'opacity': 0,
                'scale': '0.9'
            }, options.speedHeader, options.easingHeader);


            V(contentObject, {
                    'top': 0,
                    'opacity': 1
                }, {
                    delay: 600,
                    duration: 1300,
                    easing: options.easingContent,
                    complete: function(){
                        addScrollHandler();

                        if(options.blockedScrollbar){
                            var avoidScroll = $('#avoidScroll');
                            var fakeScroller = $('#fakeScroller');

                            avoidScroll.parentNode.removeChild(avoidScroll);
                            fakeScroller.parentNode.removeChild(fakeScroller);

                            css($('body'), 'overflow', 'auto');
                            css($('html'), 'overflow', 'auto');
                        }

                        isMoving = false;
                        revealed = true;
                    }
                });
        }
    }


    /**
    * Moves the site up and brings the header into the viewport.
    */
    function moveUp() {
        if(!isMoving){

            isMoving = true;
            V(headerObject,'reverse', {
                'easing': options.easingHeader
            });

            if(options.blockedScrollbar){
                css($('body'), 'overflow', 'hidden');
                css($('html'),'overflow', 'hidden');

                addFakeScroll();
            }

           revealed = false;

           V(contentObject, {
                'top': '500px',
                'opacity': 0
            }, {
                duration: 1600,
                easing: [500,20],
                complete: function(){
                    isMoving = false;
                }
            });
       }
   }

    function preventDefault(e){
        if(e.preventDefault){
            e.preventDefault();
        }else{
            e.returnValue = false;
        }
    }


    var oldDelta = 0;
   /**
     * Detecting mousewheel scrolling
     *
     * http://blogs.sitepointstatic.com/examples/tech/mouse-wheel/index.html
     * http://www.sitepoint.com/html5-javascript-mouse-wheel/
     */
    function MouseWheelHandler(e) {
        var curTime = new Date().getTime();

        if(!usingScrollbar){
            // cross-browser wheel delta
            e = window.event || e;

            if(!revealed){
                console.warn("prevengo");
                preventDefault(e);
            }

            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.deltaY || -e.detail)));
            var deltaNow = (e.wheelDelta || -e.deltaY || -e.detail);

            /*
            //Limiting the array to 150 (lets not waste memory!)
            if(scrollings.length > 149){
                scrollings.shift();
            }

            //keeping record of the previous scrollings
            scrollings.push(Math.abs(deltaNow));

            //time difference between the last scroll and the current one
            var timeDiff = curTime-prevTime;
            prevTime = curTime;


            //haven't they scrolled in a while?
            //(enough to be consider a different scrolling action to scroll another section)
            if(timeDiff > 200){
                //emptying the array, we dont care about old scrollings for our averages
                scrollings = [];
            }
            */

            console.log(deltaNow);

            oldDelta = deltaNow

            if(!isMoving){
                var averageEnd = getAverage(scrollings, 10);
                var averageMiddle = getAverage(scrollings, 70);
                var isAccelerating = averageEnd >= averageMiddle;

                //scrolling down?
                if (delta < 0) {
                    if(!revealed){
                        moveDown();
                        return false;
                    }
                }

                //moving up
                else{
                    //prevent easing in MacOS X
                    if(isAtTheTop()){
                        preventDefault(e);
                    }
                    if(revealed && allowScroll() && isAtTheTop() ){
                        moveUp();
                    }
                }
            }
        }
    }

    var prevTime = new Date().getTime();
    function allowScroll(){
        //resistance ON
        var result = false;
        var curTime = new Date().getTime();
        if(typeof prevTime !== 'undefined' && options.resistance){
            var timeDiff = curTime-prevTime;
            if(timeDiff>50){
                result = true;
            }
        }
        prevTime = curTime;

        return result;
    }

    /**
    * Gets the average of the last `number` elements of the given array.
    */
    function getAverage(elements, number){
        var sum = 0;

        //taking `number` elements from the end to make the average, if there are not enought, 1
        var lastElements = elements.slice(Math.max(elements.length - number, 1));

        for(var i = 0; i < lastElements.length; i++){
            sum = sum + lastElements[i];
        }

        return Math.ceil(sum/number);
    }


    /**
    * The site will be scrolled up if the content is at the top
    * and the scroll-bar is at the top.
    */
    function scrollHandler(){
        if(!options.blockedScrollbar && !revealed){
            //scrolling with scroll bar
            if(!isMoving){
                usingScrollbar = true;
            }

            var headerOffset = updateElementsDisplay();

            if(!headerOffset){
                revealed = false;
                usingScrollbar = false;
                setOpacity(contentObject, 0);
            }
            else if(headerOffset == (getWindowHeight() / 2)){
                revealed = true;
            }
        }


        if(!usingScrollbar){
            if(options.resistance){
                if(isAtTheTop() && allowScroll()){
                    console.log('---New kinetic scroll has started!');
                    moveUp();
                }
            }

            //no resistance
            else{
                if(isAtTheTop()){
                    moveUp();
                }
            }
        }
    }

    /**
    * Sets the css properties for the header and content elements depending on the current scroll.
    */
    function updateElementsDisplay(){
        var currentScroll = getScrollTop();

        var headerOffset = getWindowHeight() - (getWindowHeight() - currentScroll);
        css(headerObject, {
            top:  '-' + headerOffset+ 'px',
            bottom: 'auto'
        });

        css(contentObject, 'top', (getWindowHeight() / 2 )+ 'px');
        setOpacity(contentObject, 100);


        return headerOffset;
    }

    /**
    * Sets the opacity for a given element
    */
    function setOpacity(element, value){
        css(element, {
            opacity: 'value',
            filter: 'alpha(opacity='+ value +')'
        }); //(filter for IE 8)
    }

    /**
    * Determines if the content's scroll-bar is at the top.
    */
    function isAtTheTop(){
        return getScrollTop()<=0 && revealed && !isMoving;
    }

    /**
    * Keydown handler.
    */
    function keydownHandler(e){
        e = window.event || e;
        var charCode = e.charCode || e.keyCode;

        switch (charCode) {
            //up
            case 38:
            case 33:
                if(isAtTheTop()){
                    moveUp();
                }
                break;

            //down
            case 40:
            case 34:
                if(!revealed){
                    moveDown();
                }
                break;

            //Home
            case 36:
                if(isAtTheTop()){
                    moveUp();
                }
                break;

            //End
            case 35:
                if(!revealed){
                    moveDown();
                }
                break;
        }
    }

    /* --------------- Javascript helpers  ---------------*/

    /**
    * Replacement of jQuery extend method.
    */
    function extend(defaultOptions, options){
        //creating the object if it doesnt exist
        if(typeof(options) !== 'object'){
            options = {};
        }

        for(var key in options){
            if(defaultOptions.hasOwnProperty(key)){
                defaultOptions[key] = options[key];
            }
        }

        return defaultOptions;
    }

    function css( el, props ) {
        var key;
        for ( key in props ) {
            if ( props.hasOwnProperty(key) ) {
                if ( key !== null ) {
                    el.style[key] = props[key];
                }
            }
        }
        return el;
    }

    function setCss(element, style, value){
        element.style[style] = value;
    }

    function $(selector, context){
        context = context || document;
        return context.querySelector(selector);
    }

    function $$(selector, context){
        context = context || document;
        return context.querySelectorAll(selector);
    }

    function getNodeIndex(node) {
        var index = 0;
        while ( (node = node.previousSibling) ) {
            if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
                index++;
            }
        }
        return index;
    }

    function toggle(element, display) {
        if(typeof display!== 'undefined'){
            if(display){
                element.style.display = 'block';
            }else{
                element.style.display = 'none';
            }
        }
        else{
            if( element.style.display == 'block' ) {
                element.style.display = 'none';
            } else {
                element.style.display = 'block';
            }
        }

        return element;
    }

    //http://jaketrent.com/post/addremove-classes-raw-javascript/
    function hasClass(ele,cls) {
        return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
    }

    function removeClass(element, className) {
        if (element && hasClass(element,className)) {
            var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
            element.className=element.className.replace(reg,'');
        }
    }

    function addClass(element, className) {
        if (element && !hasClass(element,className)) {
            element.className += ' '+className;
        }
    }

    //http://stackoverflow.com/questions/22100853/dom-pure-javascript-solution-to-jquery-closest-implementation
    function closest(el, fn) {
        return el && (
            fn(el) ? el : closest(el.parentNode, fn)
        );
    }

    function getWindowWidth(){
        return  'innerWidth' in window ? window.innerWidth : document.documentElement.offsetWidth;
    }

    function getWindowHeight(){
        return  'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    }

    function clone(obj) {
        if (null === obj || 'object' !== typeof obj){
            return obj;
        }
        var copy = obj.constructor();

        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)){
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }

    function preventDefault(event){
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    }

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function addListenerMulti(el, s, fn) {
        var evts = s.split(' ');
        for (var i=0, iLen=evts.length; i<iLen; i++) {
            if (document.addEventListener) {
                el.addEventListener(evts[i], fn, false);
            }else{
                el.attachEvent(evts[i], fn, false); //IE 6/7/8
            }
        }
    }

    /**
    * Simulates the animated scrollTop of jQuery. Used when css3:false or scrollBar:true or autoScrolling:false
    * http://stackoverflow.com/a/16136789/1081396
    */
    function scrollTo(element, to, duration, callback) {
        var start = getScrolledPosition(element);
        var change = to - start;
        var currentTime = 0;
        var increment = 20;
        activeAnimation = true;

        var animateScroll = function(){
            if(activeAnimation){ //in order to stope it from other function whenever we want
                var val = to;

                currentTime += increment;
                val = Math.easeInOutCubic(currentTime, start, change, duration);

                setScrolling(element, val);

                if(currentTime < duration) {
                    setTimeout(animateScroll, increment);
                }else if(typeof callback !== 'undefined'){
                    callback();
                }
            }else if (currentTime < duration){
                callback();
            }
        };

        animateScroll();
    }

    //http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
    function getScrollTop(){
        var doc = document.documentElement;
        return (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    }

    //http://stackoverflow.com/questions/842336/is-there-a-way-to-select-sibling-nodes
    function getChildren(n, skipMe){
        var r = [];
        for ( ; n; n = n.nextSibling )
           if ( n.nodeType == 1 && n != skipMe)
              r.push( n );
        return r;
    };

    //Gets siblings
    function getAllSiblings(n) {
        return getChildren(n.parentNode.firstChild, n);
    }

    function next(element){
        var nextSibling = element.nextSibling;

        while(nextSibling && nextSibling.nodeType != 1) {
            nextSibling = nextSibling.nextSibling;
        }

        return nextSibling;
    }


    function prev(element){
        var prevSibling = element.previousSibling;

        while(prevSibling && prevSibling.nodeType != 1) {
            prevSibling = prevSibling.previousSibling;
        }

        return prevSibling;
    }

    /* --------------- END Javascript helpers  ---------------*/
}
