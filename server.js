const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const port = 3019;

const app = express();

// Updated static file and view configuration
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure express-session
app.use(session({
    secret: '31251013',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Basic routes
app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', req.path));
});

mongoose.connect('mongodb://localhost:27017/craveCraftersDB');
const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB connection established");
});

// Schema for the user
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dob: { type: Date },
    address: { type: String, required: true },
    phone: { type: String }, // Add phone field
    newAddress: { type: String }, // Add newAddress field for additional address
    foodPreferences: { type: [String], default: [] },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    profilePicture: { 
        type: String, 
        default: '/images/profile.jpg' // Set default profile picture
    },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] // Add this line for order history
});




const User = mongoose.model('User', userSchema);

const cartItemSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }]
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

// Update the cart endpoints
app.post('/cart', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, price, quantity } = req.body;

        let userCart = await CartItem.findOne({ userId });

        if (!userCart) {
            userCart = new CartItem({
                userId,
                items: []
            });
        }

        const existingItemIndex = userCart.items.findIndex(item => item.name === name);

        if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += quantity;
        } else {
            userCart.items.push({ name, price, quantity });
        }

        await userCart.save();
        res.json({ success: true, cart: userCart.items });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, message: 'Error adding item to cart' });
    }
});

app.get('/cart', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const userCart = await CartItem.findOne({ userId });
        res.json({ success: true, cart: userCart ? userCart.items : [] });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart' });
    }
});


app.delete('/cart/:name', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name } = req.params;

        const userCart = await CartItem.findOne({ userId });
        if (!userCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        userCart.items = userCart.items.filter(item => item.name !== name);
        await userCart.save();

        res.json({ success: true, cart: userCart.items });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, message: 'Error removing item from cart' });
    }
});

app.put('/cart/:name', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { name } = req.params;
        const { quantity } = req.body;

        const userCart = await CartItem.findOne({ userId });
        if (!userCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = userCart.items.find(item => item.name === name);
        if (item) {
            item.quantity = quantity;
            await userCart.save();
        }

        res.json({ success: true, cart: userCart.items });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, message: 'Error updating cart' });
    }
});
// Function to send an email
const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'cravecraftersindia@gmail.com',
                pass: 'bxqx voto dlhq ueie'
            }
        });

        const mailOptions = {
            from: '"CraveCrafters" <cravecraftersindia@gmail.com>',
            to: email,
            subject: 'Welcome to CraveCrafters - Your First Login!',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <img src="cid:logo" alt="CraveCrafters" style="width: 150px;"/>
                <h2>Welcome to CraveCrafters, ${name}!</h2>
                <p>Thank you for signing up at CraveCrafters!</p>
                <p>We are thrilled to have you with us. At CraveCrafters, we offer a variety of authentic Indian dishes that you will absolutely love. Explore our menu and discover the best of India's culinary delights.</p>
                <p><b>About CraveCrafters:</b></p>
                <p>CraveCrafters is your go-to destination for authentic Indian cuisine, where tradition meets innovation. Every dish we serve is a celebration of India's culinary heritage, crafted with the finest ingredients and traditional recipes passed down through generations.</p>
                <p>Click <a href="#">here</a> to view our full menu and start your flavorful journey.</p>
                <p>We can't wait to serve you!</p>
                <p>Best regards,</p>
                <p><b>The CraveCrafters Team</b></p>
            </div>
            `,
            attachments: [{
                filename: 'logo1.1.1.jpg',
                path: './public/images/logo1.1.1.jpg',
                cid: 'logo'
            }]
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password, dob, address, foodPreferences } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "An account with this email already exists. Please use a different email or log in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            dob,
            address,
            foodPreferences,  // Add food preferences to the user object
        });
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        console.log(user);
        res.status(201).json({ success: true, message: "Account created successfully. Please log in." });
    } catch (error) {
        console.error(error);
    }
});
// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found. Please sign up first." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: "Invalid credentials. Please try again." });
        }

        req.session.userId = user._id;

        console.log('User logged in:', user);

        res.json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred during login. Please try again." });
    }
});

// Function to generate a random reset code
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Forgot Password route
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        const resetCode = generateResetCode();
        const resetCodeExpires = new Date(Date.now() + 3600000); // 1 hour from now

        user.resetCode = resetCode;
        user.resetCodeExpires = resetCodeExpires;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'cravecraftersindia@gmail.com',
                pass: 'bxqx voto dlhq ueie'
            }
        });

        const mailOptions = {
            from: '"CraveCrafters" <cravecraftersindia@gmail.com>',
            to: email,
            subject: 'Password Reset Code',
            html: `
                <h2>Password Reset</h2>
                <p>Your password reset code is: <strong>${resetCode}</strong></p>
                <p>This code will expire in 1 hour.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Reset code sent to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
});

