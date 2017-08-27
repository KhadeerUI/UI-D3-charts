/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    
    var margin = { top : 20, right : 20, bottom : 50, left : 200 };
    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var width = 800 - margin.right - margin.left;
    var height = 400 - margin.top - margin.bottom;

    var color = d3.scale.category20c();

    var tickFormat = "%H:%M";

    var keyFunction = function(d) {
		return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
		return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };

    /*var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
    
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true);

    var yAxis = d3.svg.axis().scale(y).orient("left");*/

    var initTimeDomain = function(tasks) {
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
		y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height], .1);
		xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true);

		yAxis = d3.svg.axis().scale(y).orient("left");

		yAxisFrid = d3.svg.axis()
			.scale(y)
			.orient('left')
			.tickSize(-width,0)
			.tickFormat('');
    };
    
    function gantt(tasks) {
	
	initTimeDomain(tasks);
	initAxis();
	
	var svg = d3.select(".ChartBox")
	.append("svg")
	.attr("class", "chart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

 	svg.append("g")
 		.attr("class", "x axis")
 		.attr("transform", "translate(0, " + height + ")")
 		.transition()
 		.call(xAxis)
	 
 	svg.append("g")
 		.attr("class", "y axis")
		.transition()
		.call(yAxis);

	svg.append('g')
		.attr('class','GridLines')
		.call(yAxisFrid);

	svg.append('g').attr('class','xLabel');
	svg.append('g').attr('class','yLabel');

	svg.select('.xLabel')
		.attr('transform','translate('+ width +','+ (height+margin.bottom-2) +')')
		.append('text')
		.text('Date')
		.style('text-anchor','end');

	svg.select('.yLabel')
		.attr('transform','translate('+ (-margin.left+20) +',0)')
		.append('text')
		.attr('transform','rotate(-90)')
		.text('Name of Jobs')
		.style('text-anchor','end');
	
  	svg.selectAll(".chart")
 		.data(tasks, keyFunction)
 		.enter().append("rect")
 		.attr("rx", 2)
 		.attr("ry", 2)
 		//.attr('fill', color)
 		.attr("fill", function(d){ 
	     	if(taskStatus[d.status] == null){ return "bar";}
	     	return taskStatus[d.status];
	     }) 
 		.attr("y", 0)
 		.attr("transform", rectTransform)
 		.attr("height", function(d) { return y.rangeBand(); })
 		.attr("width", 0)
 		.transition()
 		.duration(500)
 		.attr("width", function(d) { 
     		return (x(d.endDate) - x(d.startDate)); 
 		});

 	svg.selectAll('.chart rect')
		.on('mouseover', function (d) {
			console.log(d.status)
		})

	var statusLength = Object.keys(taskStatus).length;
	console.log(statusLength)

	console.log(taskStatus)

	/*============= Legends ==============*/
    var legends = d3.select('.ChartBox').append('div')
      .attr('class','Legends') // ====== if legends right side add class name 'Right'
      //.classed('Right',true)
      .style('width', width + 'px')
      .style('margin','0 auto')
      .append('ul');
    var legend = legends.selectAll('.Legend')
      .data(tasks)
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
      .attr('stroke', function(d){ return taskStatus[d.status] })
    legend.append('span')
      .text(function(d){ return d.status });
    /* ========== End Legends ========= */		
	 
 	return gantt;

    };
    
    /*gantt.redraw = function(tasks) {

	initTimeDomain(tasks);
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
    };*/

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
