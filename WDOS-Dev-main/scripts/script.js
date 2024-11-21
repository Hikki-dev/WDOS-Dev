document.addEventListener('DOMContentLoaded', function () {
    const cart = [];
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let medicines = {};

    // Fetch the medicines data from the JSON file
    fetch('/json/medicines.json')
        .then(response => response.json())
        .then(data => {
            medicines = data;
            // Generate all medicine sections
            for (const category in medicines) {
                generateMedicineSection(category);
            }
        })
        .catch(error => console.error('Error loading medicines data:', error));

    function generateMedicineSection(category) {
        const section = document.getElementById(category.toLowerCase());
        const categoryItems = medicines[category];

        categoryItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'medication-item';
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                    <button class="add-to-cart" data-name="${item.name}">Add to Cart</button>
                    <button class="add-to-favorites" data-name="${item.name}">❤️</button>
                    <div class="quantity-control">
                        <button class="decrease-quantity" data-name="${item.name}">-</button>
                        <span id="${item.name}-quantity">1</span>
                        <button class="increase-quantity" data-name="${item.name}">+</button>
                    </div>
                </div>
            `;
            section.appendChild(itemDiv);
        });
    }
});