function add_legs() {
	
	var legs_button_div = document.getElementById("legs_button")
	var legs_button = legs_button_div.getElementsByTagName("button")[0]

	if (legs_button_div.className == "hidden") {

		var legs = document.createElement("img")
		legs.id = "legs"
		legs.src = "legs.jpg"
		legs.style.width = "100%"
		document.getElementById("strange_body")
		        .insertBefore(legs, legs_button_div)

		legs_button_div.className = "shown"
		legs_button.innerHTML = "HIDE THE HORROR!"
	
	}
	
	else if (legs_button_div.className == "shown") {

		var legs = document.getElementById("legs")
		legs.parentNode.removeChild(legs)

		legs_button_div.className = "hidden"
		legs_button.innerHTML = "CHECK MY LEGS OUT"
	
	}
}

