
function BarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    marginTop = 20, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 0, // the bottom margin, in pixels
    marginLeft = 0, // the left margin, in pixels
    width = 400, // the outer width of the chart, in pixels
    height = 120, // the outer height of the chart, in pixels
    xDomain, // an array of (ordinal) x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.5, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor", // bar fill color
    textColor = "textColor"
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    console.log(Y[0])


    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    xDomain = new d3.InternSet(xDomain);

    // Omit any data not present in the x-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(3);

    // Compute titles.
    title = i => `${X[i]}\n${Y[i]}`+' tweets';


    const svg = d3.create("svg")
        .attr("id", "barplot")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");


    // Filter drop shadow

    var defs = svg.append("defs");

    var filter = defs.append("filter")
        .attr("id", "dropshadow")

    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2)
        .attr("result", "blur");
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");

    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

    // var div = d3.select("#barplot").append("div")
    //     .attr("class", "tooltip")
    //     .style("opacity", 0);

    // svg.append("g")
    //     .attr("transform", `translate(${marginLeft},0)`)
    //     .call(yAxis)
    //     .call(g => g.select(".domain").remove())

    const bar = svg.append("g")
        .attr("fill", color)
        .selectAll("rect")
        .data(I)
        .join("rect")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("width", xScale.bandwidth())
        .attr("filter", "url(#dropshadow)");
    // .on("mouseover", function(d){
    //     d3.select(this).attr("fill", "red");
    //     div.transition()
    //         .style("opacity", .9)
    // })
    // .on("mouseout", function(d){
    //     d3.select(this).attr("fill", color)
    //     div.transition()
    //         .style("opacity", 0);
    // });


    svg.selectAll(".bar-title")
        .data(I)
        .enter()
        .append("text")
        .classed('bar-title', true)
        .attr('text-anchor', 'middle')
        .attr("x", d => xScale(X[d]) + xScale.bandwidth()/2)
        .attr("y", d => yScale(Y[d])+15)
        .text(d => `${Y[d]}`)
        .style("font", "sans-serif")
        .attr("fill", textColor);

    svg.selectAll(".candidates-name")
        .data(I)
        .enter()
        .append("text")
        .classed('candidates-name', true)
        .attr('text-anchor', 'middle')
        .attr("x", d => xScale(X[d]) + xScale.bandwidth()/2)
        .attr("y", d => yScale(Y[d])-10)
        .text(d => `${X[d]}`)
        .style("font", "sans-serif")
        .style("font-size", "12px")
        .attr("fill", textColor)


    return svg.node();
}



async function ThemeGraphe() {
    const svg1 = document.getElementById("ThemeGraphe");
    let data = await fetch("api/theme/count/all")
        .then((response) => response.json())
        .then((result) => {
            return result;
        });


    svg1.append(await BarChart(data, {
        x: d => d.nameCandidates,
        y: d => d.nbTweetsByThemes,
        color: "#EF7767",
        textColor: "black"
    }))

    let selector = document.getElementById("top-select")
    selector.addEventListener('input', async () => {
        d3.select('#barplot').remove();
        if(parseInt(selector.value) === 0){
            data = await fetch("api/theme/count/all")
                .then((response) => response.json())
                .then((result) => {
                    return result;
                });
            svg1.append(await BarChart(data, {
                x: d => d.nameCandidates,
                y: d => d.nbTweetsByThemes,
                xDomain: d3.groupSort(data, ([d]) => -d.nbTweetsByThemes, d => d.nameCandidates), // sort by descending frequency
                color: "#EF7767",
                textColor: "black"
            }))
        }
        else{
            data = await fetch("api/theme/count/"+selector.value)
                .then((response) => response.json())
                .then((result) => {
                    return result;
                });
            svg1.append(await BarChart(data, {
                x: d => d.nameCandidates,
                y: d => d.nbTweetsByThemes,
                xDomain: d3.groupSort(data, ([d]) => -d.nbTweetsByThemes, d => d.nameCandidates), // sort by descending frequency
                color: "white",
                textColor: "black"
            }))
        }
    })

}


ThemeGraphe()




















