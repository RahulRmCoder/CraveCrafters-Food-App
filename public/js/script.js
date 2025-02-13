const currentDate = new Date();

// Calculate the next month (two months ahead)
const twoMonthsLaterIndex = (currentDate.getMonth() + 2) % 12; // Wrap around if it goes past December
const twoMonthsLaterYear = currentDate.getFullYear() + (currentDate.getMonth() + 2 > 11 ? 1 : 0); // Increment year if needed

// Get the name of the month two months from now
const twoMonthsLaterName = new Date(twoMonthsLaterYear, twoMonthsLaterIndex).toLocaleString('default', { month: 'long' });

// Update the heading content
const offerHeading = document.getElementById('offer-heading');
offerHeading.textContent = `TILL ${twoMonthsLaterName.toUpperCase()} 1ST`;


const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active')
    })
}
if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active')
    })
}

// Get elements
const dishImages = document.querySelectorAll('.pro img, .pro h5'); 
const dishDescription = document.getElementById('dishDescription');
const descriptionContent = document.querySelector('#dishDescription .description-content p');
const closeDescriptionButton = document.getElementById('closeDescription');

// Dish Descriptions
const dishDescriptions = {
  "Chicken Soup": "A classic and comforting soup made with tender chicken, vegetables, and herbs. Perfect for a warm and nourishing meal.",
  "Tomato Soup": "A smooth and flavorful soup made with ripe tomatoes, onions, and herbs. It's a simple yet satisfying choice.",
  "Mixed Veg Soup": "A hearty soup packed with a variety of vegetables, providing a healthy and delicious way to get your daily dose of nutrients.",
  "Pumpkin Soup": "A creamy and flavorful soup made with roasted pumpkin, spices, and a touch of cream. It's a seasonal favorite.",
  "Chicken Tikka": "Tender pieces of chicken marinated in a blend of yogurt, spices, and herbs, then grilled to perfection. This classic dish is smoky, flavorful, and a staple of Indian cuisine.",
  "Gobi 65": "Crispy cauliflower florets coated in a spicy and flavorful batter, deep-fried to a golden brown. A popular vegetarian appetizer.",
  "Chicken Lollipop": "Crispy chicken drumettes coated in a flavorful batter and deep-fried. They get their name from their lollipop-like shape and are a popular appetizer.",
  "Paneer Tikka": "Cubes of paneer marinated in a vibrant blend of spices and yogurt, then grilled to achieve a smoky flavor. A healthy and flavorful alternative to chicken tikka.",
  "Honey Chilli Potato": "Crispy fried potato wedges tossed in a sweet and spicy honey-chilli sauce. A popular street food snack in India, known for its addictive flavor.",
  "Dragon Chicken": "Tender chicken pieces stir-fried with a blend of spices, vegetables, and a sweet and spicy sauce. This dish offers a unique flavor combination.",
  "Chilli Gobi": "Cauliflower florets stir-fried with green peppers, onions, and a spicy chilli sauce. A vegetarian option with a fiery kick.",
  "Prawns Tikka": "Succulent prawns marinated in a blend of spices and yogurt, then grilled to perfection. This dish is flavorful and a great option for seafood lovers.",
  "Chicken Tikka Masala": "A hearty and flavorful curry featuring chicken tikka (grilled chicken) in a creamy and aromatic tomato-based sauce. The tikka adds a smoky element to the dish.",
  "Paneer Butter Masala": "A creamy and rich curry featuring paneer (Indian cheese) cooked in a tomato-based sauce, infused with butter and aromatic spices. It's a vegetarian delight that's both comforting and satisfying.",
  "Paneer Peas Masala": "A vegetarian curry featuring paneer (Indian cheese) and green peas in a flavorful tomato-based sauce. A classic and comforting dish.",
  "Aloo Gobi Masala": "A vegetarian curry featuring potatoes and cauliflower in a flavorful tomato-based sauce. A simple yet satisfying dish.",
  "Butter Chicken": "Tender chicken pieces cooked in a creamy and rich tomato-based sauce, infused with butter and spices. It's a classic Indian dish known for its rich flavor.",
  "Chief Special Biriyani": "A flavorful and aromatic rice dish with tender chicken or mutton or prawns, fragrant rice, a boiled egg and a blend of spices. It can be vegeterian by blending it with a mixture of vegetables and spices. A signature dish that's perfect for a special occasion.",
  "Paneer Tikka Masala": "A hearty curry featuring paneer tikka (grilled paneer) in a creamy and aromatic tomato-based sauce. The tikka adds a smoky element to the dish.",
  "Chilli Chicken": "Tender chicken pieces stir-fried with green peppers, onions, and a spicy chilli sauce. This dish is known for its fiery flavor and is a popular choice for those who enjoy a bit of heat.",
  "Dark Knight": "A decadent chocolate dessert with layers of rich chocolate cake, creamy chocolate mousse, and a hint of coffee.",
  "The Kingdom": "A royal treat featuring a combination of delicious flavors and textures. This dessert might include layers of cake, mousse, fruits, and perhaps even a touch of gold leaf.",
  "Mix'nMatch": "A fun and customizable dessert where you can choose your favorite flavors and toppings. It could be a combination of ice cream, fruits, sauces, and other treats.",
  "Softie": "A light and refreshing dessert, perhaps a sorbet or a frozen yogurt with a variety of flavors and toppings.",
  "Mysore Pak": "A traditional South Indian sweet made with gram flour, ghee, and sugar. It has a rich, buttery flavor and a crumbly texture.",
  "Kaju Katli": "A popular Indian sweet made with cashew paste, sugar, and milk. It's known for its rich, creamy flavor and delicate texture.",
  "Gulab Jamun": "Soft, spongy, and sweet milk dumplings soaked in a fragrant sugar syrup. A classic Indian dessert loved by all.",
  "Motichur Laddu": "Sweet and crumbly balls made with chickpea flour, sugar, and ghee. They are often flavored with cardamom and saffron.",
  "Fried Rice": "A classic Asian dish made with stir-fried rice, vegetables, and your choice of protein. It's a versatile and flavorful meal that's perfect for any occasion.",
  "Noodles": "A popular Asian dish made with wheat flour noodles, often stir-fried with vegetables, meat, and a flavorful sauce. It's a quick and easy meal that's enjoyed worldwide.",
  "Roti": "A flatbread made from wheat flour, commonly found in Indian and South Asian cuisine. It's usually served with curries, vegetables, or other dishes.",
  "Steamed Rice": "Plain cooked rice, a staple food in many cultures. It's a versatile base for countless dishes and can be enjoyed on its own.",
  "Indian Thali": "A traditional Indian meal featuring a selection of curries, rice, breads, and chutneys. It's a complete and satisfying dining experience.",
  "Fish Curry": "A flavorful and aromatic curry featuring fish cooked in a coconut milk-based sauce, infused with spices and often served with rice.",
  "Chicken Roast": "A popular dish in South India, featuring roasted chicken with a crispy exterior and tender meat along with a spicy gravy.",
  "Paratha": "A type of Indian flatbread made from unleavened dough, often stuffed with vegetables or cheese. It's a versatile dish that can be served as a snack or as part of a larger meal.",
  "Pulao": "A flavorful rice dish cooked with aromatic spices and often vegetables or meat. It's a staple of Indian cuisine and can be enjoyed as a light meal or a side dish.",
  "Jeera Rice": "Fragrant rice cooked with cumin seeds, giving it a distinct flavor and aroma. It's a simple yet flavorful dish that can be served with a variety of curries.",
  "Dal Tadka": "A lentil-based curry tempered with aromatic spices, such as cumin, mustard seeds, and curry leaves. It's a hearty and comforting dish that's popular across India.",
  "Bhindi Masala": "A spicy and tangy curry featuring okra, cooked with onions, tomatoes, and a blend of spices. It's a popular vegetarian dish that's both flavorful and nutritious.",
  "South Indian Meals": "A traditional South Indian thali featuring a selection of rice dishes, curries, chutneys, and side dishes. It's a complete and satisfying meal.",
  "Tandoori Chicken": "Juicy, marinated chicken pieces cooked in a traditional clay oven, or tandoor. Infused with a smoky flavor and a blend of spices, including yogurt, garlic, ginger, and a mix of aromatic spices, this dish offers a tender, flavorful bite with a signature char and vibrant red hue."
};

