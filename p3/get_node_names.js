d3.select(window).on('load', init)

var names = []

function init() {
    d3.json(
        'data.json',
        function(error, data) {
            if (error) throw error;
            getNames(data)
            names = names.map(makeObject)
            names = JSON.stringify(names)
            console.log(names)
        }
    )
}

function getNames(node) {
	names.push(node["name"])
	if (node.hasOwnProperty("partners")) {
		node["partners"].forEach(getNames)
	}
	else if (node.hasOwnProperty("children")) {
		node["children"].forEach(getNames)
	}
	else {return}
}

function makeObject(name) {
	return {"name": name, "link": ""}
}