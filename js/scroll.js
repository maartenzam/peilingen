//Functions for enabling and disabling scrolling
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null; 
    window.onwheel = null; 
    window.ontouchmove = null;  
    document.onkeydown = null;  
}

//SCROLLING! See https://github.com/vlandham/scroll_demo/blob/gh-pages/js/scroller.js
function scroller() {
  var windowHeight = window.innerHeight;
  var container = d3.select('#left');
  // event dispatcher
  var dispatch = d3.dispatch("active", "progress");

  // d3 selection of all the text sections that will be scrolled through
  var sections = null;

  // array that will hold the y coordinate of each section that is scrolled through
  var sectionPositions = [];
  var currentIndex = -1;
  // y coordinate of
  var containerStart = 0;

  /*
    scroll - constructor function. Sets up scroller to monitor scrolling of els selection.
   	@param els - d3 selection of elements that will be scrolled through by user.
   */
  function scroll(els) {
    sections = els;

    // when window is scrolled, call position. When it is resized, call resize.
    d3.select(window)
      .on("scroll.scroller", position)
      .on("resize.scroller", resize);

    // manually call resize initially to setup scroller.
    resize();

    // hack to get position to be called once for the scroll position on load.
    d3.timer(function() {
      position();
      return true;
    });
  }

  /**
   * resize - called initially and also when page is resized.
   * Resets the sectionPositions
   */
  function resize() {
    // sectionPositions will be each sections starting position relative to the top of the first section.
    sectionPositions = [];
    var startPos;
    sections.each(function(d,i) {
      var top = this.getBoundingClientRect().top;
      if(i === 0) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
    containerStart = container.node().getBoundingClientRect().top + window.pageYOffset;
  }

  //position - get current users position. If user has scrolled to new section, dispatch active event with new section index.

  function position() {
    var pos = window.pageYOffset - 800 - containerStart;
    var sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size() - 1, sectionIndex);

    if (currentIndex !== sectionIndex) {
      //stop the scrolling
      if (sectionIndex > currentIndex && sectionIndex > 0) {
        disableScroll();
      }
      dispatch.active(sectionIndex);
      currentIndex = sectionIndex;
    }

    var prevIndex = Math.max(sectionIndex - 1, 0);
    var prevTop = sectionPositions[prevIndex];
    var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
    dispatch.progress(currentIndex, progress);
  }

  /**
   * container - get/set the parent element of the sections. Useful for if the scrolling doesn't start at the very top of the page.
   * @param value - the new container value
   */
  scroll.container = function(value) {
    if (arguments.length === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  // allows us to bind to scroller events which will interally be handled by the dispatcher.
  d3.rebind(scroll, dispatch, "on");

  return scroll;
}

//array of functions to animate graph on each step
var activateFunctions = [];
/*activateFunctions[0] = showcolor;
activateFunctions[1] = sort;
activateFunctions[2] = lineup;
activateFunctions[3] = moveup;
activateFunctions[4] = choice;
activateFunctions[5] = choice;
activateFunctions[6] = showdiff;*/

var scroll = scroller().container(d3.select('#text-content'));
scroll(d3.selectAll('.step'));

  //enable scrolling function
  function enablescroll() {
    d3.select("body").classed("stop-scrolling", false);
    console.log("run");
  }

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });
	//animation function for this step
	  /*activateFunctions[index]();*/
  });