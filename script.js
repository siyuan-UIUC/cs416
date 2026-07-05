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