// Verify Reset Code route
app.post('/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        if (user.resetCode !== code || new Date() > user.resetCodeExpires) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset code." });
        }

        res.json({ success: true, message: "Reset code verified." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
});

// Update Password route
app.post('/update-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
});

// Protected route example
app.get('/Home.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'Home.html'));
});

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.redirect('/Login1.html');
    }
}

// Contact response schema
const contactResponseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ContactResponse = mongoose.model('ContactResponse', contactResponseSchema);

// Contact route
app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const contactResponse = new ContactResponse({
            name,
            email,
            message
        });
        await contactResponse.save();
        console.log('Contact message saved:', contactResponse);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'cravecraftersindia@gmail.com',
                pass: 'bxqx voto dlhq ueie'
            }
        });

        const mailOptions = {
            from: '"CraveCrafters Contact Form" <cravecraftersindia@gmail.com>',
            to: 'cravecraftersindia@gmail.com',
            subject: `New Contact Form Message from ${name}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Contact form email sent to CraveCrafters.');

        res.json({ success: true, message: "Message sent successfully. Thank you for contacting CraveCrafters." });
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ success: false, message: "Error occurred while sending the message." });
    }
});

app.get('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Don't modify the default image path if it's the default one
        const profilePicture = user.profilePicture === '/images/profile.jpg' 
            ? '/images/profile.jpg'  // Keep the default path as is
            : user.profilePicture;   // Use the uploaded image path

        res.json({ 
            success: true, 
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                newAddress: user.newAddress,
                profilePicture: profilePicture
            }
        });
    } catch (error) {
        console.error("Error fetching profile data:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});
// Route to update the profile with phone and additional address
app.post('/update-profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { phone, address, newAddress } = req.body;

        // Validate phone number (must be 10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: "Invalid phone number. Please provide a valid 10-digit phone number." });
        }

        // Update the user's profile with phone and additional address
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.phone = phone;
        user.address = address;
        user.newAddress = newAddress; // Save the additional address field

        await user.save();

        res.json({ success: true, message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the profile." });
    }
});

const multer = require('multer');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Get file extension
        const ext = path.extname(file.originalname);
        // Create filename using userId and timestamp
        cb(null, `profile-${req.session.userId}-${Date.now()}${ext}`);
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Configure upload middleware
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Then your upload route should work correctly
app.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Store the relative path to the uploaded file
        const profilePicturePath = `/uploads/${req.file.filename}`;
        
        // Only delete the old file if it's not the default image and exists
        if (user.profilePicture && 
            user.profilePicture !== '/images/profile.jpg' && 
            user.profilePicture.startsWith('/uploads/')) {
            const oldFilePath = path.join(__dirname, user.profilePicture);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        user.profilePicture = profilePicturePath;
        await user.save();

        res.json({ 
            success: true, 
            imageUrl: profilePicturePath,
            message: "Profile picture updated successfully!"
        });
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        if (error.message === 'Only image files are allowed!') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "An error occurred while uploading the profile picture." });
    }
});

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ 
            success: true, 
            data: {
                // ... other profile data
                profilePicture: user.profilePicture || '/profile.jpg' 
            }
        });
    } catch (error) {
        console.error("Error fetching profile data:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

// Assuming `userId` is used to fetch the logged-in user's address
app.get('/getAddress', async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await User.findById(userId);
      if (user) {
        res.json({ address: user.address, newAddress: user.newAddress });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/updateAddress', async (req, res) => {
    try {
      const userId = req.session.userId;
      const newAddress = req.body.newAddress;
  
      const user = await User.findByIdAndUpdate(userId, { address: newAddress }, { new: true });
      if (user) {
        res.json({ success: true, message: 'Address updated successfully' });
      } else {
        res.status(404).json({ success: false, error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ success: false, message: "An error occurred during logout. Please try again." });
        }
        res.redirect('/Login1.html'); // Redirect to login page
    });
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    address: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }
});

const Order = mongoose.model('Order', orderSchema);

// Add these routes to your server.js
app.post('/create-order', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        const { address, items, totalAmount } = req.body;

        // Create new order
        const order = new Order({
            userId,
            items,
            address,
            totalAmount
        });
        
        await order.save();
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id } // Add the order ID to the user's orderHistory
        });

        // Clear the user's cart after successful order
        await CartItem.findOneAndDelete({ userId });

        res.json({ success: true, orderId: order._id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Error creating order' });
    }
});

app.get('/order/:orderId', async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId).populate('userId'); // Populating user info if necessary
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      res.json({
        success: true,
        items: order.items,
        totalAmount: order.totalAmount,
        userId: order.userId._id, // Adjust if userId is an object
        userName: order.userId.name, // Assuming name is a field in User schema
        address: order.address
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ success: false, message: 'Error fetching order details' });
    }
  });
  app.get('/orders', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId; // Get the user ID from the session
  
      // Fetch orders for the current user in descending order
      const orders = await Order.find({ userId }) 
        .sort({ orderDate: -1 }) 
        .populate('userId', 'name'); 
  
      res.json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Error fetching orders' });
    }
  });
app.post('/placeOrder', async (req, res) => {
    const userId = req.session.userId;
    const { orderItems } = req.body; // Assume orderItems contains dish names and quantities

    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    try {
        // Save order in Order collection
        const newOrder = new Order({
            userId,
            items: orderItems.map(item => ({ name: item.name, quantity: item.quantity })),
            date: new Date(),
        });
        await newOrder.save();

        // Update user's order history
        const user = await User.findById(userId);
        user.orderHistory.push(newOrder._id);
        await user.save();

        // Fetch updated recommendations
        const recommendations = await getRecommendations(user); // Define as a separate function

        res.json({ success: true, order: newOrder, recommendations });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
});

// Add this to your server.js
const fetch = require('node-fetch'); // Add this at the top if not already present

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch('http://0.0.0.0:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Separate function to fetch recommendations based on latest order history
const getInitialRecommendations = async (preferences) => {
    try {
        // Find dishes that match any of the user's preferences
        const dishes = await Dish.find({
            $or: [
                { tags: { $in: preferences } },
                { 
                    isVeg: preferences.includes('vegetarian') || preferences.includes('vegan'),
                    tags: { $in: preferences.filter(p => p !== 'vegetarian' && p !== 'vegan') }
                },
                { 
                    isVeg: false, 
                    tags: preferences.includes('non-veg') ? { $exists: true } : { $in: preferences }
                }
            ]
        }).limit(8);

        return dishes;
    } catch (error) {
        console.error("Error getting initial recommendations:", error);
        return [];
    }
};

// Modified getRecommendations function
async function getRecommendations(user) {
    try {
        const preferences = user.foodPreferences;
        
        // If no order history, return initial recommendations
        if (!user.orderHistory || user.orderHistory.length === 0) {
            return await getInitialRecommendations(preferences);
        }

        const lastOrderedDishes = user.orderHistory.slice(-5).flatMap(order => 
            order.items.map(item => item.name)
        );

        let recommendedDishes = {};
        
        // Get similar dishes based on order history
        for (const dish of lastOrderedDishes) {
            const similarDishes = similarityData[dish];
            if (similarDishes) {
                for (const [similarDish, score] of Object.entries(similarDishes)) {
                    if (!lastOrderedDishes.includes(similarDish) && score > 0.3) {
                        const dishDoc = await Dish.findOne({ name: similarDish });
                        if (dishDoc) {
                            // Check if dish matches user preferences
                            const matchesPreference = preferences.some(pref => {
                                if (pref === 'vegetarian') return dishDoc.isVeg;
                                if (pref === 'non-veg') return !dishDoc.isVeg;
                                return dishDoc.tags.includes(pref);
                            });

                            if (matchesPreference) {
                                recommendedDishes[similarDish] = score;
                            }
                        }
                    }
                }
            }
        }

        // If not enough recommendations from similar dishes, add dishes based on preferences
        if (Object.keys(recommendedDishes).length < 4) {
            const additionalDishes = await getInitialRecommendations(preferences);
            additionalDishes.forEach(dish => {
                if (!recommendedDishes[dish.name] && !lastOrderedDishes.includes(dish.name)) {
                    recommendedDishes[dish.name] = 0.3; // Default similarity score
                }
            });
        }

        const sortedDishes = Object.keys(recommendedDishes)
            .sort((a, b) => recommendedDishes[b] - recommendedDishes[a])
            .slice(0, 8);

        return await Dish.find({ name: { $in: sortedDishes } });
    } catch (error) {
        console.error("Error in getRecommendations:", error);
        return [];
    }
}
function getRandomDeliveryTime() {
    return Math.floor(Math.random() * (50 - 20 + 1)) + 20;
  }
  
  const sendOrderConfirmationEmail = async (orderId) => {
      try {
          // Fetch order details from the database
          const order = await Order.findById(orderId).populate('userId');
  
          // Create the email body
          const emailBody = `
          <html>
          <head>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f4f4;
                  }
                  table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 20px 0;
                  }
                  th, td {
                      text-align: center;
                      padding: 8px;
                      border-bottom: 1px solid #ddd;
                  }
                  th {
                      background-color: #f0f0f0;
                      font-weight: bold;
                  }
                  .total {
                      font-weight: bold;
                      font-size: 16px;
                  }
              </style>
          </head>
          <body>
              <h2>Order Confirmation</h2>
              <p>Thank you for your order! Here are your order details:</p>
              <table>
                  <thead>
                      <tr>
                          <th>Item</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${order.items.map(item => `
                          <tr>
                              <td>${item.name}</td>
                              <td>₹${item.price}</td>
                              <td>${item.quantity}</td>
                              <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
              <p class="total"><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Delivery Address:</strong> ${order.address}</p>
              <p><strong>Estimated Delivery Time:</strong> ${getRandomDeliveryTime()} minutes</p>
          </body>
          </html>
      `;

  
          // Send the email using Nodemailer
          const transporter = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                  user: 'cravecraftersindia@gmail.com',
                  pass: 'bxqx voto dlhq ueie' // Replace with your actual password
              }
          });
          
          const mailOptions = {
              from: '"CraveCrafters" <cravecraftersindia@gmail.com>',
              to: order.userId.email, // Get the user's email from the populated user object
              subject: 'Your CraveCrafters Order Confirmation',
              html: emailBody
          };
  
          await transporter.sendMail(mailOptions);
          console.log('Order confirmation email sent to:', order.userId.email);
      } catch (error) {
          console.error('Error sending order confirmation email:', error);
      }
  };
  
  app.post('/send-order-confirmation-email/:orderId', async (req, res) => {
      try {
          const orderId = req.params.orderId;
          await sendOrderConfirmationEmail(orderId);
          res.json({ success: true }); // Send a success response back to the client
      } catch (error) {
          console.error('Error sending order confirmation email:', error);
          res.status(500).json({ success: false });
      }
  });

