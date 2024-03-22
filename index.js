const db = new Dexie('GutDiverse');
db.version(1).stores({
    items: '++id, name, isEaten, quantity'
});

const itemForm = document.getElementById('itemForm');
const itemsDiv = document.getElementById('itemsDiv');
const totalDiversityScoreDiv = document.getElementById('totalDiversityScoreDiv');

// Array of diverse food items
const diverseFoodList = [
    // Fermented Foods
    'Yogurt',
    'Kefir',
    'Kimchi',
    'Sauerkraut',
    'Miso',
    'Tempeh',
    'Kombucha',
    
    // Fiber-Rich Foods
    'Whole grains',
    'Oats',
    'Barley',
    'Quinoa',
    'Brown rice',
    'Legumes',
    'Beans',
    'Lentils',
    'Chickpeas',
    'Fruits',
    'Berries',
    'Apples',
    'Bananas',
    'Vegetables',
    'Broccoli',
    'Spinach',
    'Carrots',
    'Nuts and seeds',
    'Almonds',
    'Chia seeds',
    'Flaxseeds',
    
    // Polyphenol-Rich Foods
    'Berries',
    'Blueberries',
    'Strawberries',
    'Raspberries',
    'Apples',
    'Red grapes',
    'Green tea',
    'Dark chocolate',
    'Flaxseeds',
    'Almonds',
    
    // Omega-3 Fatty Acid-Rich Foods
    'Fatty fish',
    'Salmon',
    'Mackerel',
    'Sardines',
    'Flaxseeds',
    'Chia seeds',
    'Walnuts',
    
    // Protein Sources
    'Legumes',
    'Beans',
    'Lentils',
    'Chickpeas',
    'Nuts and seeds',
    'Tofu',
    'Tempeh',
    
    // Polyunsaturated Fats
    'Avocado',
    'Olive oil',
    'Nuts and seeds',
    'Fatty fish',
    
    // Prebiotic Supplements
    'Prebiotic supplements',
    
    // Herbs and Spices
    'Turmeric',
    'Ginger',
    'Garlic',
    'Cinnamon',
    'Rosemary',
    'Thyme'
];

let totalDiversityScore = 0;

const populateItemsDiv = async () => {
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

    const arrayOfQuantities = allItems.map(item => Number(item.quantity));
    const totalQuantity = arrayOfQuantities.reduce((a, b) => a + b, 0);

    const totalItems = allItems.length;
    
    itemsDiv.innerHTML += `<p>Total Items on list: ${totalItems}</p>`;
    totalDiversityScoreDiv.innerText = 'Total Diversity Score: ' + totalDiversityScore;
}

window.onload = async () => {
    await populateItemsDiv();
};

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

    await db.items.add({ name, quantity, isEaten: false });
    itemForm.reset();
    await populateItemsDiv();
};



const toggleItemStatus = async (event, id) => {
    const item = await db.items.get(id);
    if (!item) return;

    // Update the isEaten status
    await db.items.update(id, { isEaten: !!event.target.checked });

    // Update the total diversity score if the item is in diverse food list
const itemNameLowerCase = item.name.toLowerCase(); // Convert item name to lowercase
if (event.target.checked && diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase)) {
    totalDiversityScore++;
} else if (!event.target.checked && diverseFoodList.map(food => food.toLowerCase()).includes(itemNameLowerCase)) {
    totalDiversityScore--;
}


    await populateItemsDiv();
}

const removeItem = async (id) =>{
    const item = await db.items.get(id);
    if (!item) return;

    // Decrement the diversity score if the item is in diverse food list and checked
    if (item.isEaten && diverseFoodList.includes(item.name)) {
        totalDiversityScore--;
    }

    await db.items.delete(id);
    await populateItemsDiv();
};
