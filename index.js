// Modify Dexie database initialization to include week-specific database
// Function to initialize the database for a specific week
const initDatabase = async (week) => {
    const db = new Dexie('GutDiverse_' + week); // Database name includes week
    db.version(1).stores({
        items: '++id, name, isEaten, quantity'
    });

    // Initialize totalDiversityScores[week] to 0 if it's undefined
    if (totalDiversityScores[week] === undefined) {
        totalDiversityScores[week] = 0;
    }

    return db;
}


const itemForm = document.getElementById('itemForm');
const itemsDiv = document.getElementById('itemsDiv');
const totalDiversityScoreDiv = document.getElementById('totalDiversityScoreDiv');

// Object to store total diversity score for each week
const totalDiversityScores = {};

// Array of diverse food items
const diverseFoodList = [
    // Fermented Foods
    'Yogurt', 'Kefir', 'Kimchi', 'Sauerkraut', 'Miso', 'Tempeh', 'Kombucha',
    // Fiber-Rich Foods
    'Whole grains', 'Oats', 'Barley', 'Quinoa', 'Brown rice', 'Legumes', 'Beans', 'Lentils', 'Chickpeas', 'Fruits', 'Berries', 'Apples', 'Bananas', 'Vegetables', 'Broccoli', 'Spinach', 'Carrots', 'Nuts and seeds', 'Almonds', 'Chia seeds', 'Flaxseeds',
    // Polyphenol-Rich Foods
    'Blueberries', 'Strawberries', 'Raspberries', 'Red grapes', 'Green tea', 'Dark chocolate',
    // Omega-3 Fatty Acid-Rich Foods
    'Fatty fish', 'Salmon', 'Mackerel', 'Sardines', 'Walnuts',
    // Protein Sources
    'Tofu',
    // Polyunsaturated Fats
    'Avocado', 'Olive oil',
    // Prebiotic Supplements
    'Prebiotic supplements',
    // Herbs and Spices
    'Turmeric', 'Ginger', 'Garlic', 'Cinnamon', 'Rosemary', 'Thyme'
];

let totalDiversityScore = 0;

// Function to populate items div for the current week
const populateItemsDiv = async () => {
    const db = await initDatabase(currentWeek); // Initialize database for current week
    const allItems = await db.items.reverse().toArray();

    const checkedItems = allItems.filter(item => item.isEaten && diverseFoodList.includes(item.name));

    itemsDiv.innerHTML = allItems.map(item => `
        <div class="item ${item.isEaten && 'eaten'}">
            <label class="checkbox-label">
                <input type="checkbox" class="checkbox" onchange="toggleItemStatus(event, ${item.id})" ${item.isEaten && 'checked'}>
                <span class="custom-checkbox"></span>
            </label>

            <div class="itemInfo">
                <p>${item.name}</p>
                <p>${item.quantity}</p>
            </div>
            <button class="deleteButton" onclick="removeItem(${item.id})">X</button>
        </div>
    `).join("");

    const totalItems = allItems.length;
    itemsDiv.innerHTML += `<p>Total Items on list: ${totalItems}</p>`;
    totalDiversityScoreDiv.innerText = 'Total Diversity Score: ' + totalDiversityScores[currentWeek];
}

window.onload = async () => {
    await populateItemsDiv(); // Populate items for the default week on window load
    updateTotalDiversityScoreDisplay(); // Update total diversity score display for the default week
}

itemForm.onsubmit = async (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput").value;
    const quantityInput = document.getElementById("quantityInput");
    const quantity = Number(quantityInput.value);

    // Check if the quantity is a valid number
    if (isNaN(quantity)) {
        alert("Quantity must be a number.");
        return;
    }

    const db = await initDatabase(currentWeek); // Initialize database for current week
    await db.items.add({ name, quantity, isEaten: false });
    itemForm.reset();
    await populateItemsDiv(); // Populate items for the current week after adding item
};

// Modify toggle item status function and remove item function to work with the current week's database
const toggleItemStatus = async (event, id) => {
    const db = await initDatabase(currentWeek); // Initialize database for current week
    const item = await db.items.get(id);
    if (!item) return;

    // Update the isEaten status
    await db.items.update(id, { isEaten: !!event.target.checked });
    // Update the total diversity score if the item is in diverse food list
    const itemNameLowerCase = item.name.toLowerCase(); // Convert item name to lowercase
    if (event.target.checked && diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase)) {
        totalDiversityScores[currentWeek]++;
    } else if (!event.target.checked && diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase)) {
        totalDiversityScores[currentWeek]--;
    }

    await populateItemsDiv();
}

// Modify remove item function to work with the current week's database
const removeItem = async (id) => {
    const db = await initDatabase(currentWeek); // Initialize database for current week
    const item = await db.items.get(id);
    if (!item) return;

    // Update the total diversity score if the item is in diverse food list
    const itemNameLowerCase = item.name.toLowerCase(); // Convert item name to lowercase
    if (diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase) && item.isEaten) {
        totalDiversityScores[currentWeek]--;
    }

    await db.items.delete(id);
    await populateItemsDiv();
}

let currentWeek = 'week1'; // Default to week 1

// Function to change the current week
const changeWeek = async () => {
    currentWeek = document.getElementById('weekSelector').value;
    await populateItemsDiv(); // Populate items for the selected week
    updateTotalDiversityScoreDisplay(); // Update total diversity score display for the selected week
}

// Function to recalculate and update total diversity score for the current week
const updateTotalDiversityScore = async () => {
    const db = await initDatabase(currentWeek); // Initialize database for current week
    const allItems = await db.items.toArray();
    let newTotalDiversityScore = 0; // Initialize the new total diversity score

    // Calculate the new total diversity score incrementally
    for (const item of allItems) {
        if (item.isEaten && diverseFoodList.includes(item.name)) {
            newTotalDiversityScore++; // Increment the score for each checked diverse item
        }
        
    }

    totalDiversityScores[currentWeek] = newTotalDiversityScore; // Update total diversity score for the current week
    updateTotalDiversityScoreDisplay(); // Update total diversity score display for the current week
};

// Function to update the total diversity score display for the current week
const updateTotalDiversityScoreDisplay = () => {
    const totalDiversityScoreDiv = document.getElementById('totalDiversityScoreDiv');
    const currentTotalDiversityScore = totalDiversityScores[currentWeek] || 0;
    totalDiversityScoreDiv.innerText = 'Total Diversity Score: ' + currentTotalDiversityScore;
}