// Dish Schema
const dishSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    price: Number,
    isVeg: Boolean,
    tags: [String],
    imageUrl: String,
    rating: Number
});

const Dish = mongoose.model('Dish', dishSchema);


let similarityData;

// Load similarity data at server startup
fs.readFile('dish_similarity.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error loading similarity data:', error);
        similarityData = {};
    } else {
        similarityData = JSON.parse(data);
    }
});


// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get initial recommendations based on preferences
async function getInitRecommendations(preferences) {
    try {
        let dishes = [];
        
        if (preferences.includes('spicy')) {
            let baseQuery = {
                tags: 'spicy',
                $and: [
                    { tags: 'spicy' },
                    { tags: { $ne: 'sweet' } }
                ]
            };

            // Strict vegetarian + spicy
            if (preferences.includes('vegetarian') && !preferences.includes('non-veg')) {
                baseQuery.isVeg = true;
                dishes = await Dish.find(baseQuery);
                
                // If not enough veg spicy dishes, add more vegetarian spicy dishes
                if (dishes.length < 8) {
                    const moreVegSpicyDishes = await Dish.find({
                        isVeg: true,
                        tags: 'spicy'
                    });
                    
                    const existingIds = new Set(dishes.map(d => d._id.toString()));
                    const newDishes = moreVegSpicyDishes.filter(d => !existingIds.has(d._id.toString()));
                    dishes = [...dishes, ...newDishes];
                }
            } 
            // Strict non-vegetarian + spicy
            else if (preferences.includes('non-veg') && !preferences.includes('vegetarian')) {
                baseQuery.isVeg = false;
                dishes = await Dish.find(baseQuery);
                
                // If not enough non-veg spicy dishes, add more non-vegetarian spicy dishes
                if (dishes.length < 8) {
                    const moreNonVegSpicyDishes = await Dish.find({
                        isVeg: false,
                        tags: 'spicy'
                    });
                    
                    const existingIds = new Set(dishes.map(d => d._id.toString()));
                    const newDishes = moreNonVegSpicyDishes.filter(d => !existingIds.has(d._id.toString()));
                    dishes = [...dishes, ...newDishes];
                }
            }
            // Both veg and non-veg spicy or just spicy
            else {
                dishes = await Dish.find(baseQuery);
                
                // If not enough dishes, add more spicy dishes without dietary restriction
                if (dishes.length < 8) {
                    const moreSpicyDishes = await Dish.find({
                        tags: 'spicy'
                    });
                    
                    const existingIds = new Set(dishes.map(d => d._id.toString()));
                    const newDishes = moreSpicyDishes.filter(d => !existingIds.has(d._id.toString()));
                    dishes = [...dishes, ...newDishes];
                }
            }

            // If still not enough dishes after all attempts, fill with highest rated dishes 
            // matching the dietary preference
            if (dishes.length < 8) {
                let fillQuery = {};
                
                if (preferences.includes('vegetarian') && !preferences.includes('non-veg')) {
                    fillQuery.isVeg = true;
                } else if (preferences.includes('non-veg') && !preferences.includes('vegetarian')) {
                    fillQuery.isVeg = false;
                }
                
                const fillDishes = await Dish.find(fillQuery)
                    .sort({ rating: -1 })
                    .limit(8 - dishes.length);
                
                const existingIds = new Set(dishes.map(d => d._id.toString()));
                const additionalDishes = fillDishes.filter(d => !existingIds.has(d._id.toString()));
                dishes = [...dishes, ...additionalDishes];
            }
        } else {
            // Handle non-spicy preferences
            let query = {};
            
            if (preferences.includes('vegetarian') && !preferences.includes('non-veg')) {
                query.isVeg = true;
            } else if (preferences.includes('non-veg') && !preferences.includes('vegetarian')) {
                query.isVeg = false;
            }
            
            if (preferences.includes('gluten-free')) {
                if (!query.$and) query.$and = [];
                query.$and.push({ tags: 'gluten-free' });
            }
            
            dishes = await Dish.find(query);
        }
        
        // Shuffle and ensure exactly 8 items
        dishes = shuffleArray(dishes);
        
        // If we still don't have 8 dishes, fill with highest rated dishes
        // that match the dietary preference
        if (dishes.length < 8) {
            let finalFillQuery = {};
            
            if (preferences.includes('vegetarian') && !preferences.includes('non-veg')) {
                finalFillQuery.isVeg = true;
            } else if (preferences.includes('non-veg') && !preferences.includes('vegetarian')) {
                finalFillQuery.isVeg = false;
            }
            
            const finalFillDishes = await Dish.find(finalFillQuery)
                .sort({ rating: -1 })
                .limit(8 - dishes.length);
            
            const existingIds = new Set(dishes.map(d => d._id.toString()));
            const finalAdditionalDishes = finalFillDishes.filter(d => !existingIds.has(d._id.toString()));
            dishes = [...dishes, ...finalAdditionalDishes];
        }
        
        return dishes.slice(0, 8);
    } catch (error) {
        console.error('Error in getInitialRecommendations:', error);
        throw error;
    }
}

