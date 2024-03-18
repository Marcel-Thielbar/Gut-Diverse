const db = new Dexie('GutDiverse');
db.version(1).stores({
    items: '++id, name, isEaten, quantity'
});

const itemForm = document.getElementById('itemForm');
const itemsDiv = document.getElementById('itemsDiv');
const totalDiversityScoreDiv = document.getElementById('totalDiversityScoreDiv');

const populateItemsDiv = async () => {
    const allItems = await db.items.reverse().toArray();

    const checkedItems = allItems.filter(item => item.isEaten);

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
    totalDiversityScoreDiv.innerText = 'Total Diversity Score: ' + checkedItems.length;
}

window.onload = async () => {
    await populateItemsDiv();
};

itemForm.onsubmit = async (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput").value;
    const quantity = document.getElementById("quantityInput").value;

    await db.items.add({ name, quantity, isEaten: false });

    itemForm.reset();
    await populateItemsDiv();
};

const toggleItemStatus = async (event, id) => {
    await db.items.update(id, { isEaten: !!event.target.checked})
    await populateItemsDiv();
}

const removeItem = async (id) =>{
    await db.items.delete(id);
    await populateItemsDiv();
};

