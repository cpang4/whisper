var margin = {top: 10, right: 30, bottom: 20, left: 10},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#viz")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," +  margin.top + ")")
      .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

    var links = svg.append("g");

      d3.queue()
      .defer(d3.csv, 'tweetInfo.csv')
      .defer(d3.csv, 'tweets-withcategory-noblank.csv')
      .await(makeViz);

      function makeViz(error, info, tweets){
        //date in file is in format: Sat Oct 06 18:23:46 +0000 2018
        var parseDate = d3.timeParse("%a %b %e %H:%M:%S +0000 %Y");
        var formatDate = d3.timeFormat("%a %b %e %H:%M:%S %Y");
        var tickFormat = d3.timeFormat("%a %b %e %H:%M:%S");
        var tickShort = d3.timeFormat("%H:%M:%S");

        info.forEach(function(d) {
          d.time = parseDate(d.time);
          d.count = +d.count;
        });

        tweets.forEach(function(d) {
          d.time = parseDate(d.time);
        });


        var makeTimeScale = function(){
          
          var legendData = [];

            var i=0;
            var radius = 65;
            var newScale = d3.scaleTime()
            .domain([d3.min(tweets, function(d){return d.time;}), d3.timeDay.floor(d3.max(tweets, function(d){return d.time;}))]);

            var ticks = newScale.ticks(9);
            while (radius <= 265){ 
                if (i == ticks.length){
                  legendData.push({"size": radius, "value":""});
                }
                else if (i == 0){
                  legendData.push({"size": radius, "value":tickFormat(ticks[i])});
                  i++;
                }
                else if (ticks[i].getDay() != ticks[i-1].getDay()){
                  legendData.push({"size": radius, "value":tickFormat(ticks[i])});
                  i++;
                }else{
                  legendData.push({"size": radius, "value":tickShort(ticks[i])});
                  i++;
                }
                radius = radius + 25;
            }
        
        var legend = svg.append("g")
            .attr("class", "legend")
            .selectAll("g")
            .data(legendData)
            .enter()
            .append("g");

          legend.append("circle")
            .attr("r", function(d){return +d.size})
            .attr("fill", "none")
            .style("stroke", "gray")
            .style("stroke-dasharray", function(d){
              if (+d.size == 265){
                return null;
              }
              else {
                return ("7,3");
              }
            })
            .style("stroke-opacity", 0.3);

          legend.append("text")
            .attr("y", function(d){
                return -(+d.size);})
            .attr("dy", "0.3em")
            .style("font", "10px Arial")
            .style("fill", "gray")
            .attr("text-anchor", "middle")
            .text(function(d) {return d.value});
        } // end maketimescale

        makeTimeScale();

        var countries = ["Africa", "Argentina", "Australia", "Belgium", "Brazil", "Canada", "Colombia", "France", "Germany", "Greece", "Hong Kong", "India", "Indonesia", "Ireland", "Italy", "Japan", "Malaysia", "Mexico", "Netherlands", "New Zealand", "Pakistan", "Scotland", "Spain", "UAE", "UK", "USA", "Other/Asia", "Other/Central America", "Other/Europe", "Other/E. Europe", "Other/Middle East", "Other/S. America", "Other/Oceania"];

      var createLabels = function (numNodes, radius, dataset) {
         var nodes = [],
             angle,
             x,
             y,
             i;
         for (i=0; i<numNodes; i++) {
          angle = (i / (numNodes/2)) * (Math.PI)+5; // Calculate the angle at which the element will be placed. 0.05 adjusts the position of the labels near the middle
          x = (radius * Math.cos(angle));
          y = (radius * Math.sin(angle));
          nodes.push({'label': dataset[i], 'x': x, 'y': y});
         }
         return nodes;
      }

      var createLabelsMap = function (numNodes, radius, dataset) {
         var nodes = [],
             angle,
             x,
             y,
             i;
         for (i=0; i<numNodes; i++) {
          angle = (i / (numNodes/2)) * (Math.PI)+5; // Calculate the angle at which the element will be placed. 0.05 adjusts the position of the labels near the middle
          x = (radius * Math.cos(angle));
          y = (radius * Math.sin(angle));
          nodes[dataset[i]] = {'x': x, 'y': y, 'index':i};
         }
         return nodes;
      }

      label_info = createLabels(countries.length, 275, countries);
      labelsMap = createLabelsMap(countries.length, 265, countries);

      svg.selectAll("labels")
          .data(label_info)
          .enter()
          .append("text")
          .attr("x", function(d){return d.x;})
          .attr("y", function(d){return d.y;})
          .attr("text-anchor", function(d){
            if (d.x < 0) return "end";
            else return "start";
          })
          .attr("font-family", "Arial")
          .attr("font-size", "8px")
          .text(function(d){
            return d.label;
          })

      var createNodesMap = function (numNodes, radius) {
         var nodes = [],
             angle,
             x,
             y,
             i, name;
         for (i=0; i<numNodes; i++) {
          angle = (i / (numNodes/2)) * Math.PI; // Calculate the angle at which the element will be placed.
          x = (radius * Math.cos(angle));
          y = (radius * Math.sin(angle));
          name = info[i].name;
          nodes[name] = {'index': i, 'data': info[i], 'x': x, 'y': y};
         }
         return nodes;
      }

      var createNodes = function (numNodes, radius) {
         var nodes = [],
             angle,
             x,
             y,
             i, name;
         for (i=0; i<numNodes; i++) {
          angle = (i / (numNodes/2)) * Math.PI; // Calculate the angle at which the element will be placed.
          x = (radius * Math.cos(angle));
          y = (radius * Math.sin(angle));
          nodes.push({'index': i, 'data': info[i], 'x': x, 'y': y});
         }
         return nodes;
      }


      // where data.length = number of tweets, 40 = radius of inside circle
      // should not be edited
      nodes = createNodes(info.length, 40);
      nodesMap = createNodesMap(info.length, 40);
      var shown = {};
        Object.keys(nodesMap).forEach(function(key) {
          shown[key] = false;
        });

      var getRTPositions = function (dataset, numNodes) {
        var result = [];
        var ind = 0, radius, location;
        for (ind=0; ind < dataset.length; ind++) {
          location = dataset[ind].category;
          radius = radialScale(dataset[ind].time);
          var i = labelsMap[location].index;
          angle = (i / (numNodes/2)) * Math.PI+5;
          x = (radius * Math.cos(angle));
          y = (radius * Math.sin(angle));
          result.push({'category': location, 'x': x, 'y': y, 'time': dataset[ind].time});
        }
        return result;
      }

      var retweetLines = function(dataset, news){
        var result = {}, loc;
        for (i=0; i < dataset.length; i++) {
          loc = dataset[i].category;
          if (loc in result){
            result[loc].push({'x': dataset[i].x, 'y': dataset[i].y});
          }
          else{
            result[loc] = [];
            // add connection to tweet
            result[loc].push({'x': nodesMap[news].x, 'y': nodesMap[news].y});
            // then add RT location
            result[loc].push({'x': dataset[i].x, 'y':dataset[i].y});
          }
        }
        //at end, end connection to category edge
        Object.keys(result).forEach(function(key) {
          result[key].push({'x': labelsMap[key].x, 'y':labelsMap[key].y});
        });
        return result;
      }

      

      //Define line generator
      line = d3.line()
        .x(function(d) { return (d.x); })
        .y(function(d) { return (d.y); });

      // for RT's
        var radialScale = d3.scaleLinear()
        .domain([d3.min(tweets, function(d){return d.time;}), d3.timeDay.floor(d3.max(tweets, function(d){return d.time;}))])
        .range([65, 240]);

      var plotRetweets = function(news){
        // sort the data so the line connects properly
        var filteredData = tweets.filter(function(d){return d.news == news});
        filteredData.sort(function(a, b) {
          return d3.ascending(a.time, b.time);
        });

        retweetData = getRTPositions(filteredData, countries.length);

        d3.selectAll("#retweetPoints-line" + news).remove();
        d3.selectAll("#retweetPoints-points" + news).remove();

        retweetMap = retweetLines(retweetData, news);
        Object.keys(retweetMap).forEach(function(key) {
          links.append("path")
          .datum(retweetMap[key])
          .attr("id", "retweetPoints-line" + news)
          .attr("class", "line")
          .attr("d", line);
        });

        svg.selectAll("retweets")
        .data(retweetData)
        .enter()
        .append("circle")
        .attr("id", "retweetPoints-points" + news)
        .attr("cx", function(d){
          return d.x;
        })
        .attr("cy", function(d){
          return d.y;
        })
        .attr("r", 2)
        .attr("fill", "steelblue")
        .on("mouseover", function(d){
          var xPosition = parseFloat(d3.select(this).attr("cx"));
          var yPosition = parseFloat(d3.select(this).attr("cy")) - 10;

          // apply white background so text is visible
          svg.append('text')
            .attr("id", "rttooltip" + news)
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("font-family", "Arial")
            .attr("text-anchor", "middle")
            .attr("font-size", '8px')
            .style("stroke", "white")
            .style("stroke-width", "3.5px")
            .style("opacity", 0.8)
            .text(tickFormat(d.time));

          // apply actual black text
          svg.append('text')
            .attr("id", "rttooltip" + news)
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("font-family", "Arial")
            .attr("text-anchor", "middle")
            .attr("font-size", '8px')
            .text(tickFormat(d.time));
        })
        .on("mouseout", function(d){
          d3.selectAll("#rttooltip" + news).remove();
        });

      }

      var nodes = svg.append("g")
        .selectAll("tweet-circles")
          .data(nodes)
          .enter()
          .append("circle")
          .attr("cx", function(d){return d.x;})
          .attr("cy", function(d){return d.y;})
          .attr("r", 5)
          .on("click", function(d){
            if (shown[d.data.name]){
              // already shown, remove
              d3.selectAll("#retweetPoints-line" + d.data.name).remove();
              d3.selectAll("#retweetPoints-points" + d.data.name).remove();
              shown[d.data.name] = false;
              d3.select(this).attr("fill", "black");
              makeTotalCircles();
            }
            else{
              shown[d.data.name] = true;
              d3.select(this).attr("fill", "steelblue");
              plotRetweets(d.data.name);
              makeTotalCircles();

            }
          })
          .on("mouseover", function(d){

            d3.select(this).attr("fill", "red");

            if (shown[d.data.name]){
              d3.selectAll("#retweetPoints-line" + d.data.name).attr("class", "line-hover");
              d3.selectAll("#retweetPoints-points" + d.data.name).attr("fill", "red");
            }

            if (+d.index > 5 && +d.index < 14){
              var xPosition = parseFloat(d3.select(this).attr("cx")) - 205;
              var yPosition = parseFloat(d3.select(this).attr("cy")) + 5;
            }
            else if (+d.index >= 14 && +d.index <= 16){
              var xPosition = parseFloat(d3.select(this).attr("cx")) - 230;
              var yPosition = parseFloat(d3.select(this).attr("cy")) + 5;
            }else {
              var xPosition = parseFloat(d3.select(this).attr("cx")) + 10;
              var yPosition = parseFloat(d3.select(this).attr("cy")) + 10;
            }

            var tooltipStuff = svg.append("g");

            var length = Math.ceil(d.data.text.length/30);

            tooltipStuff.append("rect")
              .attr("class", "tooltip")
              .attr("x", xPosition)
              .attr("y", yPosition)
              .attr("height", 25+(length*12))
              .attr("width", 200)
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("fill", "white")
              .style("fill-opacity", 0.9);

            tooltipStuff.append("svg:image")
              .attr("class", "tooltip")
              .attr("x", xPosition+5)
              .attr("y", yPosition+5)
              .attr("width", 40)
              .attr("height", 40)
              .attr("xlink:href", d.data.url);

            var htmlInput = "<b>" + d.data.name + "</b><br>" + formatDate(d.data.time) + "<br>" + d.data.text;

            tooltipStuff.append("foreignObject")
              .attr("class", "tooltip")
              .attr("width", 150)
              .attr("height", 25+(length*12))
              .attr("x", xPosition+50)
              .attr("y", yPosition+3)
              .style("font", "10px 'Arial'")
              .style("color", "black")
              .html(htmlInput); 


          })
          .on("mouseout", function(d){
            d3.selectAll(".tooltip").remove();
            if (shown[d.data.name]){
              d3.select(this).attr("fill", "steelblue");
            }
            else{
              d3.select(this).attr("fill", "black");
            }
            d3.selectAll("#retweetPoints-line" + d.data.name).attr("class", "line");
            d3.selectAll("#retweetPoints-points" + d.data.name).attr("fill", "steelblue");
          });


        var countryMap = {};

        var circleInfo = svg.append("g");
          circleInfo.selectAll("totalCircles")
          .data(countries)
          .enter()
          .append("circle")
          .attr("class", "totalCircles")
          .attr("cx", function(d){return labelsMap[d].x;})
          .attr("cy", function(d){return labelsMap[d].y;})
          .attr("r", 0);

      circleInfo.selectAll("totalCircles-text")
        .data(countries)
        .enter()
        .append("text")
        .attr("class", "totalCircles-text")
        .attr("text-anchor", "middle")
          .attr("font-family", "Arial")
          .attr("font-size", '8px');

      var makeTotalCircles = function(){

        for (var i in countries){
          countryMap[countries[i]] = 0;
        }
        Object.keys(shown).forEach(function(key) {
          if (shown[key]){
            var filteredData = tweets.filter(function(d){return d.news == key});
            for (var k in filteredData){
              countryMap[filteredData[k].category] = countryMap[filteredData[k].category] + 1;
            }
          }
        });

        d3.selectAll(".totalCircles")
          .data(countries)
          .transition()
          .attr("cx", function(d){return labelsMap[d].x;})
          .attr("cy", function(d){return labelsMap[d].y;})
          .attr("r", function(d){
            if (countryMap[d] == 0){
            return 0;
          }else{
            return 9;
          }})
          .attr("fill-opacity", 0.1);

        d3.selectAll(".totalCircles-text")
          .data(countries)
          .transition()
          .attr("x", function(d){return labelsMap[d].x;})
          .attr("y", function(d){return labelsMap[d].y;})
          .text(function(d){
            if (countryMap[d] == 0){
              return "";
            }else{
              return countryMap[d];
            }
          });
      }



      }; // end make viz