// Get recommendations based on order history and preferences
async function getRecommendations(user) {
    try {
        if (!user) {
            throw new Error('User object is required');
        }

        const orderHistory = user.orderHistory || [];
        const preferences = user.foodPreferences || [];
        
        // If no order history, return initial recommendations
        if (!orderHistory.length) {
            return getInitRecommendations(preferences);
        }
        
        // Track ordered items and their details
        const orderedDishes = {};
        const orderedCategories = {};
        const orderedTags = {};
        const orderedIngredients = new Set();
        
        // Process order history
        orderHistory.forEach(order => {
            if (!order || !Array.isArray(order.items)) {
                return;
            }

            order.items.forEach(item => {
                if (!item || typeof item !== 'object') {
                    return;
                }

                const name = item.name || 'unknown';
                const category = item.category || 'uncategorized';
                const tags = Array.isArray(item.tags) ? item.tags : [];

                orderedDishes[name] = (orderedDishes[name] || 0) + 1;
                orderedCategories[category] = (orderedCategories[category] || 0) + 1;
                
                // Extract main ingredients from item name
                const ingredients = name.toLowerCase().split(' ');
                ingredients.forEach(ing => orderedIngredients.add(ing));
                
                tags.forEach(tag => {
                    if (typeof tag === 'string') {
                        orderedTags[tag] = (orderedTags[tag] || 0) + 1;
                    }
                });
            });
        });
        
        // Get all dishes
        let allDishes = await Dish.find({});
        if (!Array.isArray(allDishes)) {
            throw new Error('Failed to fetch dishes from database');
        }
        
        // Apply dietary restrictions first (these are hard constraints)
        let filteredDishes = allDishes;
        
        if (preferences.includes('gluten-free')) {
            // Filter out sweets and non-gluten-free items
            const excludedCategories = ['dessert', 'sweets', 'bakery', 'cake', 'pastry'];
            const excludedTags = ['sweet', 'dessert', 'contains-gluten'];
            
            filteredDishes = allDishes.filter(dish => {
                // Exclude based on category
                if (dish.category && excludedCategories.includes(dish.category.toLowerCase())) {
                    return false;
                }
                
                // Exclude based on tags
                if (Array.isArray(dish.tags)) {
                    for (const tag of excludedTags) {
                        if (dish.tags.map(t => t.toLowerCase()).includes(tag)) {
                            return false;
                        }
                    }
                }
                
                // Check dish name for sweet indicators
                const sweetKeywords = ['sweet', 'dessert', 'cake', 'pastry', 'cookie', 'chocolate', 'ice cream', 'halwa', 'kheer', 'ladoo', 'barfi', 'gulab'];
                const dishNameLower = dish.name.toLowerCase();
                if (sweetKeywords.some(keyword => dishNameLower.includes(keyword))) {
                    return false;
                }
                
                return true;
            });
        }
        
        // Then apply veg/non-veg filtering if needed
        if (preferences.includes('vegetarian') && !preferences.includes('non-veg')) {
            filteredDishes = filteredDishes.filter(dish => dish.isVeg === true);
        } else if (preferences.includes('non-veg') && !preferences.includes('vegetarian')) {
            filteredDishes = filteredDishes.filter(dish => dish.isVeg === false);
        }
        
        // Calculate scores for filtered dishes
        const scoredDishes = filteredDishes.map(dish => {
            let score = 0;
            
            if (!dish || typeof dish !== 'object') {
                return { dish, score: -1 };
            }
            
            // Ingredient matching (highest priority)
            const dishIngredients = dish.name.toLowerCase().split(' ');
            dishIngredients.forEach(ing => {
                if (orderedIngredients.has(ing)) {
                    score += 10;
                }
            });
            
            // Category matching
            if (dish.category && orderedCategories[dish.category]) {
                score += orderedCategories[dish.category] * 8;
            }
            
            // Tag matching with dietary preference boost
            if (Array.isArray(dish.tags)) {
                dish.tags.forEach(tag => {
                    if (orderedTags[tag]) {
                        score += orderedTags[tag] * 6;
                    }
                    // Boost score for gluten-free items
                    if (preferences.includes('gluten-free') && tag.toLowerCase() === 'gluten-free') {
                        score += 15;
                    }
                });
            }
            
            // ML similarity scoring
            if (similarityData && similarityData[dish.name]) {
                Object.keys(orderedDishes).forEach(orderedDish => {
                    if (similarityData[dish.name][orderedDish]) {
                        score += similarityData[dish.name][orderedDish] * 10;
                    }
                });
            }
            
            // Previous orders (reduced weight to encourage variety)
            if (orderedDishes[dish.name]) {
                score += orderedDishes[dish.name] * 3;
            }
            
            return { dish, score };
        });
        
        // Sort by score with minimal randomization
        const validScoredDishes = scoredDishes
            .filter(scored => scored.score >= 0)
            .sort((a, b) => {
                const randomFactor = Math.random() * 0.1;
                return (b.score + randomFactor) - (a.score + randomFactor);
            });
        
        // Select recommendations maintaining veg/non-veg balance when needed
        const recommendations = [];
        const maxRecommendations = 8;
        
        // Only apply veg/non-veg ratio if neither or both preferences are present
        if (!preferences.includes('vegetarian') && !preferences.includes('non-veg') ||
            (preferences.includes('vegetarian') && preferences.includes('non-veg'))) {
            const targetVegCount = Math.round(maxRecommendations * 0.5); // Maintain 50/50 split
            let currentVegCount = 0;
            let currentNonVegCount = 0;
            
            for (const scored of validScoredDishes) {
                if (recommendations.length >= maxRecommendations) break;
                
                const isVeg = scored.dish.isVeg === true;
                
                if (isVeg && currentVegCount < targetVegCount) {
                    recommendations.push(scored.dish);
                    currentVegCount++;
                } else if (!isVeg && currentNonVegCount < (maxRecommendations - targetVegCount)) {
                    recommendations.push(scored.dish);
                    currentNonVegCount++;
                }
            }
        } else {
            // If specific veg/non-veg preference is set, just take top scored items
            recommendations.push(...validScoredDishes
                .slice(0, maxRecommendations)
                .map(scored => scored.dish));
        }
        
        // Fill any remaining slots
        while (recommendations.length < maxRecommendations) {
            const remainingDish = validScoredDishes.find(scored => 
                !recommendations.includes(scored.dish)
            );
            if (remainingDish) {
                recommendations.push(remainingDish.dish);
            } else {
                break;
            }
        }
        
        return shuffleArray(recommendations);
        
    } catch (error) {
        console.error('Error in getRecommendations:', error);
        return getInitRecommendations(user?.foodPreferences || []);
    }
}
// Update the routes
app.get('/recommendations', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    
    try {
        const user = await User.findById(userId).populate({
            path: 'orderHistory',
            populate: { path: 'items', model: 'Dish' }
        });
        
        const recommendations = await getRecommendations(user);
        
        res.json({
            success: true,
            recommendations,
            preferences: user.foodPreferences
        });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: "Error fetching recommendations" });
    }
});

app.post('/updatePreferences', async (req, res) => {
    const userId = req.session.userId;
    const { preferences } = req.body;
    
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    
    try {
        const user = await User.findById(userId);
        user.foodPreferences = preferences;
        await user.save();
        
        const recommendations = await getInitRecommendations(preferences);
        res.json({ success: true, recommendations });
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ message: "Error updating preferences" });
    }
});

module.exports = {
    getRecommendations,
    getInitRecommendations
};


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});