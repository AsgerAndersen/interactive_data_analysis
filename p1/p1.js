function add_legs() {
	var legs_button = document.getElementById("legs_button")
	var legs = document.body.querySelector("#legs")
	if (legs == null) {
		legs = document.createElement("img")
		legs.id = "legs"
		legs.src = "legs.jpg"
		legs.style.width = "100%"
		document.getElementById("strange_body")
		        .insertBefore(legs, legs_button)
		legs_button.innerHTML = "HIDE THE HORROR!"
	}
	else {
		legs.parentNode.removeChild(legs)
		legs_button.innerHTML = "CHECK MY LEGS OUT"
	}
}

