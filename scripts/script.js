document.addEventListener('DOMContentLoaded', function () {
    let medicines = {}; // Medicines data from JSON
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const shoppingCart = []; // Shopping cart array

    // Helper function: Save favorites to localStorage
    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    document.getElementById('applyFavoritesButton').addEventListener('click', () => {
        // Fetch favorites from localStorage
        const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        console.log('Favorites to apply:', storedFavorites);

        if (storedFavorites.length === 0) {
            alert('No favorites to apply to the shopping cart.');
            return;
        }

        storedFavorites.forEach(favorite => {
            const cartItem = shoppingCart.find(cartMed => cartMed.name === favorite.name);

            if (cartItem) {
                // If item is already in the cart, update the quantity by adding the favorite quantity
                cartItem.quantity += favorite.quantity; // Add the quantity from favorites to the cart
            } else {
                // If item is not in the cart, add it with the favorite quantity
                shoppingCart.push({
                    name: favorite.name,
                    price: favorite.price,
                    quantity: favorite.quantity, // Use the favorite quantity
                });
            }
        });

        console.log('Updated shopping cart:', shoppingCart);
        renderCart(); // Re-render the shopping cart
        alert('Favorites have been added to your shopping cart!');

        // Display favorites in a modal or section for user selection
        const favoritesContainer = document.getElementById('favorites-container'); // A container in your HTML
        favoritesContainer.innerHTML = ''; // Clear any existing content

        storedFavorites.forEach((favorite, index) => {
            const favoriteDiv = document.createElement('div');
            favoriteDiv.classList.add('favorite-item');
            favoriteDiv.innerHTML = `
        <p>${favorite.name} - $${favorite.price} - Quantity: ${favorite.quantity}</p>
        <button class="remove-favorite" data-index="${index}">Remove</button>
    `;
            favoritesContainer.appendChild(favoriteDiv);
        });

        // Add event listeners for buttons inside the favorites container
        favoritesContainer.addEventListener('click', (event) => {
            const target = event.target;
            const index = parseInt(target.dataset.index, 10);

            if (target.classList.contains('add-to-cart-from-favorites')) {
                const favorite = storedFavorites[index];
                const cartItem = shoppingCart.find(cartMed => cartMed.name === favorite.name);

                if (target.classList.contains('remove-favorite')) {
                    // Remove the favorite from the favorites list
                    removeFromFavorites(index);

                    // removes the item div from the UI
                    target.parentElement.remove();
                }

                if (cartItem) {
                    // If already in the cart, increase the quantity by the favorite quantity
                    cartItem.quantity += favorite.quantity;
                } else {
                    // If item is not in the cart, add it with the favorite quantity
                    shoppingCart.push({
                        name: favorite.name,
                        price: favorite.price,
                        quantity: favorite.quantity,
                    });
                }

                renderCart(); // Update the cart display
                alert(`${favorite.name} added to the cart!`);
            }

            if (target.classList.contains('remove-favorite')) {
                // Remove the favorite from the stored list and update localStorage
                storedFavorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(storedFavorites));
                alert('Favorite removed!');
                target.parentElement.remove(); // Remove the favorite's div from the UI
            }
        });
    });

    // Fetch medicines data
    fetch('json/medicines.json')
        .then(response => response.json())
        .then(data => {
            medicines = data;
            for (const category in medicines) {
                generateMedicineSection(category);
            }
        })
        .catch(error => console.error('Error loading medicines data:', error));

    // Generate medicines for each category
    function generateMedicineSection(category) {
        const section = document.getElementById(category.toLowerCase());
        if (!section) return;

        const categoryItems = medicines[category];
        categoryItems.forEach((item, index) => {
            item.quantity = 0; // Initialize quantity
            const itemDiv = document.createElement('div');
            itemDiv.className = 'medication-item';
            itemDiv.dataset.name = item.name.toLowerCase();
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="med-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price}</p>
                    <div class="quantity-controls">
                        <button class="decrease-quantity" data-index="${index}" data-category="${category}">-</button>
                        <input type="number" class="quantity-input" data-index="${index}" data-category="${category}" value="${item.quantity}" min="1" />
                        <button class="increase-quantity" data-index="${index}" data-category="${category}">+</button>
                    </div>
                    <button class="add-to-cart" data-name="${item.name}" data-category="${category}">Add to Cart</button>
                </div>
                <p class="message" style="display: none;"></p> <!-- Hidden message element -->
            `;
            section.appendChild(itemDiv);
        });

        document.body.addEventListener('input', function (event) {
            const target = event.target;

            // Handle quantity input changes
            if (target.classList.contains('quantity-input')) {
                const category = target.dataset.category;
                const index = parseInt(target.dataset.index, 10);
                const inputValue = parseInt(target.value, 10);

                // Ensure the input value is a valid number
                if (!isNaN(inputValue) && inputValue > 0) {
                    medicines[category][index].quantity = inputValue;
                } else {
                    medicines[category][index].quantity = 0; // Default to 0 if invalid
                }
            }
        });

// Update `renderCart` to reflect manually entered quantities
        function renderCart() {
            const cartTableBody = document.getElementById('cart-table-body');
            cartTableBody.innerHTML = ''; // Clear current cart UI

            if (shoppingCart.length === 0) {
                cartTableBody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
            } else {
                shoppingCart.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>
                    <button class="decrease-cart-quantity" data-index="${index}">-</button>
                    <input type="number" class="cart-quantity-input" data-index="${index}" value="${item.quantity}" min="1" />
                    <button class="increase-cart-quantity" data-index="${index}">+</button>
                </td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-from-cart" data-index="${index}">❌</button></td>
            `;
                    cartTableBody.appendChild(row);
                });
            }

            updateTotal(); // Update the total price after rendering the cart
        }

