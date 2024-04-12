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
};

const itemForm = document.getElementById('itemForm');
const itemsDiv = document.getElementById('itemsDiv');
const diverseList = document.getElementById('diverseList');
const totalDiversityScoreDiv = document.getElementById('totalDiversityScoreDiv');

// Object to store total diversity score for each week
const totalDiversityScores = {};

// Array of diverse food items
let diverseFoodList = [
    // Fermented Foods
    'yogurt', 'kefir', 'kimchi', 'sauerkraut', 'miso', 'tempeh', 'kombucha',
    // Fiber-Rich Foods
    'whole grains', 'oats', 'barley', 'quinoa', 'brown rice', 'legumes', 'beans', 'lentils', 'chickpeas', 'fruits', 'berries', 'apples', 'bananas', 'vegetables', 'broccoli', 'spinach', 'carrots', 'nuts and seeds', 'almonds', 'chia seeds', 'flaxseeds',
    // Polyphenol-Rich Foods
    'blueberries', 'strawberries', 'raspberries', 'red grapes', 'green tea', 'dark chocolate',
    // Omega-3 Fatty Acid-Rich Foods
    'fatty fish', 'salmon', 'mackerel', 'sardines', 'walnuts',
    // Protein Sources
    'tofu',
    // Polyunsaturated Fats
    'avocado', 'olive oil',
    // Prebiotic Supplements
    'prebiotic supplements',
    // Herbs and Spices
    'turmeric', 'ginger', 'garlic', 'cinnamon', 'rosemary', 'thyme'
];

let totalDiversityScore = 0;

// Function to populate items div for the current week
const populateItemsDiv = async () => {
    const db = await initDatabase(currentDay); // Initialize database for current week
    const allItems = await db.items.reverse().toArray();

    // Filter items that are eaten and belong to the diverse food list
    const checkedItems = allItems.filter(item => item.isEaten && diverseFoodList.includes(item.name));

    // Initialize total diversity score for the current week if not already initialized
    if (totalDiversityScores[currentDay] === undefined) {
        totalDiversityScores[currentDay] = checkedItems.length;
    } else {
        // Recalculate total diversity score if it's already initialized
        totalDiversityScores[currentDay] = checkedItems.length;
        await updateTotalDiversityScore(); // Update the total diversity score
    }

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

    // Check if diverseFoodList is available in local storage

    const storedDiverseFoodList = localStorage.getItem('diverseFoodList');
    if (storedDiverseFoodList) {
        // Parse the stored diverseFoodList from local storage
        const storedList = JSON.parse(storedDiverseFoodList);
        
        // Concatenate each item from the stored list to DropdownList
        const uniqueItemsSet = new Set([...storedList, ...diverseFoodList]);
        diverseFoodList = Array.from(uniqueItemsSet); // Update diverseFoodList with unique items

        // Sort the diverseFoodList alphabetically
        diverseFoodList.sort();

        // Create the DropdownList HTML string
        const DropdownList = diverseFoodList.map(item => `
            <option value="${item}">${item}</option>
        `).join("");

        // Display diverse food list with options to add/remove items
        diverseList.innerHTML += `
            <div id="diverseFoodList">
                <p><strong>Diverse Food List:</strong></p>
                <select id="diverseFoodDropdown" onchange="selectDiverseFood()">
                    <option value="">Select an item...</option>
                    ${DropdownList}
                </select>
                <button onclick="addItemToList()">Add New Item</button>
                <button onclick="removeItemFromList()">Remove Selected Item</button>
            </div>
        `;
    }
};

// Load total diversity scores from local storage on window load
window.onload = async () => {
    const selectedDay = localStorage.getItem('selectedDay');
    if (selectedDay) {
        currentDay = selectedDay;
        document.getElementById('daySelector').value = currentDay;
    }
    await populateItemsDiv(); // Populate items for the default week on window load
};


// Function to toggle the visibility of the item div
const toggleDiverseDiv = () => {
    const diverseDiv = document.getElementById('diverseList');
    const toggleButton = document.getElementById('diverseFoodButton');
    if (diverseDiv.style.display === 'none') {
        diverseDiv.style.display = 'block';
        toggleButton.style.top = '15.3rem';
    }
        else {
        diverseDiv.style.display = 'none';
        toggleButton.style.top = '3rem';
    }
};


itemForm.onsubmit = async (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput").value.toLowerCase(); // Convert to lowercase
    const quantityInput = document.getElementById("quantityInput");
    const quantity = Number(quantityInput.value);

    // Check if the quantity is a valid number
    if (isNaN(quantity)) {
        alert("Quantity must be a number.");
        return;
    }

    const db = await initDatabase(currentDay); // Initialize database for current week
    await db.items.add({ name, quantity, isEaten: false });
    itemForm.reset();
    await populateItemsDiv(); // Populate items for the current week after adding item
};

// Modify toggle item status function to compare item names in a case-insensitive manner
const toggleItemStatus = async (event, id) => {
    const db = await initDatabase(currentDay); // Initialize database for current week
    const item = await db.items.get(id);
    if (!item) return;

    const itemNameLowerCase = item.name.toLowerCase(); // Convert item name to lowercase

    // Update the isEaten status
    await db.items.update(id, { isEaten: !!event.target.checked });

    // Update the total diversity score if the item is in diverse food list
    if (diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase)) {
        const delta = event.target.checked ? 1 : -1;
        totalDiversityScores[currentDay] += delta;
        updateTotalDiversityScoreDisplay();
    }

    await populateItemsDiv();
};