// Function to display dish description
function showDishDescription(dishName) {
  descriptionContent.textContent = dishDescriptions[dishName];
  dishDescription.style.display = 'block';
}

// Function to close the description
function closeDishDescription() {
  dishDescription.style.display = 'none';
}

// Event listeners for dish clicks -  Target only images and h5 tags
dishImages.forEach(dishImage => {
  dishImage.addEventListener('click', () => {
    // Find the parent .pro element (the dish container)
    const dishContainer = dishImage.closest('.pro');

    const dishName = dishContainer.getAttribute('data-dish-name');
    showDishDescription(dishName);
  });
});

// Event listener for closing the description
closeDescriptionButton.addEventListener('click', closeDishDescription);
// Get all the "add to cart" buttons
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Function to add an item to the cart
async function addToCart(name, price) {
  try {
      const response = await fetch('/cart', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              name: name,
              price: price,
              quantity: 1
          })
      });

      const data = await response.json();
      
      if (!data.success) {
          throw new Error(data.message);
      }

      // Show success message
      alert('Item added to cart successfully!');
      
      // If we're on the cart page, reload the items
      if (window.location.pathname.includes('cart.html')) {
          loadCartItems();
      }
  } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Error adding item to cart. Please try again.');
  }
}

// Add event listeners to all "add to cart" buttons
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Get the dish name and price from the data attributes
        const itemName = button.parentElement.dataset.dishName;
        const itemPrice = parseInt(button.parentElement.dataset.dishPrice);

        addToCart(itemName, itemPrice);
    });
});
document.addEventListener('click', function (event) {
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileButton = document.getElementById('profile-button');
  const profileOptions = document.getElementById('profile-options');

  // Toggle the dropdown visibility on button click
  if (profileButton.contains(event.target)) {
    profileDropdown.classList.toggle('active');
  } else if (!profileOptions.contains(event.target)) {
    // Close the dropdown if clicked outside of it
    profileDropdown.classList.remove('active');
  }
});
// Fetch recommendations and display them
fetch('/recommendations')
    .then(response => response.json())
    .then(data => {
        console.log("Fetched Data:", data);

        const container = document.getElementById('recommendations-container');
        container.innerHTML = '';

        if (!data.success || !data.recommendations || data.recommendations.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; margin: 20px; font-size: 1.2em; padding-left:200px;">
                    No recommendations available at the moment. Make your first order to get recommendations.
                </p>
            `;
            return;
        }

        data.recommendations.forEach(dish => {
            const card = document.createElement('div');
            card.classList.add('pro');
            card.setAttribute('data-dish-name', dish.name);
            card.setAttribute('data-dish-price', dish.price);

            // Prepend `/public/images/` to the image path
            card.innerHTML = `
                <img src="/images/${dish.imageUrl}" alt="${dish.name}" height="280px">
                <div class="des">
                    <img src="/images/${dish.isVeg ? 'Veg.png' : 'Non-Veg.png'}" alt="${dish.isVeg ? 'veg' : 'non-veg'}" style="width: 20px; border-radius:0px;">
                    <h5>${dish.name}</h5>
                    <div class="star">${generateStarRating(dish.rating)}</div>
                    <h4>₹${dish.price}</h4>
                </div>
                <a href="#${dish.name}" class="add-to-cart"><i class="fa-solid fa-cart-plus cart"></i></a>
            `;

            card.querySelector('.add-to-cart').addEventListener('click', () => {
                addToCart(dish.name, dish.price); 
            });

            container.appendChild(card);
        });

        // Display dish description on image or title click
        container.addEventListener('click', (event) => {
            if (event.target.closest('.pro img, .pro h5')) { 
                const dishName = event.target.closest('.pro').getAttribute('data-dish-name');
                showDishDescription(dishName);
            }
        });
    })
    .catch(error => console.error('Error loading recommendations:', error));


// Function to add item to cart
async function addToCart(name, price) {
    try {
        const response = await fetch('/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                price: price,
                quantity: 1
            })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        alert('Item added to cart successfully!');
        
        if (window.location.pathname.includes('cart.html')) {
            loadCartItems();
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('Error adding item to cart. Please try again.');
    }
}

// Generate star rating as HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : '';
    return '<i class="fas fa-star"></i>'.repeat(fullStars) + halfStar;
}

// Display dish description
function showDishDescription(dishName) {
    descriptionContent.textContent = dishDescriptions[dishName];
    dishDescription.style.display = 'block';
}

// Close dish description
function closeDishDescription() {
    dishDescription.style.display = 'none';
}

closeDescriptionButton.addEventListener('click', closeDishDescription);


// Create a new file: public/js/chatWidget.js

class ChatWidget {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.isLoading = false;
        
        // Create and inject CSS
        this.injectStyles();
        
        // Create and inject HTML
        this.createWidget();
        
        // Add event listeners
        this.bindEvents();
    }

    injectStyles() {
        const styles = `
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }

            .chat-button {
                background-color: #cb202d;
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }

            .chat-window {
                display: none;
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                flex-direction: column;
            }

            .chat-header {
                background-color: #cb202d;
                color: white;
                padding: 15px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            word-wrap: break-word; /* Ensures long words break properly */
            }

            .message {
                max-width: 80%;
                padding: 10px;
                border-radius: 10px;
                margin: 5px 0;
            }

            .user-message {
                background-color: #cb202d;
                color: white;
                align-self: flex-end;
            }

            .bot-message {
            background-color: #f0f0f0;
            color: black;
            align-self: flex-start;
            max-width: 90%; /* Prevents messages from stretching too wide */
            white-space: normal; /* Ensures text wraps properly */
            }

            .chat-input {
                padding: 15px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
            }

            .chat-input input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                outline: none;
            }

            .chat-input button {
                background-color: #cb202d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }

            .chat-input button:disabled {
                opacity: 0.5;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <button class="chat-button">
                <i class="fas fa-comments"></i>
            </button>
            <div class="chat-window">
                <div class="chat-header">
                    <span>CraveCrafters Assistant</span>
                    <i class="fas fa-times" style="cursor: pointer;"></i>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message...">
                    <button type="submit">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
    }

    bindEvents() {
        const chatButton = document.querySelector('.chat-button');
        const chatWindow = document.querySelector('.chat-window');
        const closeButton = document.querySelector('.chat-header .fa-times');
        const input = document.querySelector('.chat-input input');
        const sendButton = document.querySelector('.chat-input button');

        chatButton.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            chatWindow.style.display = this.isOpen ? 'flex' : 'none';
            chatButton.style.display = this.isOpen ? 'none' : 'block';
        });

        closeButton.addEventListener('click', () => {
            this.isOpen = false;
            chatWindow.style.display = 'none';
            chatButton.style.display = 'block';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(input.value);
                input.value = '';
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage(input.value);
            input.value = '';
        });
    }

    async sendMessage(content) {
        if (!content.trim()) return;

        // Add user message
        this.addMessage(content, 'user');

        // Set loading state
        this.isLoading = true;
        const sendButton = document.querySelector('.chat-input button');
        sendButton.disabled = true;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...this.messages, { role: 'human', content }]
                }),
            });

            const data = await response.json();
            this.addMessage(data.content, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.isLoading = false;
            sendButton.disabled = false;
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'user' ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message in history
        this.messages.push({
            role: type === 'user' ? 'human' : 'assistant',
            content
        });
    }
}

// Get the current year
const currentYear = new Date().getFullYear();

// Update the copyright year dynamically
document.getElementById('current-year').textContent = currentYear;
