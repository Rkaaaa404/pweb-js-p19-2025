document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.autoscroll-track');

    async function fetchAndDisplayFeaturedRecipes() {
        if (!track) return; 

        try {
            const response = await fetch('https://dummyjson.com/recipes?limit=5&select=name,image,id');
            if (!response.ok) throw new Error('Failed to fetch featured recipes');
            const data = await response.json();
            
            let recipesHtml = data.recipes.map(recipe => 
                `
                <a href="recipes.html#${recipe.id}" class="featured-recipe-card">
                    <img src="${recipe.image}" alt="${recipe.name}">
                    <h4>${recipe.name}</h4>
                </a>
                `
            ).join('');

            track.innerHTML = recipesHtml + recipesHtml + recipesHtml;

        } catch (error) {
            console.error(error);
            track.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Could not load recipes.</p>`;
        }
    }

    fetchAndDisplayFeaturedRecipes();
});