var d3                  = require('d3');
var dataset             = require('./dataset.csv');

var scores              = require('./scores.json').scores;
var events              = require('./events.json').events;

var slider              = document.getElementById("spb-slider");
var currentTime         = d3.select(".spb-timer-counter-left");

var timeInterval        = 0;
var timeFormat          = d3.time.format("%I:%M");

var intervalTimer;
var dataArray           = {};

var timeArray           = [];
var firstDataPoint      = dataset[0];

var isPlaying           = false;

var context;
var image               = new Image();

var PI_TIMES_TWO      = 6.283185307179586;

for (var x in firstDataPoint) {
  x = parseInt(x, 10);
  if (Number.isInteger(x)) {
    timeArray.push(new Date(x * 1000));
  }
}

currentTime.html(timeFormat(timeArray[timeInterval]));

slider.setAttribute('max', timeArray.length - 1);

slider.onclick = function() {
  isPlaying = false;
  window.clearInterval(intervalTimer);
};

slider.onchange = function() {
  isPlaying = false;
  window.clearInterval(intervalTimer);
  timeInterval = parseInt(this.value, 10);
  setGameTime();
};

function advanceTimer() {
  timeInterval++;
  slider.MaterialSlider.change(timeInterval);
  setGameTime();
}

image.src = "/images/spritesheet.jpg";

d3.select("#spb-start").on('click', function(e) {
  isPlaying = true;
  window.clearInterval(intervalTimer);
  intervalTimer = window.setInterval(advanceTimer, 200);
});

var width = d3.select(".spb-visualization").node().getBoundingClientRect().width,
  height = width * 0.9,
  layout_gravity = -0.01,
  damper = 0.1,
  nodes = [],
  vis, force, circles, radiusScale;

var center = {x: width / 2, y: height / 2};

var fillColor = d3.scale.ordinal()
  .domain(["singer", "panthers", "broncos"])
  .range(["#ff4081", "#1d91ca", "#f26a24"]);

radiusScale = d3.scale.pow().exponent(0.3).domain([0, 100]).range([10, width/6]);

dataset.forEach(function(d) {
  var tempArray = [];

  for (var i in d) {
    var value = parseFloat(d[i]);
    if (!isNaN(value)) {
      tempArray.push(d[i]);
    }
  }

  dataArray[d.id] = tempArray;

  var node = {
    id: d.id,
    type: d.type,
    radius: radiusScale(parseFloat(d["1454371200"])),
    name: d.name,
    x: Math.random() * width,
    y: Math.random() * height,
    imageX: d.imagex,
    imageY: d.imagey
  };

  if (parseFloat(d["1454371200"]) > 0) {
    nodes.push(node);
  }
});

nodes.sort(function(a, b) {return b.value- a.value; });

vis = d3.select(".spb-visualization").append("canvas")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "svg_vis");

context = vis.node().getContext("2d");

// Debounce function for intensive drawing operations
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function setGameTime() {
  nodes.forEach(function(d) {
    d.radius = radiusScale(dataArray[d.id][timeInterval]);
  });

  d3.select('.spb-panthers .spb-team-score').html(scores[timeInterval].panthers);
  d3.select('.spb-broncos .spb-team-score').html(scores[timeInterval].broncos);

  currentTime.html(timeFormat(timeArray[timeInterval]));
  force.start();
}

function charge(d) {
  return -Math.pow(d.radius, 2.0) / 6;
}

function tick(alpha) {
  context.clearRect(0, 0, width, height);

  nodes.forEach(function(d) {
    context.save();
    context.beginPath();
    d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
    d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    context.moveTo(d.x, d.y);
    context.arc(d.x, d.y, d.radius, 0, PI_TIMES_TWO);
    context.closePath();
    context.lineWidth = 8;
    context.strokeStyle = fillColor(d.type);
    context.stroke();
    context.clip();
    context.drawImage(image, d.imageX, d.imageY, 150, 150, d.x - d.radius, d.y - d.radius, d.radius * 2, d.radius * 2);
    context.restore();
  });
}

force = d3.layout.force()
  .nodes(nodes)
  .size([width, height])
  .gravity(layout_gravity)
  .charge(charge)
  .friction(0.9)
  .on("tick", function(e) {
    tick(e.alpha);
  })
  .start();

d3.select("body").on("keyup", function() {
  if (d3.event.keyCode == 27) {
    isPlaying = false;
    window.clearInterval(intervalTimer);
    setGameTime();
  }
});

// Share buttons
d3.select('.spb-twitter-share').on('click', function() {
  var shareText = "Replay the %23SuperBowl with this interactive from @GoogleTrends";
  var url = "http://googletrends.github.io/2016-superbowl/";
  var w = 550;
  var h = 300;
  var top = (screen.height / 2) - (h / 2);
  var left = (screen.width / 2) - (w / 2);
  var href = "http://twitter.com/share?text=" + shareText + "&url=" + encodeURI(url);
  window.open(href, "twitter", "height=" + h + ",width=" + w + ",top=" + top + ",left=" + left + ",resizable=1");
});

d3.select('.spb-google-share').on('click', function() {
    var shareText = "Replay the %23SuperBowl with this interactive from @GoogleTrends";
    var url = "http://googletrends.github.io/2016-superbowl/";
    var w = 600;
    var h = 600;
    var top = (screen.height / 2) - (h / 2);
    var left = (screen.width / 2) - (w / 2);
    var href = "https://plus.google.com/share?url=" + encodeURI(url);
    window.open(href, "google-plus", "height=" + h + ",width=" + w + ",top=" + top + ",left=" + left + ",resizable=1");
});

d3.select('.spb-facebook-share').on('click', function() {
  var url = "http://googletrends.github.io/2016-state-of-the-union/";
  var w = 600;
  var h = 400;
  var top = (screen.height / 2) - (h / 2);
  var left = (screen.width / 2) - (w / 2);
  var href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(url);
  window.open(href, "facebook", "height=" + h + ",width=" + w + ",top=" + top + ",left=" + left + ",resizable=1");
});

var redrawGraph = debounce(function() {
  context.clearRect(0, 0, width, height);
  width = d3.select(".spb-visualization").node().getBoundingClientRect().width;
  height = width * 0.9;

  vis.attr('width', width).attr('height', height).style('width', width + 'px').style('height', height + 'px');

  radiusScale = d3.scale.pow().exponent(0.3).domain([0, 100]).range([10, width/6]);
  center = {x: width / 2, y: height / 2};

  nodes.forEach(function(d) {
    d.radius = radiusScale(dataArray[d.id][timeInterval]);
  });

  force.size([width, height]).resume();
  force.start();
}, 125);

window.addEventListener('resize', redrawGraph);