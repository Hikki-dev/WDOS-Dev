document.addEventListener("DOMContentLoaded", function () {
    // Load order summary
    loadOrderSummary();

    // Handle payment method toggle
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const cardInfo = document.getElementById('card-info');
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            cardInfo.style.display = this.value === 'Card' ? 'block' : 'none';
        });
    });

    // Set minimum delivery date to today
    document.getElementById('date').setAttribute('min', new Date().toISOString().split('T')[0]);

    // Handle form submission
    document.getElementById('delivery-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent default submission

        let errors = [];
        const phone = document.getElementById('phone');
        const date = document.getElementById('date');
        const cardNumber = document.getElementById('card-number');
        const expiryDate = document.getElementById('expiry-date');
        const cvv = document.getElementById('cvv');

        // Validate phone
        if (!/^\d{10}$/.test(phone.value)) {
            errors.push("Phone number must be 10 digits.");
        }

        // Validate date
        if (new Date(date.value) < new Date()) {
            errors.push("Delivery date must be today or later.");
        }

        // Validate card details (if Card is selected)
        if (document.getElementById('card').checked) {
            if (!/^\d{16}$/.test(cardNumber.value)) {
                errors.push("Card number must be 16 digits.");
            }
            if (!/^\d{2}\/\d{2}$/.test(expiryDate.value)) {
                errors.push("Expiry date must be in MM/YY format.");
            } else {
                const [expMonth, expYear] = expiryDate.value.split('/');
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1;
                const expiryYear = parseInt("20" + expYear, 10);
                const expiryMonth = parseInt(expMonth, 10);
                if (
                    expiryYear < currentYear ||
                    (expiryYear === currentYear && expiryMonth < currentMonth)
                ) {
                    errors.push("Card expiry date cannot be in the past.");
                }
            }
            if (!/^\d{3}$/.test(cvv.value)) {
                errors.push("CVV must be 3 digits.");
            }
        }

        // Show errors or proceed
        if (errors.length > 0) {
            alert(errors.join("\n"));
        } else {
            alert("Form is valid. Proceeding to checkout...");
            // Optionally submit the form here (e.g., via AJAX or form action)
            // this.submit();
        }
    });

    // Checkout button functionality
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            alert("Purchase complete!");
        });
    }
});

function loadOrderSummary() {
    const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
    const orderSummaryBody = document.getElementById('order-summary-body');
    let total = 0;

    orderSummaryBody.innerHTML = ''; // Clear any existing rows

    if (cartData.length === 0) {
        orderSummaryBody.innerHTML = '<tr><td colspan="4">Your cart is empty.</td></tr>';
    } else {
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
    }

    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
}
