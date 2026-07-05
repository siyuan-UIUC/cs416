//set prerequiresites
let currentScene = 1;
const maxScene = 3;
let inspectionData = []; // to store the data from CFI api

//loading and initatalizing
async function init() {
    try {
        // request the data...set limit to 5000 records, otherwise the SVG could crash the memory due to massive data to render....
        const url = "https://data.cityofchicago.org/resource/4ijn-s7e5.json?$limit=5000&$order=inspection_date DESC";
        inspectionData = await d3.json(url);
        
        console.log("Data loaded successfully:", inspectionData);

        // click to active
        updateControls();
        drawScene(currentScene);

      //the button to interact
        d3.select("#nextBtn").on("click", () => {
            if (currentScene < maxScene) {
                currentScene++;
                updateControls();
                drawScene(currentScene);
            }
        });

        d3.select("#prevBtn").on("click", () => {
            if (currentScene > 1) {
                currentScene--;
                updateControls();
                drawScene(currentScene);
            }
        });

    } catch (error) {
        console.error("Error loading data: ", error);
        d3.select("#scene-description").text("Failed to load data. Please check console.");
    }
}

// the update button
function updateControls() {
    d3.select("#prevBtn").property("disabled", currentScene === 1);
    d3.select("#nextBtn").property("disabled", currentScene === maxScene);
    d3.select("#page-indicator").text(`Scene ${currentScene} / ${maxScene}`);
}


// Scenes visalization core

