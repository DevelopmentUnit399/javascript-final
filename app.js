function executeLandingSearch() {
	const inputEl = document.getElementById("landing-search")
	const query = inputEl ? inputEl.value.trim() : ""

	if (query) {
		window.location.href = `movies.html?search=${encodeURIComponent(query)}`
	} else {
		window.location.href = `movies.html`
	}
}

function onLandingSearch(event) {
	if (event.key === "Enter") {
		executeLandingSearch()
	}
}