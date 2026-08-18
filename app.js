/*

API's

*/

// API 1: http://www.omdbapi.com/?apikey=2a81e10
// API 2 (Poster Request): http://img.omdbapi.com/?apikey=2a81e10

async function main() {
    const users = await fetch("http://www.omdbapi.com/?apikey=2a81e10&t=test")
    const usersData = await users.json()
    const userListEl = document.querySelector('.cards')
    console.log(usersData)
    userListEl.innerHTML = usersData.map((user) => userHTML(user)).join('')
}

main()

function showUserPosts(id) {
    localStorage.setItem("id", id)
    window.location.href = `${window.location.origin}/user.html`
}

function userHTML(user) {
    return `<div class="card" onclick="showUserPosts(${user.id})">
	<img src="assets/images/test-poster.jpg" alt="" class="card__image">
	<h2 class="card__title">${user.Title}</h2>
	<div class="card__info--card">
		<i class="fa-solid fa-info"></i>
		 <h3 class="card__desc">${user.Year} * ${user.Runtime} * ${user.Rated}</h3>
	</div>
		<div class="card__actors--card">
		<i class="fa-solid fa-person"></i>
		<h3 class="card__actors">${user.Actors}</h3>
	</div>
 </div>`
}

function storeID(id) {
    localStorage.setItem("id", id)
}