var d3                  = require('d3');

var data                = require('./data.csv');
var dataset             = require('./dataset.csv');
var scores              = require('./scores.json').scores;

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

const PI_TIMES_TWO      = 6.283185307179586;

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

image.src = "/images/portrait.png";

d3.select("#spb-start").on('click', function(e) {
  isPlaying = true;
  intervalTimer = window.setInterval(advanceTimer, 200);
});

var width = d3.select(".spb-visualization").node().getBoundingClientRect().width,
  height = d3.select(".spb-visualization").node().getBoundingClientRect().height,
  layout_gravity = -0.01,
  damper = 0.1,
  nodes = [],
  vis, force, circles, radiusScale;

var center = {x: width / 2, y: height / 2};

var fillColor = d3.scale.ordinal()
  .domain(["singer", "panthers", "broncos"])
  .range(["#ff4081", "#1d91ca", "#f26a24"]);

// var max_amount = d3.max(data, function(d) { return parseInt(d.total_amount, 10); } );
radiusScale = d3.scale.pow().exponent(0.19).domain([0, 100]).range([10, 85]);

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
    y: Math.random() * height
  };

  if (parseFloat(d["1454371200"]) > 0)
    nodes.push(node);
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
    context.lineWidth = 6;
    context.strokeStyle = fillColor(d.type);
    context.stroke();
    context.clip();
    context.drawImage(image, d.x - d.radius, d.y - d.radius, d.radius * 2, d.radius * 2);
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
  width = d3.select(".spb-visualization").node().getBoundingClientRect().width;
  height = d3.select(".spb-visualization").node().getBoundingClientRect().height;
  force.size([width, height]).resume();
  console.log(width);
  console.log(force.size);
  // force.start();
}, 500);

window.addEventListener('resize', redrawGraph);