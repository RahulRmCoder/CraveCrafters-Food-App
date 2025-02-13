// Load cart items when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
});
const currentYear = new Date().getFullYear();

// Update the copyright year dynamically
document.getElementById('current-year').textContent = currentYear;
// Function to load cart items from server
async function loadCartItems() {
    try {
        const cartTableBody = document.getElementById('cartTableBody');
        const totalAmountElement = document.getElementById('totalAmount');
        const totalElement = document.getElementById('total');
        
        // Fetch cart items from server
        const response = await fetch('/cart');
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        const cart = data.cart || [];
        cartTableBody.innerHTML = ''; // Clear existing cart items
        let totalAmount = 0;

        if (cart.length === 0) {
            // If cart is empty, display a message
            const emptyRow = cartTableBody.insertRow();
            const emptyCell = emptyRow.insertCell();
            emptyCell.colSpan = 6;
            emptyCell.textContent = 'Your cart is empty.';
        } else {
            // Populate the cart table with items
            cart.forEach(item => {
                const row = cartTableBody.insertRow();
                const removeCell = row.insertCell();
                const imageCell = row.insertCell();
                const nameCell = row.insertCell();
                const priceCell = row.insertCell();
                const quantityCell = row.insertCell();
                const subtotalCell = row.insertCell();

                // Add remove button
                const removeButton = document.createElement('i');
                removeButton.classList.add('far', 'fa-times-circle');
                removeButton.addEventListener('click', () => {
                    removeFromCart(item.name);
                });
                removeCell.appendChild(removeButton);

                // Add image
                const image = document.createElement('img');
                image.alt = item.name;
                imageCell.appendChild(image);

                // Check for image existence (try various formats)
                let baseImagePath = '/images/';
                let imagePath = baseImagePath + `${item.name}.jpg`;

                loadImage(imagePath).then(img => {
                    image.src = imagePath;
                }).catch(() => {
                    imagePath = baseImagePath + `${item.name}.jpeg`;
                    loadImage(imagePath).then(img => {
                        image.src = imagePath;
                    }).catch(() => {
                        imagePath = baseImagePath + `${item.name}.png`;
                        loadImage(imagePath).then(img => {
                            image.src = imagePath;
                        }).catch(() => {
                            imagePath = baseImagePath + `${item.name}.gif`;
                            loadImage(imagePath).then(img => {
                                image.src = imagePath;
                            }).catch(() => {
                                imagePath = baseImagePath + `${item.name}.webp`;
                                loadImage(imagePath).then(img => {
                                    image.src = imagePath;
                                }).catch(() => {
                                    imagePath = baseImagePath + `${item.name}.avif`;
                                    loadImage(imagePath).then(img => {
                                        image.src = imagePath;
                                    }).catch(() => {
                                        imagePath = baseImagePath + "placeholder.jpg";
                                        image.src = imagePath;
                                    });
                                });
                            });
                        });
                    });
                });


                nameCell.textContent = item.name;
                priceCell.textContent = '₹' + item.price;

                // Add quantity input
                const quantityInput = document.createElement('input');
                quantityInput.type = 'number';
                quantityInput.classList.add('quantity');
                quantityInput.value = item.quantity;
                quantityInput.min = '1';
                quantityCell.appendChild(quantityInput);

                // Add subtotal
                const subtotal = item.price * item.quantity;
                subtotalCell.textContent = '₹' + subtotal;

                // Add subtotal to total amount
                totalAmount += subtotal;

                // Event listener for quantity change
                quantityInput.addEventListener('change', () => {
                    const newQuantity = parseInt(quantityInput.value);
                    if (newQuantity < 1) {
                        quantityInput.value = 1;
                        return;
                    }
                    updateCartItemQuantity(item.name, newQuantity);
                });
            });

            // Update total amount in the UI
            totalAmountElement.textContent = '₹' + totalAmount;
            totalElement.textContent = '₹' + totalAmount;
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('Error loading cart. Please try again.');
    }
}

// Function to load an image and return a promise
function loadImage(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = imagePath;
    });
}

// Function to remove an item from the cart
async function removeFromCart(name) {
    try {
        const response = await fetch(`/cart/${encodeURIComponent(name)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        loadCartItems(); // Reload the cart items after removing
    } catch (error) {
        console.error('Error removing item from cart:', error);
        alert('Error removing item from cart. Please try again.');
    }
}

// Function to update the quantity of an item in the cart
async function updateCartItemQuantity(name, newQuantity) {
    try {
        const response = await fetch(`/cart/${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        loadCartItems(); // Reload the cart to update the total amount
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        alert('Error updating quantity. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/getAddress');
      const data = await response.json();
  
      if (data.address) {
        document.getElementById('existingAddress').value = data.address;
      }
      if (data.newAddress) {
        document.getElementById('newAddress').value = data.newAddress;
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  });

  document.getElementById('address-field').addEventListener('change', async (event) => {
    const newAddress = event.target.value;
    
    try {
      const response = await fetch('/updateAddress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newAddress }),
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('Address updated successfully');
      } else {
        console.error('Failed to update address:', result.error);
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  });

  let selectedAddress = '';

function selectAddress(addressId) {
    // Remove 'selected' class from previously selected address
    document.querySelectorAll('.address-option input[type="text"]').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add 'selected' class to the currently selected address
    const selectedInput = document.getElementById(addressId);
    selectedInput.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.querySelector('#subtotal button.normal');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }
});

async function handleCheckout() {
    try {
        // Check if an address is selected
        const selectedInput = document.querySelector('.address-option input.selected');
        if (!selectedInput) {
            alert('Please select a delivery address before proceeding to checkout');
            return;
        }

        const selectedAddress = selectedInput.value;
        
        // Get cart items and total
        const response = await fetch('/cart');
        const data = await response.json();
        
        if (!data.success || !data.cart || data.cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Get total amount
        const totalAmount = parseFloat(document.getElementById('total').textContent.replace('₹', ''));

        // Confirm order
        const confirmOrder = confirm('Are you sure you want to place this order?');
        if (!confirmOrder) {
            return;
        }

        // Create order
        const orderResponse = await fetch('/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: selectedAddress,
                items: data.cart,
                totalAmount: totalAmount
            })
        });

        const orderResult = await orderResponse.json();
        
        if (orderResult.success) {
            // Call the server-side function to send the email (corrected route)
            await fetch(`/send-order-confirmation-email/${orderResult.orderId}`, {
                method: 'POST',
            });

            // Redirect to bill page with order ID
            window.location.href = `/bill.html?orderId=${orderResult.orderId}`;
        } else {
            throw new Error(orderResult.message || 'Error creating order');
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout. Please try again.');
    }
}

// Function to generate a random delivery time between 20 and 50 minutes
function getRandomDeliveryTime() {
  return Math.floor(Math.random() * (50 - 20 + 1)) + 20;
}

