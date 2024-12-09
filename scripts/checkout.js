document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();

    // Handle payment method toggle
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const cardInfo = document.getElementById('card-info');

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Card') {
                cardInfo.style.display = 'block';
            } else {
                cardInfo.style.display = 'none';
            }
        });
    });

    // Handle form submission
    document.getElementById('delivery-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Retrieve form data
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // Payment details (if card payment is selected)
        let cardDetails = null;
        if (paymentMethod === 'Card') {
            cardDetails = {
                cardNumber: document.getElementById('card-number').value,
                expiryDate: document.getElementById('expiry-date').value,
                cvv: document.getElementById('cvv').value
            };
        }

        // Submit the order details (you can replace this with an actual order submission process)
        console.log({
            name, address, phone, paymentMethod, cardDetails
        });

        // After submission, show a confirmation message or redirect
        alert('Your order has been placed!');
        window.location.href = 'order-confirmation.html';
    });
});

function loadOrderSummary() {
    // Retrieve cart data from localStorage
    const cartData = JSON.parse(localStorage.getItem('cartData'));

    if (!cartData) {
        console.log("No cart data found");
        return;
    }

    const orderSummaryBody = document.getElementById('order-summary-body');
    let total = 0;

    // Populate the order summary table with cart data
    cartData.forEach(item => {
        const itemTotal = item.price * item.quantity;

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>$${itemTotal.toFixed(2)}</td>
    `;
        orderSummaryBody.appendChild(row);

        total += itemTotal;
    });

    // Update total price in the footer
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
    const cartTableBody = document.getElementById('cart-table-body');
    const totalPriceElement = document.getElementById('total-price');

    if (cartData.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
    } else {
        cartData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-from-cart">❌</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        // Calculate and update total price
        const totalPrice = cartData.reduce((total, item) => total + (item.price * item.quantity), 0);
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
});


// Set today's date as minimum for the date input field
document.getElementById('date').setAttribute('min', new Date().toISOString().split('T')[0]);

// Function to restrict input to only numbers
function restrictNonNumericInput(event) {
    const input = event.target;
    const key = event.key;

    // Allow only numeric input (0-9) and prevent others
    if (!/^\d$/.test(key)) {
        event.preventDefault();
        alert('Only numbers are allowed!');
    }
}

// Attach the restriction to phone and card number fields
document.getElementById('phone').addEventListener('keydown', restrictNonNumericInput);
document.getElementById('card-number').addEventListener('keydown', restrictNonNumericInput);
document.getElementById('cvv').addEventListener('keydown', restrictNonNumericInput);

// Form validation on submit
document.getElementById('delivery-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form submission to validate first

    let errors = [];

    // Check if phone number is valid (only numbers, 10 digits)
    let phone = document.getElementById('phone').value;
    if (!/^\d{10}$/.test(phone)) {
        errors.push('Please enter a valid 10-digit phone number.');
        document.getElementById('phone-error').style.display = 'block';
    } else {
        document.getElementById('phone-error').style.display = 'none';
    }

    // Check if date is valid (should not be in the past)
    let date = document.getElementById('date').value;
    if (new Date(date) < new Date()) {
        errors.push('Date must be today or in the future.');
        document.getElementById('date-error').style.display = 'block';
    } else {
        document.getElementById('date-error').style.display = 'none';
    }

    // Check if card payment details are valid (if card is selected)
    if (document.getElementById('card').checked) {
        let cardNumber = document.getElementById('card-number').value;
        let expiryDate = document.getElementById('expiry-date').value;
        let cvv = document.getElementById('cvv').value;

        if (!/^\d{16}$/.test(cardNumber)) {
            errors.push('Card number must be 16 digits.');
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            errors.push('Expiry date format must be MM/YY.');
        }

        if (!/^\d{3}$/.test(cvv)) {
            errors.push('CVV must be 3 digits.');
        }
    }

    // If there are errors, display an alert
    if (errors.length > 0) {
        alert(errors.join('\n'));
    } else {
        // Proceed with form submission
        alert('Form is valid. Proceeding to checkout...');
        // Optionally submit the form here
        // this.submit();
    }
});

// Function to show card info when 'Card' payment is selected
document.getElementById('card').addEventListener('change', function() {
    document.getElementById('card-info').style.display = 'block';
});

// Function to hide card info when 'COD' is selected
document.getElementById('cod').addEventListener('change', function() {
    document.getElementById('card-info').style.display = 'none';
});

// Form validation when the form is submitted
document.getElementById('delivery-form').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent form submission to validate first

    let errors = [];

    // Validate phone number (numeric, 10 digits)
    let phone = document.getElementById('phone').value;
    if (!/^\d{10}$/.test(phone)) {
        errors.push('Please enter a valid 10-digit phone number.');
    }

    // Validate date (must not be in the past)
    let date = document.getElementById('date').value;
    if (new Date(date) < new Date()) {
        errors.push('Date must be today or in the future.');
    }

    // Card details validation if the card payment method is selected
    if (document.getElementById('card').checked) {
        let cardNumber = document.getElementById('card-number').value;
        let expiryDate = document.getElementById('expiry-date').value;
        let cvv = document.getElementById('cvv').value;

        // Card Number validation (should be exactly 16 digits and pass Luhn's Algorithm)
        if (!/^\d{16}$/.test(cardNumber)) {
            errors.push('Card number must be exactly 16 digits.');
        } else if (!isValidCardNumber(cardNumber)) {
            errors.push('Invalid card number (Luhn check failed).');
        }

        // Expiry Date validation (format MM/YY and not expired)
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            errors.push('Expiry date format must be MM/YY.');
        } else {
            let currentYear = new Date().getFullYear();
            let currentMonth = new Date().getMonth() + 1;  // Months are zero-based
            let [expMonth, expYear] = expiryDate.split('/');
            if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
                errors.push('Card expiry date cannot be in the past.');
            }
        }

        // CVV validation (must be exactly 3 digits)
        if (!/^\d{3}$/.test(cvv)) {
            errors.push('CVV must be exactly 3 digits.');
        }
    }

    // If there are errors, alert the user and prevent submission
    if (errors.length > 0) {
        alert(errors.join('\n'));
    } else {
        // Proceed with form submission
        alert('Form is valid. Proceeding to checkout...');
        // Optionally submit the form here
        // this.submit();
    }
});

// Luhn Algorithm to check if a card number is valid
function isValidCardNumber(cardNumber) {
    let sum = 0;
    let shouldDouble = false;

    // Loop through the card number from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

document.getElementById('expiry-date').addEventListener('input', function (e) {
    let expiryError = document.getElementById('expiry-error');

    // Allow only numeric characters (replace non-numeric with empty string)
    this.value = this.value.replace(/\D/g, '');

    // If any non-numeric character is entered, show error message
    if (/\D/.test(this.value)) {
        expiryError.style.display = 'inline';
    } else {
        expiryError.style.display = 'none';
    }

    // Format the input as MM/YY
    if (this.value.length > 2) {
        this.value = this.value.substring(0, 2) + '/' + this.value.substring(2, 4);
    }
});

document.getElementById('delivery-form').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent form submission to validate first

    let errors = [];
    let expiryDate = document.getElementById('expiry-date').value;
    let expiryError = document.getElementById('expiry-error');

    // Validate card expiry date
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errors.push('Expiry date must be in MM/YY format.');
    } else {
        // Extract MM and YY from the input
        let [expMonth, expYear] = expiryDate.split('/');

        // Add "20" prefix to the year to handle two-digit years (e.g., "23" => "2023")
        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth() + 1;  // Months are zero-based (0-11)
        let expiryYear = parseInt('20' + expYear);
        let expiryMonth = parseInt(expMonth);

        // Check if the card has expired
        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            errors.push('Card expiry date cannot be in the past.');
        }
    }

    // If there are errors, alert the user and prevent submission
    if (errors.length > 0) {
        alert(errors.join('\n'));
    } else {
        // Proceed with form submission
        alert('Form is valid. Proceeding to checkout...');
        // Optionally submit the form here
        // this.submit();
    }
});