//set prerequiresites
let currentScene = 1;
const maxScene = 3;
let inspectionData = []; // to store the data from CFI api

//loading and initatalizing
async function init() {
    try {
        // request the data...set limit to 1500 records
        const url = "https://data.cityofchicago.org/resource/4ijn-s7e5.json";
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
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

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
                    dy: -40,
                    dx: 40
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