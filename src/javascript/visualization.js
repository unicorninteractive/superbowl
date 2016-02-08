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

// Process time and datestamps
for (var x in firstDataPoint) {
  x = parseInt(x, 10);
  if (Number.isInteger(x)) {
    timeArray.push(new Date(x * 1000));
  }
}

currentTime.html(timeFormat(timeArray[timeInterval]));

slider.setAttribute('max', timeArray.length);

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

clientwidth = d3.select(".spb-visualization").node().getBoundingClientRect().width;
clientheight = d3.select(".spb-visualization").node().getBoundingClientRect().height;

var width = clientwidth,
  height = clientheight,
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
    x: Math.random() * clientwidth,
    y: Math.random() * clientheight
  };

  if (parseFloat(d["1454371200"]) > 0)
    nodes.push(node);
});

// dataset.forEach(function(d){
//   var node = {
//     id: d.id,
//     radius: radius_scale(parseInt(d.total_amount, 10)),
//     value: d.total_amount,
//     name: d.grant_title,
//     org: d.organization,
//     group: d.group,
//     year: d.start_year,
//     x: Math.random() * 900,
//     y: Math.random() * 800
//   };
//   nodes.push(node);
// });

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

function showDetails(data, i, element) {
  d3.select(element).attr("stroke", "#333");
  d3.select(element).attr("stroke-width", "2px");
  // var content = "<span class=\"name\">Title:</span><span class=\"value\"> " + data.name + "</span><br/>";
  // content +="<span class=\"name\">Amount:</span><span class=\"value\"> $" + addCommas(data.value) + "</span><br/>";
  // content +="<span class=\"name\">Year:</span><span class=\"value\"> " + data.year + "</span>";
  // tooltip.showTooltip(content, d3.event);
}

function hideDetails(data, i, element) {
  d3.select(element).attr("stroke", function(d) { console.log(d);return fillColor(d.type);});
  // tooltip.hideTooltip();
}

function tick(alpha) {
  context.clearRect(0, 0, width, height);
  nodes.forEach(function(d) {
    context.beginPath();
    context.fillStyle = fillColor(d.type);
    d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
    d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
    context.moveTo(d.x, d.y);
    context.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
    context.closePath();
    // context.clip();
    context.fill();
    context.drawImage(image, d.x - d.radius, d.y - d.radius, d.radius * 2, d.radius * 2);
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
    // circles.each(move_towards_center(e.alpha))
    // .attr("cx", function(d) {return d.x;})
    // .attr("cy", function(d) {return d.y;});
  })
  .start();

// Share buttons
d3.select('.spb-twitter-share').on('click', function() {
  var shareText = "Replay the %23SuperBowl with this interactive from @GoogleTrends";
  var url = "http://googletrends.github.io/2016-superbowl/";
  var w = 550;
  var h = 300;
  var top = (screen.height / 2) - (h / 2);
  var left = (screen.width / 2) - (w / 2);
  var href = "http://twitter.com/share?text=" + shareText + "&url=" + encodeURI(url);
  window.open(href, "tweet", "height=" + h + ",width=" + w + ",top=" + top + ",left=" + left + ",resizable=1");
});

d3.select('.spb-facebook-share').on('click', function() {
  var url = "http://googletrends.github.io/2016-state-of-the-union/";
  var w = 600;
  var h = 400;
  var top = (screen.height / 2) - (h / 2);
  var left = (screen.width / 2) - (w / 2);
  var href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(url);
  window.open(href, "tweet", "height=" + h + ",width=" + w + ",top=" + top + ",left=" + left + ",resizable=1");
});

var redrawGraph = debounce(function() {
  clientwidth = d3.select(".spb-visualization").node().getBoundingClientRect().width;
  clientheight = d3.select(".spb-visualization").node().getBoundingClientRect().height;
  context.clearRect(0, 0, clientwidth, clientheight);
  force.start();
}, 500);

window.addEventListener('resize', redrawGraph);