// Modify remove item function to work with the current week's database
const removeItem = async (id) => {
    const db = await initDatabase(currentDay); // Initialize database for current week
    const item = await db.items.get(id);
    if (!item) return;

    // Update the total diversity score if the item is in diverse food list
    const itemNameLowerCase = item.name.toLowerCase(); // Convert item name to lowercase
    if (diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase) && item.isEaten) {
        totalDiversityScores[currentDay]--;
    }

    await db.items.delete(id);
    await populateItemsDiv();
}

let currentDay = 'Today'; // Default to Today

// Function to change the current week
const changeDay = async () => {
    currentDay = document.getElementById('daySelector').value;
    localStorage.setItem('selectedDay', currentDay); // Save selected day in local storage
    await populateItemsDiv(); // Populate items for the selected week
    updateTotalDiversityScoreDisplay(); // Update total diversity score display for the selected week
    
}



// Function to recalculate and update total diversity score for the current week
const updateTotalDiversityScore = async () => {
    const db = await initDatabase(currentDay); // Initialize database for current week
    const allItems = await db.items.toArray();

    // Filter items that are eaten and belong to the diverse food list
    const eatenDiverseItems = allItems.filter(item => item.isEaten && diverseFoodList.includes(item.name));

    // Count the total number of eaten diverse items
    const currentTotalDiversityScore = eatenDiverseItems.length;

    // Update total diversity score for the current week
    totalDiversityScores[currentDay] = currentTotalDiversityScore;

    // Update total diversity score display for the current week
    updateTotalDiversityScoreDisplay();

    // Update local storage with the updated total diversity scores
    localStorage.setItem('totalDiversityScores', JSON.stringify(totalDiversityScores));
};

// Function to update the total diversity score display for the current week
const updateTotalDiversityScoreDisplay = () => {
    const totalDiversityScoreDiv = document.getElementById('totalDiversityScoreDiv');
    const currentTotalDiversityScore = totalDiversityScores[currentDay];
    totalDiversityScoreDiv.innerText = 'Total Diversity Score: ' + currentTotalDiversityScore;
};

// Function to add a new item to the diverse food list
const addItemToList = () => {
    const newItemName = prompt("Enter the name of the new diverse food item:");
    if (newItemName) {
        const trimmedItemName = newItemName.trim().toLowerCase(); // Convert to lowercase
        if (!diverseFoodList.some(item => item.toLowerCase() === trimmedItemName)) { // Check for existing item in a case-insensitive manner
            diverseFoodList.push(newItemName); // Push the original name
            // Save the updated diverse food list to local storage
            localStorage.setItem('diverseFoodList', JSON.stringify(diverseFoodList));
            
            // Refresh the diverse food dropdown to include the newly added item
            const dropdown = document.getElementById('diverseFoodDropdown');
            const option = document.createElement('option');
            option.value = newItemName;
            option.textContent = newItemName;
            dropdown.appendChild(option);
        } else {
            alert("Item already exists in the list.");
        }
    }
};


// Function to remove an item from the diverse food list
const removeItemFromList = async () => {
    const dropdown = document.getElementById('diverseFoodDropdown');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    const itemName = selectedOption.value;

    const index = diverseFoodList.findIndex(item => item.toLowerCase() === itemName.toLowerCase()); // Find index in a case-insensitive manner
    if (index !== -1) {
        // Remove the item from the diverse food list array
        diverseFoodList.splice(index, 1);

        // Remove the item from the dropdown list
        dropdown.remove(dropdown.selectedIndex);

        // Save the updated diverse food list to local storage
        localStorage.setItem('diverseFoodList', JSON.stringify(diverseFoodList));
        
        console.log(`Item '${itemName}' removed from diverse food list and local storage.`);
    } else {
        console.error(`Item '${itemName}' not found in diverse food list.`);
    }
};

// Function to load diverse food list from local storage upon page load
const loadDiverseFoodList = () => {
    let storedDiverseFoodList = localStorage.getItem('diverseFoodList');
    if (!storedDiverseFoodList) {
        // Set default diverse food list
        storedDiverseFoodList = JSON.stringify(diverseFoodList);
        localStorage.setItem('diverseFoodList', storedDiverseFoodList);
    } else {
        // Parse and set the diverse food list from local storage
        diverseFoodList = JSON.parse(storedDiverseFoodList);
    }
    
    // Populate the dropdown with stored diverse food items
    const dropdown = document.getElementById('diverseFoodDropdown');
    dropdown.innerHTML = ""; // Clear existing options before populating
    diverseFoodList.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
};
document.addEventListener('DOMContentLoaded', () => {
    // All your JavaScript code goes here
    
    // Define and call the loadDiverseFoodList function
    const loadDiverseFoodList = () => {
        let storedDiverseFoodList = localStorage.getItem('diverseFoodList');
        if (!storedDiverseFoodList) {
            // Set default diverse food list
            storedDiverseFoodList = JSON.stringify(diverseFoodList);
            localStorage.setItem('diverseFoodList', storedDiverseFoodList);
        } else {
            // Parse and set the diverse food list from local storage
            diverseFoodList = JSON.parse(storedDiverseFoodList);
        }
        
        // Populate the dropdown with stored diverse food items
        const dropdown = document.getElementById('diverseFoodDropdown');
        dropdown.innerHTML = ""; // Clear existing options before populating
        diverseFoodList.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
        });
    };
    
    loadDiverseFoodList(); // Call the loadDiverseFoodList function after the DOM is loaded
});
