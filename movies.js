const postListEl = document.querySelector('.cards')
const id = localStorage.getItem("id")

async function onSearchChange(event) {
    const id = event.target.value
    renderPosts(id)
}

async function renderPosts(id) {
    const posts = await fetch(`http://www.omdbapi.com/?apikey=2a81e10&t=${id}`)
    const postsData = await posts.json()

    postListEl.innerHTML = postsData.map(post => postHTML(post)).join('')
}

function postHTML(post) {
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