function drawScene(sceneIndex) {
    const svg = d3.select("svg");
    svg.selectAll("*").remove(); 
    // switch to hidden tooltip
    d3.select("#tooltip").classed("hidden", true);


    // **************************************************
    // SCENE 1 OVERALL
    // **************************************************
    if (sceneIndex === 1) {
        d3.select("#scene-description").text("Scene 1: Overall Pass vs Fail Rate of Chicago Food Establishments. Most recent 5000 records as of 7/5/2026");
        
        let counts = {"Pass": 0, "Pass w/ Conditions": 0, "Fail": 0};
        inspectionData.forEach(d => {
            if(counts[d.results] !== undefined) {
                counts[d.results]++;
            }
        });
        
        const plotData = [
            {status: "Pass", count: counts["Pass"]},
            {status: "Pass w/ Conditions", count: counts["Pass w/ Conditions"]},
            {status: "Fail", count: counts["Fail"]}
        ];
        
        console.log("Scene 1 Plot Data:", plotData);

        const margin = {top: 80, right: 150, bottom: 50, left: 100};
        const width = 1000 - margin.left - margin.right;
        const height = 800 - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(plotData.map(d => d.status))
            .range([0, width])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(plotData, d => d.count) || 10]) 
            .range([height, 0]);

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .style("font-size", "14px");

        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).ticks(5))
            .style("font-size", "12px");

        g.selectAll("rect")
            .data(plotData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.status))
            .attr("width", xScale.bandwidth())
            .attr("fill", d => d.status === "Fail" ? "#d9534f" : "#5bc0de")
            .attr("y", height)
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.count))
            .attr("height", d => height - yScale(d.count));

        const failCount = counts["Fail"];
        
        if (failCount > 0) {
            try {
                const annotations = [{
                    note: {
                        title: "Significant Failure Rate",
                        label: `${failCount} establishments failed their recent inspection.`,
                        wrap: 150 
                    },
                    x: xScale("Fail") + xScale.bandwidth() / 2,
                    y: yScale(failCount),
                    dy: 40,
                    dx: 90
                }];

                const makeAnnotations = d3.annotation()
                    .type(d3.annotationCalloutElbow)
                    .annotations(annotations);

                setTimeout(() => {
                    g.append("g")
                        .attr("class", "annotation-group")
                        .call(makeAnnotations)
                        .style("font-size", "12px");
                }, 1000);
            } catch (error) {
                console.error("D3 Annotation Error:", error);
            }
        }
        
        console.log("Drawing Scene 1 Finished");
    // **************************************************
    // SCENE 2 DRILL-DOWN
    // **************************************************

    } else if (sceneIndex === 2) {
        d3.select("#scene-description").text("Scene 2: The Drill-down - Which facility types fail the most?");

        let facilityCounts = {};
        inspectionData.forEach(d => {
            if (d.results === "Fail" && d.facility_type) {
                let type = d.facility_type.toUpperCase();
                facilityCounts[type] = (facilityCounts[type] || 0) + 1;
            }
        });

        const plotData = Object.keys(facilityCounts)
            .map(k => ({type: k, count: facilityCounts[k]}))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        console.log("Scene 2 Plot Data:", plotData);

        const margin = {top: 120, right: 150, bottom: 80, left: 100};
        const width = 1000 - margin.left - margin.right; // Updated to 1000
        const height = 800 - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(plotData.map(d => d.type))
            .range([0, width])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(plotData, d => d.count) || 10])
            .range([height, 0]);

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-15)")
            .style("text-anchor", "end")
            .style("font-size", "11px");

        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).ticks(5))
            .style("font-size", "12px");

        g.selectAll("rect")
            .data(plotData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.type))
            .attr("width", xScale.bandwidth())
            .attr("fill", "#d9534f")
            .attr("y", height)
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", d => yScale(d.count))
            .attr("height", d => height - yScale(d.count));

        if (plotData.length > 0) {
            try {
                const topTarget = plotData[0];
                const annotations = [{
                    note: {
                        title: "Restaurants Dominate",
                        label: `Traditional restaurants account for the vast majority of failed inspections.`,
                        wrap: 150
                    },
                    x: xScale(topTarget.type) + xScale.bandwidth() / 2,
                    y: yScale(topTarget.count),
                    dy: -5,
                    dx: 60
                }];

                const makeAnnotations = d3.annotation()
                    .type(d3.annotationCalloutElbow)
                    .annotations(annotations);

                setTimeout(() => {
                    g.append("g")
                        .attr("class", "annotation-group")
                        .call(makeAnnotations)
                        .style("font-size", "12px");
                }, 1000);
            } catch (error) {
                console.error("D3 Annotation Error:", error);
            }
        }

        console.log("Drawing Scene 2 Finished");
    // **************************************************
    // SCENE 3 heatmap
    // **************************************************    
    } else if (sceneIndex === 3) {
        d3.select("#scene-description").html('Scene 3: Explore the Violation Map. Hover over the dots to see details. (<span style="color:#d9534f;">● Fail</span>, <span style="color:#5bc0de;">● Pass</span>)');

        const validData = inspectionData.filter(d => d.longitude && d.latitude);
        
        console.log("Scene 3 Plot Data:", validData.length, "valid locations");

        const margin = {top: 20, right: 20, bottom: 20, left: 20};
        const width = 1000 - margin.left - margin.right;
        const height = 800 - margin.top - margin.bottom;

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(validData, d => parseFloat(d.longitude)))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(validData, d => parseFloat(d.latitude)))
            .range([height, 0]);

        const tooltip = d3.select("#tooltip");

        g.selectAll("circle")
            .data(validData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(parseFloat(d.longitude)))
            .attr("cy", d => yScale(parseFloat(d.latitude)))
            .attr("r", 2.5)
            .attr("fill", d => d.results === "Fail" ? "#d9534f" : "#5bc0de")
            .attr("opacity", 0)
            .transition()
            .duration(1500)
            .attr("opacity", 0.6);

        g.selectAll("circle")
            .on("mouseover", function(d) {
                d3.select(this)
                  .attr("stroke", "#333")
                  .attr("stroke-width", 1.5)
                  .attr("opacity", 1)
                  .attr("r", 5);
                
                tooltip.classed("hidden", false)
                    .html(`<strong>${d.dba_name}</strong><br>Status: ${d.results}<br>Risk: ${d.risk}`);
            })
            .on("mousemove", function() {
                tooltip.style("left", (d3.event.pageX + 15) + "px")
                       .style("top", (d3.event.pageY - 25) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                  .attr("stroke", "none")
                  .attr("opacity", 0.6)
                  .attr("r", 2.5);
                
                tooltip.classed("hidden", true);
            });

        const legend = g.append("g")
            .attr("transform", `translate(${width - 80}, 20)`);

        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 5)
            .attr("fill", "#d9534f");
            
        legend.append("text")
            .attr("x", 12)
            .attr("y", 4)
            .text("Fail")
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 20)
            .attr("r", 5)
            .attr("fill", "#5bc0de");
            
        legend.append("text")
            .attr("x", 12)
            .attr("y", 24)
            .text("Pass")
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");

        console.log("Drawing Scene 3 Finished");
    }
}