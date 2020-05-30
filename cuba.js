// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Projection and path - obtained from https://www.d3-graph-gallery.com/graph/backgroundmap_basic.html

//Projections transform spherical geometry into planar geometry
var projection = d3.geoMercator()      //Spehrical world is projected by squares or tiles. 
                .translate([3900, 1200])    //positions the map 
                .scale(2500)    //enlarges the map

// Color legend- obtained from https://bl.ocks.org/mbostock/5562380

//Assign a shade of color to states represented by population density. 
var color = d3.scaleThreshold()   //maps numeric input to discrete values defined by the range
  .domain([10, 50, 100, 150, 1000, 3000])  //population density values
  .range(d3.schemeBlues[7]);               //shades of blue. 
  //.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
    
var legend = d3.scaleSqrt() //sizing squares proportianally to the data
                    .domain([0,3500]) //range inteval of the domain  
                    .rangeRound([0,500]); //size of the legend on the map

//append an elemnt for lengend and position it
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(180,400)"); 


g.selectAll("rect")                               
    .data(color.range().map(function(d){           //data taken from color range values 
        d = color.invertExtent(d);                 //inverse mapping from range to domain
        if (d[0] == null) d[0] = legend.domain()[0];  //if the values are null, then fill in the domian values. 
        if (d[1] == null) d[1] = legend.domain()[1];
        return d; 
     })).enter()
        .append("rect")                             
        .attr("height", 8)
        .attr("x", function(d) {return legend(d[0]);})  // the domian values are represented as x values. 
        .attr("width", function(d) {return legend(d[1]) - legend(d[0]);}) // width of each rectangle.
        .attr("fill", function(d) {return color(d[0]); });                // fill in the color 

g.append("text")                        //append the legend text 
    .attr("class", "caption")
    .attr("x", legend.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square mile");
    
g.call(d3.axisBottom(legend)             //adding the axis onto the map
    .tickSize(13)
    .tickValues(color.domain()))
  .select(".domain")
    .remove();


// Parsing the data files - obtained from ch.14 of the Book 

d3.csv("cubapopden.csv").then(function(data) {

    d3.json("cubageo.json").then(function(json){
        for (var i = 0; i < data.length; i++){       //assigning the state from .csv 
           var dataState = data[i].State;
           
            var dataValue = +data[i].PopDensity;     //assinging the density values from .csv
           
            for (var j = 0; j < json.features.length; j++) {    
               
                var jsonState = json.features[j].properties.NAME_1;   //assinging the state from .json
               
                if (dataState == jsonState){         //if the states from both files match
                   json.features[j].properties.value = dataValue;      // assign the density value from .csv to the .json file
                   break;                                  
               }
           }
       }
        console.log(data);
        console.log(data[10].PopDensity);
        console.log(json.features);
        console.log(json.features[3].properties.NAME_1);
        console.log(json.features[1].properties.value); 

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))  //generates an SVG path given a GeoJson geometry. 
        .attr("fill", function(d){return color(d.properties.value)})  //fill the colors to states. 
        .style("stroke", "#fff");
    
})
})