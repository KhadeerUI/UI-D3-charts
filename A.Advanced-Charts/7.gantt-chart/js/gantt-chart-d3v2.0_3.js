/**
 * @author Dimitry Kudrayvtsev
 * @version 2.0
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    
    var margin = { top : 20, right : 20, bottom : 50, left : 80 };

    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var height = 400 - margin.top - margin.bottom;
    var width = 750 - margin.right - margin.left;

    var tickFormat = "%H:%M";

    var color = d3.scale.category20c();

    var keyFunction = function(d) {
	return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
	return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };

    var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height ],.1);
    
    var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient("bottom")
    	.tickFormat(d3.time.format(tickFormat))
    	//.tickSubdivide(true)
	    //.tickSize(8)
	    //.tickPadding(8);

    var yAxis = d3.svg.axis()
    	.scale(y)
    	.orient("left");
    
    var initTimeDomain = function() {
	if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
	    if (tasks === undefined || tasks.length < 1) {
		timeDomainStart = d3.time.day.offset(new Date(), -3);
		timeDomainEnd = d3.time.hour.offset(new Date(), +3);
		return;
	    }
	    tasks.sort(function(a, b) {
		return a.endDate - b.endDate;
	    });
	    timeDomainEnd = tasks[tasks.length - 1].endDate;
	    tasks.sort(function(a, b) {
		return a.startDate - b.startDate;
	    });
	    timeDomainStart = tasks[0].startDate;
	}
    };

    var initAxis = function() {
	x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
	y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height],.1);
	xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickFormat(d3.time.format(tickFormat))
		.tickSubdivide(true)
		.tickSize(8)
		.tickPadding(8);

	yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		//.tickSize(0);

	yAxisGrid = d3.svg.axis()
		.scale(y)
		.orient('left')
		.tickFormat('')
		.tickSize(-width,0);

    };
    
    function gantt(tasks) {
	
	initTimeDomain();
	initAxis();
	
	var svg = d3.select(".ChartBox").append("svg")
	.attr("class", "chart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("class", "gantt-chart")
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	svg.append("g")
	 	.attr("class", "x axis")
	 	.attr("transform", "translate(0, " + height + ")")
	 	.call(xAxis)
	 	.append('text')
	 	.text('Time')
	 	.attr('x', width)
	 	.attr('y', margin.bottom-2)
	 	.style('text-anchor','end');
	 
	 svg.append("g")
	 	.attr("class", "y axis")
	 	.call(yAxis)
	 	.append('text')
	 	.text('Task Names')
	 	.attr('transform','rotate(-90)')
	 	.style('text-anchor','end')
	 	.attr('y', -margin.left+20);

	 svg.append('g')
	 	.attr('class','y AxisGrid')
	 	.call(yAxisGrid);

	
  	svg.selectAll(".chart rect")
	 .data(tasks, keyFunction)
	 .enter().append("rect")
	 .attr('fill',function(d,i){ return color(i) })
	 .attr("rx", 3)
     .attr("ry", 3)
	 .attr("class", function(d){ 
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     }) 
	 .attr("y", 0)
	 .attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
	 .attr("width", function(d) { 
	     return (x(d.endDate) - x(d.startDate)); 
	     });

	svg.selectAll(".chart rect")
		.on('click',function(d){
			console.log(d.status);
		})

	 /*============= Legends ==============*/
    var legends = d3.select('.ChartBox').append('div')
      .attr('class','Legends') // ====== if legends right side add class name 'Right'
      //.classed('Right',true)
      .style('width', width + 'px')
      .style('margin','0 auto')
      .append('ul');
    var legend = legends.selectAll('.Legend')
      .data(status)
      .enter().append('li')
      .attr('class','Legend');
    legend.append('svg')
      .attr('width', 25)
      .attr('height', 10)
      .append('line')
      .attr('x1', 0)
      .attr('x2', 25)
      .attr('y1', 5)
      .attr('y2', 5)
      .attr('stroke', color)
    legend.append('span')
      .text(function(d){ return d.status });
    /* ========== End Legends ========= */
	 
	 return gantt;

    };
    
    gantt.redraw = function(tasks) {

	initTimeDomain();
	initAxis();
	
        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);
        
        rect.enter()
         .insert("rect",":first-child")
         .attr("rx", 5)
         .attr("ry", 5)
	 .attr("class", function(d){ 
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     }) 
	 .transition()
	 .attr("y", 0)
	 .attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
	 .attr("width", function(d) { 
	     return (x(d.endDate) - x(d.startDate)); 
	     });

        rect.transition()
          .attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
	 .attr("width", function(d) { 
	     return (x(d.endDate) - x(d.startDate)); 
	     });
        
	rect.exit().remove();

	svg.select(".x").transition().call(xAxis);
	svg.select(".y").transition().call(yAxis);
	
	return gantt;
    };

    gantt.margin = function(value) {
	if (!arguments.length)
	    return margin;
	margin = value;
	return gantt;
    };

    gantt.timeDomain = function(value) {
	if (!arguments.length)
	    return [ timeDomainStart, timeDomainEnd ];
	timeDomainStart = +value[0], timeDomainEnd = +value[1];
	return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
	if (!arguments.length)
	    return timeDomainMode;
        timeDomainMode = value;
        return gantt;
        console.log(gantt)
    };

    gantt.taskTypes = function(value) {
	if (!arguments.length)
	    return taskTypes;
	taskTypes = value;
	return gantt;
    };
    
    gantt.taskStatus = function(value) {
	if (!arguments.length)
	    return taskStatus;
	taskStatus = value;
	return gantt;
    };

    gantt.width = function(value) {
	if (!arguments.length)
	    return width;
	width = +value;
	return gantt;
    };

    gantt.height = function(value) {
	if (!arguments.length)
	    return height;
	height = +value;
	return gantt;
    };

    gantt.tickFormat = function(value) {
	if (!arguments.length)
	    return tickFormat;
	tickFormat = value;
	return gantt;
    };


    
    return gantt;

};
