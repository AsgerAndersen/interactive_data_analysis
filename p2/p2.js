d3.select(window).on('load', init);
var raw_data;

function init() {
    d3.csv(
        'data.csv',
        function(error, data) {
            if (error) throw error;
            raw_data = data;
            updateVisualisations()
        }
    );
}

function updateVisualisations(){

    //De valgte måneder udtrækkes fra data her
    var selected_data = selectMonths(raw_data)

    //Udtrukket data sendes til Visualisering2
    vis2(selected_data)
}

//Visualisering 2
function vis2(data)
{

    data.sort(function(a, b){ return a["VAL"] - b["VAL"];});
    console.log(data.length);

    var data_domain = d3.extent(data,
        function(d){
            return d["YEAR"];});

    var num_decades = Math.ceil((data_domain[1] - data_domain[0]) / 10)
    console.log(num_decades);

    var decades = d3.range(data_domain[0], data_domain[1], 10);

    var unit_decades = d3.range(0, 1, 1 / num_decades);
    console.log(unit_decades.length);


    var year2color = d3.scaleQuantize()
        .domain(data_domain)
        .range(unit_decades.map(function(d){ return d3.interpolateYlGnBu(d)}));

    var year2decade = d3.scaleQuantize()
        .domain(data_domain)
        .range(decades);



    d3.select('#vis2')
        .selectAll("div")
        .remove();

    d3.select('#vis2')
        .selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .html(function(d){return d["YEAR"];})
        .style("background-color", function(d){return year2color(d["YEAR"]);})
        //.style("background-color", "white")
        .attr("class", "vis2row")
        .exit()
        .remove()
}


//Funktion til at udtrække valgte måneder fra datasættet
function selectMonths(data)
{
    months = checkedMonths();
    if (months.length == 0 || months.length == 12)
    {
        months = ["metANN"]
    }
    console.log(months)
    data = data.map(function(row){
        var val = d3.mean(months.map(function(key) {
            return row[key];
        }));
        return {"YEAR": row["YEAR"], "VAL": val};
    });
    return data
}

function checkedMonths()
{
    var status = [];
    d3.select('#global_options_table').selectAll(".month_checkbox").each(
        function(d, i) {
            if (this.checked) {
                status.push(this.getAttribute("id"));
            }
        });
    console.log(status);
    return status;
}

//Stort første bogstav
function upperCaseFirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
