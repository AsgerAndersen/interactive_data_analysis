function popUp(parent, target, hori, vert, title, text, highlight, n) {

    var targ = d3.selectAll(target).classed("highlighted", highlight).node();
    var box = d3.select(parent)
        .append("div")
        .classed("popup", true)
        .style(vert[0], vert[1] + "px")
        .style(hori[0], hori[1] + "px");

    d3.select(target).classed("highlighted", highlight);

    box.append("div")
        .classed("popupTitle", true)
        .text(title);

    box.append("div")
        .classed("popupDescription", true)
        .html(text);

    box.append("div")
        .classed("popupPrevious", true)
        .text("Previous");

    box.append("div")
        .classed("popupNext", true)
        .text("Next");

    box.append("div")
        .classed("popupClose", true)
        .text("X");

    box.select(".popupClose").on("click", function() {closePopUp();});
    box.select(".popupNext").on("click", function() {closePopUp(); tutorialStep(n+1);});
    box.select(".popupPrevious").on("click", function() {closePopUp(); tutorialStep(n-1);});
}

function closePopUp() {
    d3.select(".popup").remove();
    d3.selectAll(".highlighted").classed("highlighted", false);
}

function tutorialStep(n) {
    var args = slides[n];
    args.fun();
    popUp(args.parent, args.target, args.hori, args.vert, args.title, args.text, args.highlight, n)
    d3.select(".popup").node().scrollIntoView({block: "center", inline: "center", behavior: "smooth"});
}

function tutorial() {
    tutorialStep(0);

}

var slides = [
    {
        parent: "#visualisation",
        target: "#visualisation",
        hori: ["left", 600],
        vert: ["top", 50],
        title: "Our Visual Tool",
        text: "Here we see our visual exploration tool used on one randomly sampled week of the bluetooth scans dataset.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#visdiv",
        target: "#control_board",
        hori: ["right", 30],
        vert: ["bottom", 200],
        title: "Parameter Control Board",
        text: "Right now, the threshold signal strength is set to -90 dbm, the length of each timebin is set to 15 minutes, and we want to explore the graph sequence between midnight day 1 and midnight day 2.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#secondary_vis",
        target: ".vTimeLine",
        hori: ["right", 300],
        vert: ["top", 500],
        title: "Time Bins",
        text: "Here we see that the visualized graph is covering the timebin from 00:00 to 00:15",
        highlight: true,
        fun: function () {viewBin(0);}
    },

    {
        parent: "#visdiv",
        target: "#svg_wrapper",
        hori: ["right", 0],
        vert: ["top", 0],
        title: "Main Graph",
        text: "Here we therefore see a link between all users, where one of the user's phones have scanned the other user's phone at least one time with at least a signal strength of -90 during the time from 00:00 to 00:15 the night between sunday and monday.<br><br>" +
        "You can scroll and pan in order to get a better view of things.<br><br>" +
        "If you think the graph looks two messy, you can try and press the reheat button and see if this makes it look more structured. This is mostly relevant, if there are a lot of nodes and links.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#visdiv",
        target: "#isolated_count_div",
        hori: ["left", 200],
        vert: ["top", 500],
        title: "Isolated Nodes",
        text: "We do not visualize all the user's with no links in this timebin. Instead, we write here how many of such user's the timebin has.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#visdiv",
        target: "#visdiv",
        hori: ["left", 600],
        vert: ["top", 0],
        title: "Navigation",
        text: "Try now to go through the sequence of graphs by using your left and right arrow keys",
        highlight: false,
        fun: function () {}
    },

    {
        parent: "#secondary_vis",
        target: "#secondary_vis",
        hori: ["right", 30],
        vert: ["top", 0],
        title: "Statistics",
        text: "These are charts of the values of different descriptive statistics calculated on each graph in the graph sequence.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#secondary_vis",
        target: "#stat_div0",
        hori: ["left", 30],
        vert: ["top", 150],
        title: "Average Degree",
        text: "This statistic is the average number of links of each user, when we include the users with no links. That is, the number of users is always taken to be " + data_props.nodes,
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#secondary_vis",
        target: "#stat_div1",
        hori: ["left", 30],
        vert: ["top", 450],
        title: "Number of Isolated Nodes",
        text: "This statistic is the number of users with no links in the given timebin.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#secondary_vis",
        target: "#stat_div2",
        hori: ["left", 30],
        vert: ["top", 700],
        title: "Link Growth",
        text: "This statistic is the number of links in the current timebin minus the number of links in the preceding timebin",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#secondary_vis",
        target: "#stat_div3",
        hori: ["left", 30],
        vert: ["top", 910],
        title: "Link Growth",
        text: "This statistic is the ratio between the number of links in the current timebin and the number of links in the preceding timebin, minus 1. If there are twice as many links in the current timebin than in the preceding, then the relative link growth will for instance be 100%",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#visdiv",
        target: "#toggle_communities_div",
        hori: ["right", 200],
        vert: ["top", 0],
        title: "Grouping",
        text: "This button shows the clusters in the current graph according to the <a href=\"https://en.wikipedia.org/wiki/Louvain_Modularity\"> Louvain Modularity clustering method</a>, which we have used <a href=\"https://github.com/upphiminn/jLouvain\">this implementation</a> to calculate. This method works only on one static graph, not on sequence of graphs, which means that the clusters calculated in the current graph only depends on this graph and not on any other of the graphs in the sequence.<br><br>" +
        "This functionality is not very relevant for the researchers at SODAS, since they are not interested in this particular way of clustering the graph. We included it anyway in this exam context to show a way of visualization clusters calculated on the graph sequence. This method can be used by the researchers with their own methods of graph clustering, if these methods are implemented in a way, so they fit into our program's implementation.<br><br>" +
        "We also have to note that the color based visualization of the clusters does not work very well, since there are too many clusters, so different clusters end up sharing colors, which is very problematic. We wanted to solve this by implementing that when the user hovers with the mouse over one cluster, then the color of all other clusters than this change to black. Unfortunately, we did not have the time to implement this feature.",
        highlight: true,
        fun: function () {}
    },

    {
        parent: "#visdiv",
        target: "#community_count_div",
        hori: ["right", 400],
        vert: ["top", 100],
        title: "Groups",
        text: "This statistic is the number of clusters in the graph",
        highlight: true,
        fun: function () {
            var button = d3.select("#toggle_communities_div");
            button.classed("off", false);
            params.coloring = true;
            redrawGraph(false);}
    },

    {
        parent: "#visdiv",
        target: "#visdiv",
        hori: ["right", 0],
        vert: ["top", 0],
        title: "Groups",
        text: "Now you try to change the parameters that define how the graph is calculated and explore how that changes the sequence. Go ahead and explore!",
        highlight: false,
        fun: function () {}
    }
];
