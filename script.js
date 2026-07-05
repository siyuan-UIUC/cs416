//set prerequiresites
let currentScene = 1;
const maxScene = 3;
let inspectionData = []; // to store the data from CFI api

//loading and initatalizing
async function init() {
    try {
        // request the data...set limit to 1500 records
        const url = "https://data.cityofchicago.org/resource/4ijn-s7e5.json?$limit=1500";
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

    if (sceneIndex === 1) {
        d3.select("#scene-description").text("Scene 1: Overall Pass vs Fail Rate of Chicago Food Establishments.");
        // the overall rate
        if (sceneIndex === 1) {
        d3.select("#scene-description").text("Scene 1: Overall Pass vs Fail Rate of Chicago Food Establishments.");
        
        // caculate the statistics
        let counts = {"Pass": 0, "Pass w/ Conditions": 0, "Fail": 0};
        inspectionData.forEach(d => {
            if(counts[d.results] !== undefined) {
                counts[d.results]++;
            }
        });
        
        // cover to D3 preferred format.
        const plotData = [
            {status: "Pass", count: counts["Pass"]},
            {status: "Pass w/ Conditions", count: counts["Pass w/ Conditions"]},
            {status: "Fail", count: counts["Fail"]}
        ];

        // set up the size and position 
        const margin = {top: 50, right: 150, bottom: 50, left: 150};
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // create the main container and  'g' . 
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //  set up Scales
        const yScale = d3.scaleBand()
            .domain(plotData.map(d => d.status))
            .range([0, height])
            .padding(0.3);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(plotData, d => d.count)])
            .range([0, width]);

        // create bar charts
        g.selectAll("rect")
            .data(plotData)
            .enter()
            .append("rect")
            .attr("y", d => yScale(d.status))
            .attr("x", 0)
            .attr("height", yScale.bandwidth())
            .attr("width", d => xScale(d.count))
            // "Fail" in RED
            .attr("fill", d => d.status === "Fail" ? "#d9534f" : "#5bc0de");

        //Axes
        g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).tickSize(0))
            .style("font-size", "14px");

        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(5))
            .style("font-size", "12px");

        //Annotations
        const failCount = counts["Fail"];
        const annotations = [{
            note: {
                title: "Significant Failure Rate",
                label: `${failCount} establishments failed their recent inspection, posing potential public health risks.`,
                wrap: 150 
            },
            
            x: xScale(failCount),
            y: yScale("Fail") + yScale.bandwidth() / 2,
            dy: -60, 
            dx: 50   
        }];

        const makeAnnotations = d3.annotation()
            .type(d3.annotationCalloutElbow)
            .annotations(annotations);

        g.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
            .style("font-size", "12px");
    }
        console.log("Drawing Scene 1");

    } else if (sceneIndex === 2) {
        d3.select("#scene-description").text("Scene 2: High Risk Facilities - Why Restaurants fail more often.");
        // fail
        console.log("Drawing Scene 2");

    } else if (sceneIndex === 3) {
        d3.select("#scene-description").text("Scene 3: Explore the Violation Map. Hover over the red dots to see details.");
        // the scatterplot map
        console.log("Drawing Scene 3");
    }
}