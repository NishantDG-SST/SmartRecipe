const apiKey1 = "a4e1dc74fc364c3382b24dd026d3522b"; 

const checkApiLimit = (data) => {
    if (data.code === 402) {
        return "Daily API limit reached. Please try again tomorrow.";
    }
    return null;
};

const fetchRecipe = async () => {
    console.log('fetchRecipe called');
    const query = document.getElementById('search').value.trim();
    
    if (!query) {
        document.getElementById('recipe').innerHTML = `<p class="text-red-500">Please enter an ingredient.</p>`;
        return;
    }

    try {
        const recipeUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=1&apiKey=${apiKey1}`;
        const recipeRes = await fetch(recipeUrl);
        const recipeData = await recipeRes.json();
        
        console.log("API Response:", recipeData); // Debug log
        
        const apiLimitError = checkApiLimit(recipeData);
        if (apiLimitError) {
            document.getElementById('recipe').innerHTML = `<p class="text-red-500">${apiLimitError}</p>`;
            return;
        }

        if (!recipeData.results || recipeData.results.length === 0) {
            document.getElementById('recipe').innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <p class="text-red-500 font-semibold">No recipes found for "${query}". Please try a different ingredient.</p>
                </div>`;
            return;
        }

        const recipe = recipeData.results[0];
        const detailsUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey1}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        const ingredients = detailsData.extendedIngredients.map(ing => `<li class="border-b py-1">${ing.original}</li>`).join("");

        document.getElementById('recipe').innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-md animate-fadeIn">
                <h2 class="text-xl font-bold text-center mb-4">${detailsData.title}</h2>
                
                <div class="flex flex-col md:flex-row space-x-4">
                    <div class="w-full md:w-1/2">
                        <img src="${detailsData.image}" class="w-full h-auto object-cover rounded-md">
                    </div>
                    
                    <div class="md:w-1/2">
                        <h3 class="font-semibold text-lg">Ingredients</h3>
                        <ul class="list-disc list-inside bg-gray-100 p-2 rounded-md">${ingredients}</ul>
                    </div>
                </div>

                <h3 class="font-semibold text-lg mt-4">Instructions</h3>
                <p class="text-gray-700">${detailsData.instructions || "No instructions available."}</p>

                <button onclick="fetchNutrition(${detailsData.id})"
                        class="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                    Get Nutrition Info
                </button>
            </div>
        `;

        fetchYouTubeVideo(detailsData.title);

    } catch (error) {
        console.error("Error fetching recipe:", error);
        document.getElementById('recipe').innerHTML = `<p class="text-red-500">An error occurred while fetching the recipe.</p>`;
    }
};

const fetchYouTubeVideo = async (recipeName) => {
    try {
        const searchQuery = encodeURIComponent(`${recipeName} recipe cooking`);
        const youtubeApiKey = 'AIzaSyAE8p39ZGJPCips_CDmhx9d59QoMUwodHs';
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&key=${youtubeApiKey}&type=video&maxResults=1`);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            document.getElementById('youtube').innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-md mt-4 animate-fadeIn">
                <h3 class="font-semibold text-lg mb-4">Related Cooking Video</h3>
                <iframe 
                    width="100%" 
                    height="315" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            `;
        }
    } catch (error) {
        console.error("Error fetching YouTube video:", error);
        document.getElementById('youtube').innerHTML = `<p class="text-red-500">An error occurred while fetching the video.</p>`;
    }
};

const fetchNutrition = async (recipeId) => {
    try {
        const nutritionUrl = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${apiKey1}`;
        const nutritionRes = await fetch(nutritionUrl);
        const nutritionData = await nutritionRes.json();

        document.getElementById('nutrition').innerHTML = `
            <div class="bg-gray-100 p-4 rounded-lg mt-4 shadow-md animate-slideIn">
                <h3 class="font-semibold text-lg">Nutrition Info</h3>
                <p><strong>Calories:</strong> ${nutritionData.calories}</p>
                <p><strong>Carbs:</strong> ${nutritionData.carbs}</p>
                <p><strong>Protein:</strong> ${nutritionData.protein}</p>
                <p><strong>Fat:</strong> ${nutritionData.fat}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching nutrition:", error);
        document.getElementById('nutrition').innerHTML = `<p class="text-red-500">An error occurred while fetching nutrition info.</p>`;
    }
};
