
let selectedIngredient = null; 
let startPos = 0;
let getAmount = 100;
let urlIngredient = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1/livsmedel?offset=" + startPos + "&limit=" + getAmount + "&sprak=1";

const ingredientsContainer = document.getElementById("ingredientsContainer");
const searchText = document.getElementById("search-text"); 
const ingredientOptions = document.getElementById("ingredientOptions");

searchText.addEventListener("input", getIngredientOptions); 
document.getElementById("addButton").addEventListener("click", addIngredient); 

let ingredients = [];
getIngredients();
let selectedIngredients = [];


function getIngredients() {
    fetch(urlIngredient)
        .then(
            function (response) {
                return response.json();
            }
        )
        .then(
            function (data) {
                console.log(data);
                console.log(data.livsmedel);
                data.livsmedel.map(ingredientApi => {
                    ingredients.push({
                        ingredientId: ingredientApi.nummer,
                        ingredientName: ingredientApi.namn
                    });
                });
                console.log("ingredientsarray: ", ingredients);
                console.log("number of ingredients: ", ingredients.length);
            }
        )
        .catch(
            function (error) {
                console.log("Something went wrong: " + error + ", " + error.stack);
            }
        );
}

function getNutritions(ingredient) { 
    let urlNutrition = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1/livsmedel/" + ingredient.ingredientId + "/naringsvarden?sprak=1";
    fetch(urlNutrition)
        .then(
            function (response) {
                return response.json();
            }
        )
        .then(
            function (data) {
                console.log(data);
                createCard(ingredient, data); 
            }
        )
        .catch(
            function (error) {
                console.log("Something went wrong: " + error + ", " + error.stack);
            }
        );
}

function getIngredientOptions() {
    ingredientOptions.innerHTML = ""; 

    let searchInput = searchText.value.toLowerCase(); 

    ingredients.map(function (ingredient) { 
        if (ingredient.ingredientName.toLowerCase().includes(searchInput)) { 
            let option = document.createElement("p"); 
            option.textContent = ingredient.ingredientName; 

            option.onclick = function () { 
                searchText.value = ingredient.ingredientName; 
                selectedIngredient = ingredient; 
                ingredientOptions.innerHTML = ""; 
                console.log("Ingrediens som läggs till: ", selectedIngredient); 
            }
            ingredientOptions.appendChild(option); 
        }
    });
}

function addIngredient() {
    if (selectedIngredient == null) {
        return;
    }

    getNutritions(selectedIngredient) 
}

function createCard(ingredient, dataNutrition) {

    //dataNutrition is the array that have all the nutritions for the selected ingredient 
    let foundCarbs = dataNutrition.find(item => item.namn == "Kolhydrater, tillgängliga"); 
    let foundProtein = dataNutrition.find(item => item.namn == "Protein");
    let foundFat = dataNutrition.find(item => item.namn == "Fett, totalt");
    let foundKcal = dataNutrition.find(item => item.namn == "Energi (kcal)");

    console.log(foundCarbs);
    console.log(foundProtein);
    console.log(foundFat);
    console.log(foundKcal);

    let nutrition = {carbs: foundCarbs.varde,
        protein: foundProtein.varde,
        fat: foundFat.varde,
        calories: foundKcal.varde
    };

    let card = document.createElement("div");
    card.setAttribute("class", "card");

    let title = document.createElement("h3");
    title.textContent = ingredient.ingredientName;

    let carbs = document.createElement("p");
    carbs.textContent = "Kolhydrater: " + nutrition.carbs + " g";

    let protein = document.createElement("p");
    protein.textContent = "Protein: " + nutrition.protein + " g";

    let fat = document.createElement("p");
    fat.textContent = "Fett: " + nutrition.fat + " g";

    let calories = document.createElement("p");
    calories.textContent = "Kalorier: " + nutrition.calories + " kcal";

    //--------------------------------------------------
    let slider = createSlider();

    let grams = document.createElement("p");

    //Every card gets its own slider with its own span for grams
    let startValueGrams = document.createElement("span"); 
    startValueGrams.textContent = "100";

    let gramText = document.createTextNode(" gram");

    grams.appendChild(startValueGrams);
    grams.appendChild(gramText);

     let ingredientValues = {
        carbs: nutrition.carbs,
        protein: nutrition.protein,
        fat: nutrition.fat,
        calories: nutrition.calories,
        grams: 100 //Starts at 100
    };

    //Adding the values to an array to be able to calculate on it
    selectedIngredients.push(ingredientValues); 

    //What happens with the slider when changing value.
    //The function saves referenses to slider and startValueGrams that is created when addIngredients runs
    slider.oninput = function () {
        let valueGrams = slider.value; 
        startValueGrams.textContent = valueGrams; 

        ingredientValues.grams = valueGrams; 

        //Calculating for 1g. Multiplying it with the new value.
        let changedCarbsValue = Math.round((nutrition.carbs / 100) * valueGrams); 
        let changedProteinValue = Math.round((nutrition.protein / 100) * valueGrams);
        let changedFatValue = Math.round((nutrition.fat / 100) * valueGrams);
        let changedCaloriesValue = Math.round((nutrition.calories / 100) * valueGrams);

        carbs.textContent = "Kolhydrater: " + changedCarbsValue + " g";
        protein.textContent = "Protein: " + changedProteinValue + " g";
        fat.textContent = "Fett: " + changedFatValue + " g";
        calories.textContent = "Kalorier: " + changedCaloriesValue + " kcal";

        calculateTotalNutrition();
    }

    let deleteButton = document.createElement("input");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("value", "Ta bort")
    deleteButton.onclick = function () { //The function knows which card it's connected to. Works without id because I use the card which works directly with the object in the memory
        card.remove(); 

        //To delete the data
        let index = selectedIngredients.indexOf(ingredientValues);
        selectedIngredients.splice(index, 1); 
        
        //Calculating again after everything is removed
        calculateTotalNutrition();
    }

    card.appendChild(title);
    card.appendChild(carbs);
    card.appendChild(protein);
    card.appendChild(fat);
    card.appendChild(calories);
    card.appendChild(slider);
    card.appendChild(grams);
    card.appendChild(deleteButton);

    ingredientsContainer.appendChild(card);

    calculateTotalNutrition();
}

function createSlider() {
    let slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("min", "0");
    slider.setAttribute("max", "1000");
    slider.setAttribute("value", "100");
    slider.setAttribute("class", "slider");
    return slider;
}

function calculateTotalNutrition(){
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCalories = 0;

    for(let i = 0; i < selectedIngredients.length; i++){
        let ingr = selectedIngredients[i];

        totalCarbs += (ingr.carbs / 100) * ingr.grams;
        totalProtein += (ingr.protein / 100) * ingr.grams;
        totalFat += (ingr.fat / 100) * ingr.grams;
        totalCalories += (ingr.calories / 100) * ingr.grams;
    }

    document.getElementById("totalCarbs").textContent = Math.round(totalCarbs);
    document.getElementById("totalProtein").textContent = Math.round(totalProtein);
    document.getElementById("totalFat").textContent = Math.round(totalFat);
    document.getElementById("totalCalories").textContent = Math.round(totalCalories);
}

