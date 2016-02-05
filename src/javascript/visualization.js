var d3                  = require('d3');
var data                = require('./data.csv');
var dataset             = require('./dataset.csv');

var slider              = document.getElementById("spb-slider");
var currentTime         = d3.select(".spb-timer-counter");

var timeInterval        = 0;
var timeFormat          = d3.time.format("%I:%M %p EST");

var intervalTimer;

var timeArray           = [];
var firstDataPoint      = dataset[0];

// Process time and datestamps
for (var x in firstDataPoint) {
  x = parseInt(x, 10);
  if (Number.isInteger(x)) {
    timeArray.push(new Date(x * 1000));
  }
}

// Set up
currentTime.html(timeFormat(timeArray[timeInterval]));

slider.setAttribute('max', timeArray.length);
slider.onchange = function() {

  // nodes.for
  nodes.forEach(function(d) {
    console.log(d.id);
    console.log(dataset[d.name]);

    d.radius = 40;
  });

  circles.transition().duration(1000).attr("r", function(d) {
    return d.radius;
  });

  currentTime.html(timeFormat(timeArray[this.value]));
};


function advanceTimer() {
  timeInterval++;
  slider.MaterialSlider.change(timeInterval);
  currentTime.html(timeFormat(timeArray[timeInterval]));
}

d3.select("#spb-start").on('click', function(e) {
  intervalTimer = window.setInterval(advanceTimer, 125);
});

var width = 940,
  height = 600,
  layout_gravity = -0.01,
  damper = 0.1,
  nodes = [],
  vis, force, circles, radius_scale;

var center = {x: width / 2, y: height / 2};

var year_centers = {
  "2008": {x: width / 3, y: height / 2},
  "2009": {x: width / 2, y: height / 2},
  "2010": {x: 2 * width / 3, y: height / 2}
};

var fillColor = d3.scale.ordinal()
  .domain(["singer", "panthers", "broncos"])
  .range(["#d84b2a", "#beccae", "#7aa25c"]);

// var max_amount = d3.max(data, function(d) { return parseInt(d.total_amount, 10); } );
radius_scale = d3.scale.pow().exponent(0.5).domain([0, 100]).range([2, 85]);

dataset.forEach(function(d) {
  var node = {
    id: d.id,
    type: d.type,
    radius: radius_scale(parseFloat(d["1454371200"])),
    name: d.name,
    x: Math.random() * 900,
    y: Math.random() * 900
  };
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

vis = d3.select(".spb-visualization").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "svg_vis");

circles = vis.selectAll("circle")
  .data(nodes, function(d) { return d.id ;});

circles.enter().append ("circle")
  .attr("r", 0)
  .attr("fill", function(d) {return fillColor(d.type) ;})
  .attr("stroke-width", 3)
  .attr("stroke", function(d) {return d3.rgb(fillColor(d.type)).darker();})
  .attr("id", function(d) { return  "bubble-" + d.id; })
  .on("mouseover", function(d, i) {show_details(d, i, this);} )
  .on("mouseout", function(d, i) {hide_details(d, i, this);} )
  .append("title")
  .text(function(d) {
    return d.name;
  });

circles.transition().duration(1000).attr("r", function(d) {
  return d.radius;
});

function setGameTime(time) {
  console.log('set game time here');
}

function charge(d) {
  return -Math.pow(d.radius, 2.0) / 8;
}

function start() {
  force = d3.layout.force()
  .nodes(nodes)
  .size([width, height]);
}

function display_group_all() {
  force.gravity(layout_gravity)
  .charge(charge)
  .friction(0.9)
  .on("tick", function(e) {
    circles.each(move_towards_center(e.alpha))
    .attr("cx", function(d) {return d.x;})
    .attr("cy", function(d) {return d.y;});
  });
  force.start();
  hide_years();
}

function move_towards_center(alpha) {
  return function(d) {
    d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
    d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
  };
}

function display_by_year() {
  force.gravity(layout_gravity)
  .charge(charge)
  .friction(0.9)
  .on("tick", function(e) {
    circles.each(move_towards_year(e.alpha))
    .attr("cx", function(d) {return d.x;})
    .attr("cy", function(d) {return d.y;});
  });
  force.start();
  display_years();
}

function move_towards_year(alpha) {
  return function(d) {
    var target = year_centers[d.year];
    d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
    d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
  };
}


function display_years() {
  var years_x = {"2008": 160, "2009": width / 2, "2010": width - 160};
  var years_data = d3.keys(years_x);
  var years = vis.selectAll(".years")
  .data(years_data);

  // years.enter().append("text")
  //              .attr("class", "years")
  //              .attr("x", function(d) { return years_x[d]; }  )
  //              .attr("y", 40)
  //              .attr("text-anchor", "middle")
  //              .text(function(d) { return d;});

}

function hide_years() {
  var years = vis.selectAll(".years").remove();
}


function show_details(data, i, element) {
  // d3.select(element).attr("stroke", "black");
  // var content = "<span class=\"name\">Title:</span><span class=\"value\"> " + data.name + "</span><br/>";
  // content +="<span class=\"name\">Amount:</span><span class=\"value\"> $" + addCommas(data.value) + "</span><br/>";
  // content +="<span class=\"name\">Year:</span><span class=\"value\"> " + data.year + "</span>";
  // tooltip.showTooltip(content, d3.event);
}

function hide_details(data, i, element) {
  // d3.select(element).attr("stroke", function(d) { return d3.rgb(fill_color(d.group)).darker();} );
  // tooltip.hideTooltip();
}

start();
display_group_all();