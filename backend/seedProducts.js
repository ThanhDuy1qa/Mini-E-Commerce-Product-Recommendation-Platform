const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  // Fashion
  { name: "Men's Basic T-Shirt", price: 15.99, category: "Fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80", description: "100% breathable cotton T-shirt. Available sizes: S, M, L, XL. Colors: Black, White, Navy. (Please specify your size and color in the order notes at checkout).", stock: 25 },
  { name: "Classic Denim Jacket", price: 49.99, category: "Fashion", image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&q=80", description: "Vintage blue denim jacket. Perfect for autumn wear. Available sizes: M, L, XL. Colors: Light Blue, Dark Wash. (Please leave a size/color note at checkout).", stock: 12 },
  { name: "Women's Summer Dress", price: 29.50, category: "Fashion", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&q=80", description: "Floral summer dress with a comfortable fit. Available sizes: S, M. Colors: Red Floral, Yellow Floral. (Note your preference at checkout).", stock: 8 },
  { name: "Cotton Sweatpants", price: 22.00, category: "Fashion", image: "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=500&q=80", description: "Cozy sweatpants for lounging or working out. Sizes: S, M, L. Colors: Grey, Black. (Specify size and color when checking out).", stock: 30 },

  // Footwear
  { name: "Running Sneakers", price: 45.00, category: "Footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", description: "Lightweight running shoes with high-elasticity rubber sole. Sizes: 39, 40, 41. Colors: Neon Green, Black. (Leave a note for size and color).", stock: 18 },
  { name: "Leather Oxford Shoes", price: 65.00, category: "Footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80", description: "Genuine leather formal shoes. Classic design. Sizes: 41, 42, 43. Colors: Brown, Black. (Add a note at checkout).", stock: 10 },
  { name: "Casual Canvas Sneakers", price: 25.00, category: "Footwear", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80", description: "Everyday canvas shoes. Easy to clean. Sizes: 38, 39, 40. Colors: White, Classic Black. (Note size/color at checkout).", stock: 40 },
  { name: "Women's High Heels", price: 55.00, category: "Footwear", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80", description: "Elegant black high heels for parties. Heel height: 7cm. Sizes: 36, 37, 38. Colors: Nude, Black. (Specify size and color at checkout).", stock: 0 },

  // Accessories
  { name: "Waterproof Backpack", price: 30.50, category: "Accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", description: "Fits up to 15.6-inch laptops. 100% waterproof material. Colors: Black, Navy. (Specify color at checkout).", stock: 14 },
  { name: "Sports Baseball Cap", price: 8.99, category: "Accessories", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80", description: "Sporty baseball cap, breathable cotton material, adjustable fit. Colors: Red, White, Blue. (Note your color at checkout).", stock: 22 },
  { name: "Leather Wallet", price: 20.00, category: "Accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80", description: "Minimalist bifold leather wallet with RFID blocking.", stock: 35 },
  { name: "Polarized Sunglasses", price: 18.50, category: "Accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80", description: "UV400 protection sunglasses with scratch-resistant lenses.", stock: 0 },

  // Electronics
  { name: "Smart Fitness Watch", price: 120.00, category: "Electronics", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", description: "Health tracking, heart rate monitor, step counter, and smart notifications.", stock: 15 },
  { name: "Wireless Bluetooth Earbuds", price: 55.00, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", description: "High-quality sound, 24h battery life, ergonomic design.", stock: 28 },
  { name: "Mechanical Keyboard", price: 85.00, category: "Electronics", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80", description: "RGB gaming keyboard with tactile blue switches.", stock: 0 },
  { name: "Gaming Mouse", price: 35.99, category: "Electronics", image: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?w=500&q=80", description: "High-precision 10,000 DPI sensor mouse with customizable buttons.", stock: 11 },

  // Home & Living
  { name: "Ceramic Coffee Mug", price: 10.50, category: "Home & Living", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80", description: "Minimalist 12oz ceramic mug, microwave and dishwasher safe.", stock: 60 },
  { name: "Aromatherapy Diffuser", price: 28.00, category: "Home & Living", image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=500&q=80", description: "Ultrasonic essential oil diffuser with 7-color LED lights.", stock: 16 },
  { name: "Orthopedic Pillow", price: 32.00, category: "Home & Living", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80", description: "Memory foam pillow designed to relieve neck and back pain.", stock: 0 },
  { name: "Non-Stick Frying Pan", price: 42.00, category: "Home & Living", image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80", description: "10-inch scratch-resistant pan, suitable for all stovetops.", stock: 10 }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ECommerce');
    console.log('MongoDB Connected...');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    await Product.insertMany(products);
    console.log('Successfully seeded 20 products into MongoDB!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();