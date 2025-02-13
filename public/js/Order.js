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
    "Paneer Tikka Masala": "A hearty curry featuring paneer tikka (grilled paneer) in a creamy and aromatic tomato-based sauce. The tikka adds a smoky flavor to the dish.",
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
    "Bhindi Masala": "A spicy and tangy curry featuring okra, cooked with onions, tomatoes, and a blend of spices. It's a popular vegetarian dish that's both flavorful and nutritious." 
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

// Get the current year
const currentYear = new Date().getFullYear();

// Update the copyright year dynamically
document.getElementById('current-year').textContent = currentYear;
