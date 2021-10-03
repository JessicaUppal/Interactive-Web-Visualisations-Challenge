function init() {
    // Create dropdown menu
    d3.json("samples.json").then(function(data) {
        d3.select("#selDataset").selectAll("option")
            .data(data.names)
            .enter()
            .append("option")
            .html((d) => 
                `<option>${d}</option>`)
            id = data.names[0];
            buildPlot(id);
    });
};

function optionChanged(id) {
    buildPlot(id)
};

// Declare function for plots
function buildPlot(id){
    d3.json("samples.json").then(function(data) {
        // Use selected index to call the metadata and sample data from the JSON object.
        var index = data.names.indexOf(id);
        var meta = data.metadata[index];
        var sample = data.samples[index];
    
        // Collect information from the OTU samples.
        var otuIds = sample.otu_ids;
        var otuLabels = sample.otu_labels;
        var sampleValues = sample.sample_values;
    
        // Collect metadata from the selected subject and save in an array.
        var entries = Object.entries(meta);
        
        // Plot bar chart with top 10 OTUs
        // Display top 10 OTUs 
        var barTrace = {
            x: sampleValues.slice(0,10).reverse(),
            y: otuIds.slice(0,10).reverse().map(otuId => "OTU " + otuId),
            // Add OTU labels
            text: otuLabels.slice(0,10).reverse(),
            type: 'bar',
            orientation: 'h'
        };


        // Label bar chart
        var barLayout = {
            xaxis: {
                title:{
                    text: "Sample values"
                }
            },
            yaxis: {
                title:{
                    text: "OTU ID"
                }
            }
        };

        // Set trace for the bubble chart:
        var bubTrace = {
            x: otuIds,
            y: sampleValues,
            // Label: OTU labels
            text: otuLabels,
            mode: "markers",
            // Set marker size and color for each OTU.
            marker: {
                size: sampleValues.map(value=> value * 0.80),
                color: otuIds
            }
        };

       // Label bubble chart
       var bubLayout = {
        xaxis: {
            title:{
                text: "OTU ID"
            }
        },
        yaxis: {
            title:{
                text: "Sample values"
            }
        }
    };

        // Set trace for gauge chart
        var gaugeTrace = {
            // Get "wfreq" from data    
            value: meta.wfreq,
                title: { text: "Belly Button Wahshing Frequency<br>Scrubs per Week" },
                type: "indicator",
                mode: "gauge+number",
                gauge: {
                    axis: {range: [null, 9], tickmode: "linear"},
                    bar: { color: "darkblue" },
                    steps: [
                        { range: [0,3], color: "white"},
                        { range: [3,6], color: "powderblue"},
                        { range: [6,9], color: "lightskyblue"},
                    ]
                }
            };


        // Set gauge chart layout
        var gaugeLayout = { width: 500, height: 500, margin: { t: 0, b: 0 } };

        // Set traces
        var barData = [barTrace];
        var bubData = [bubTrace];
        var gaugeData = [gaugeTrace];
        // Plot traces using plotly
        Plotly.newPlot("bar", barData, barLayout);
        Plotly.newPlot("bubble", bubData, bubLayout);
        Plotly.newPlot("gauge", gaugeData, gaugeLayout);
         
        // Add subject data 
        d3.select("#sample-metadata").html("")
        d3.select("#sample-metadata").selectAll("p")
            .data(entries)
            .enter()
            .append("p")
            .html((d) => 
                `<p>${d[0]}: ${d[1]}</p>`)
    });
};

// Run function
init();