// Add event listener to handle direct quantity changes in the cart
        document.body.addEventListener('input', function (event) {
            const target = event.target;

            if (target.classList.contains('cart-quantity-input')) {
                const index = parseInt(target.dataset.index, 10);
                const inputValue = parseInt(target.value, 10);

                if (!isNaN(inputValue) && inputValue > 0) {
                    shoppingCart[index].quantity = inputValue; // Update cart quantity
                } else {
                    shoppingCart[index].quantity = 1; // Default to 1 if invalid
                    target.value = 1; // Reset the input value to 1
                }

                renderCart(); // Re-render the cart to reflect the changes
            }
        });
    }
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(event) {
            const query = event.target.value.toLowerCase();
            const allItems = document.querySelectorAll('.medication-item');

            allItems.forEach(item => {
                const itemName = item.dataset.name.toLowerCase();
                if (itemName.includes(query)) {
                    item.style.display = 'block'; // Show the item
                } else {
                    item.style.display = 'none'; // Hide the item if it doesn't match the search
                }
            });
        });
    } else {
        console.error('Search input element not found');
    }


    // Render the shopping cart
    function renderCart() {
        const cartTableBody = document.getElementById('cart-table-body');
        cartTableBody.innerHTML = ''; // Clear current cart UI

        if (shoppingCart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
        } else {
            shoppingCart.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>$${item.price}</td>
                    <td>
                        <button class="decrease-cart-quantity" data-index="${index}">-</button>
                        ${item.quantity}
                        <button class="increase-cart-quantity" data-index="${index}">+</button>
                    </td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    <td><button class="remove-from-cart" data-index="${index}">❌</button></td>
                `;
                cartTableBody.appendChild(row);
            });
        }

        updateTotal(); // Update the total price after rendering the cart
    }

    // Update the total price dynamically
    function updateTotal() {
        const totalPrice = shoppingCart.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.getElementById('total-price').textContent = `$${totalPrice.toFixed(2)}`;
    }

    // Add item to cart
    function addToCart(name, category, messageElement) {
        const item = medicines[category].find(med => med.name === name);
        const cartItem = shoppingCart.find(cartMed => cartMed.name === name);

        if (item.quantity <= 0) {
            showMessage(messageElement, 'Please set a quantity greater than 0.');
            return;
        }

        // Add item to the cart or increase its quantity if it already exists
        if (cartItem) {
            cartItem.quantity += item.quantity; // Increase quantity in cart
        } else {
            shoppingCart.push({ name: item.name, quantity: item.quantity, price: item.price }); // Add new item to cart
        }

        // Reset the quantity of the item in the medicines list
        item.quantity = 0;

        // Update the displayed quantity for that item in the UI (set it to 0)
        const medicineItemDiv = [...document.querySelectorAll('.medication-item')].find(
            div => div.dataset.name === name.toLowerCase()
        );
        if (medicineItemDiv) {
            const quantityInput = medicineItemDiv.querySelector('.quantity-input');
            if (quantityInput) {
                quantityInput.value = 0; // Set the quantity input to 0
            }
        }

        renderCart(); // Re-render the cart
        showMessage(messageElement, `${item.name} has been added to the cart.`);
    }

    // Show message below the medicine card
    function showMessage(element, text) {
        element.textContent = text;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000); // Hide message after 5 seconds
    }

    // Event listeners for cart actions
    document.body.addEventListener('click', function (event) {
        const target = event.target;

        // Add item to favorites
        function addToFavorites(item) {
            if (!favorites.some(fav => fav.name === item.name)) {
                favorites.push(item);  // Add to the favorites list
                saveFavorites();       // Save the updated list to localStorage
                renderFavorites();     // Update the favorites UI
            } else {
                alert(`${item.name} is already in your favorites.`);
            }
        }

        // Add to favorites
        if (target.classList.contains('add-to-favorites')) {
            const category = target.dataset.category;
            const name = target.dataset.name;
            const selectedItem = medicines[category].find(item => item.name === name);

            if (selectedItem) {
                addToFavorites(selectedItem);
            }
        }

        // Increase quantity in medicines section
        if (target.classList.contains('increase-quantity')) {
            const category = target.dataset.category;
            const index = parseInt(target.dataset.index, 10);
            medicines[category][index].quantity++;
            target.previousElementSibling.value = medicines[category][index].quantity;
        }

        // Decrease quantity in medicines section
        if (target.classList.contains('decrease-quantity')) {
            const category = target.dataset.category;
            const index = parseInt(target.dataset.index, 10);
            if (medicines[category][index].quantity > 0) {
                medicines[category][index].quantity--;
                target.nextElementSibling.value = medicines[category][index].quantity;
            }
        }

        // Add to cart
        if (target.classList.contains('add-to-cart')) {
            const name = target.dataset.name;
            const category = target.dataset.category;
            const messageElement = target.parentElement.nextElementSibling; // Get message element
            addToCart(name, category, messageElement);
        }

        // Remove item from cart
        if (target.classList.contains('remove-from-cart')) {
            const index = parseInt(target.dataset.index, 10);
            shoppingCart.splice(index, 1); // Remove item
            renderCart();
        }

        // Increase quantity in cart
        if (target.classList.contains('increase-cart-quantity')) {
            const index = parseInt(target.dataset.index, 10);
            shoppingCart[index].quantity++;
            renderCart();
        }

        // Decrease quantity in cart
        if (target.classList.contains('decrease-cart-quantity')) {
            const index = parseInt(target.dataset.index, 10);
            if (shoppingCart[index].quantity > 1) {
                shoppingCart[index].quantity--;
            } else {
                shoppingCart.splice(index, 1); // Remove item if quantity is 0
            }
            renderCart();
        }
        // Clear the shopping cart
        if (target.id === 'clear-cart') {
            shoppingCart.length = 0; // Clear the cart array
            renderCart(); // Re-render the cart to show empty
        }
    });

    // Event listener for "Buy Now" button
    document.getElementById('buy-now').addEventListener('click', function () {
        if (shoppingCart.length === 0) {
            showMessage(document.getElementById('cart-message'), 'Your cart is empty! Add items before checking out.');
            return;
        }

        // Save cart to localStorage
        localStorage.setItem('cartData', JSON.stringify(shoppingCart));

        // Redirect to check out page
        const queryParams = shoppingCart.map(item => {
            return `product[]=${encodeURIComponent(item.name)}&price[]=${encodeURIComponent(item.price)}&quantity[]=${encodeURIComponent(item.quantity)}`;
        }).join('&');
        window.location.href = `checkout.html?${queryParams}`;
    });

    function renderFavorites() {
        const favoritesContainer = document.getElementById('favoritesContainer');
        favoritesContainer.innerHTML = ''; // Clear existing favorites

        // Check if favorites exist and populate the container
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = '<p>No favorites saved yet.</p>';
        } else {
            favorites.forEach((favorite, index) => {
                const favoriteDiv = document.createElement('div');
                favoriteDiv.classList.add('favorite-item');
                favoriteDiv.innerHTML = `
                <input type="checkbox" class="select-favorite" data-index="${index}" />
                <p>${favorite.name} - Quantity: ${favorite.quantity}</p>
                <button class="remove-favorite" data-index="${index}">Remove Item</button>
            `;
                favoritesContainer.appendChild(favoriteDiv);
            });
        }

        // Add event listeners for actions inside the favorites container
        favoritesContainer.addEventListener('click', (event) => {
            const target = event.target;
            const index = parseInt(target.dataset.index, 10);

            if (target.classList.contains('remove-favorite')) {
                // Remove the entire favorite item
                favorites.splice(index, 1);
                saveFavorites(); // Save updated favorites to localStorage
                renderFavorites(); // Re-render favorites
                alert('Item removed from favorites!');
            }

            // Add event listener for "Remove Selected Items" button
            document.getElementById('removeSelectedButton').addEventListener('click', () => {
                // Get all selected checkboxes
                const selectedCheckboxes = document.querySelectorAll('.select-favorite:checked');

                if (selectedCheckboxes.length > 0) {
                    // Remove the items corresponding to the selected checkboxes
                    selectedCheckboxes.forEach((checkbox) => {
                        const index = parseInt(checkbox.dataset.index, 10);
                        favorites.splice(index, 1); // Remove the item from favorites array
                    });
                    saveFavorites(); // Update localStorage
                    renderFavorites(); // Re-render favorites
                    alert('Selected items removed from favorites!');
                } else {
                    alert('Please select at least one item to remove.');
                }
            });

            function saveFavorites() {
                localStorage.setItem('favorites', JSON.stringify(favorites));
            }
        });
    }

    document.getElementById('saveFavoritesButton').addEventListener('click', () => {
        if (shoppingCart.length === 0) {
            alert('Your cart is empty. Add items before saving as favorites!');
            return;
        }

        shoppingCart.forEach(item => {
            addToFavorites(item);
        });

        alert('Cart items saved as favorites!');
        renderFavorites(); // Re-render favorites
    });

    function addToFavorites(item) {
        // Check if the item already exists in favorites
        const existingItem = favorites.find(fav => fav.name === item.name);

        if (existingItem) {
            // If the item already exists in favorites, update the quantity
            existingItem.quantity += item.quantity; // Add the cart quantity to the favorite
        } else {
            // If it's a new item, add it to favorites
            favorites.push({...item}); // Spread to avoid mutation issues
        }

        saveFavorites(); // Save updated favorites to localStorage
    }

    // Remove from favorites
    function removeFromFavorites(index) {
        // Remove the item at the specified index
        favorites.splice(index, 1);

        // Save the updated favorites list to localStorage
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // Optionally, re-render the favorites to reflect the changes
        renderFavorites();
    }
});
