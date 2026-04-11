const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('./models/product.model.js');

const products = [
  // HOODIES
  { name: "White Sweater", category: "Unisex", price: 999, compareAtPrice: 1299, stock: 50, images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80"], description: "Premium comfy white sweater.", isFeatured: true },
  { name: "Cyan Hoodie", category: "Women", price: 999, stock: 30, images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80"], description: "Soft aesthetic cyan hoodie." },
  { name: "Printed Hoodie", category: "Men", price: 999, compareAtPrice: 1499, stock: 20, images: ["https://images.unsplash.com/photo-1572495641004-28421ae52e52?w=800&q=80"], description: "Graphic printed streetwear hoodie.", isFeatured: true },
  { name: "Back Printed Black Hoodie", category: "Unisex", price: 999, stock: 15, images: ["https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80"], description: "Deep black hoodie with a bold back print." },
  { name: "Yellow Printed Hoodie", category: "Unisex", price: 999, stock: 25, images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80"], description: "Vibrant yellow hoodie for casual wear." },
  
  // JACKETS
  { name: "Red Jacket", category: "Women", price: 1299, compareAtPrice: 1599, stock: 10, images: ["https://plus.unsplash.com/premium_photo-1675186049366-64a655f8f537?w=800&q=80"], description: "Stylish bright red jacket.", isFeatured: true },
  { name: "Black Leather Jacket", category: "Women", price: 1499, stock: 12, images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"], description: "Classic women's leather jacket." },
  { name: "Blue Denim Jacket", category: "Unisex", price: 1299, stock: 40, images: ["https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80"], description: "Essential blue denim button-up jacket." },
  { name: "Grey Long Jacket", category: "Women", price: 1199, stock: 10, images: ["https://plus.unsplash.com/premium_photo-1674719144570-0728faf14f96?w=800&q=80"], description: "Elegant long grey coat." },
  { name: "White Puffer Jacket", category: "Women", price: 1099, stock: 5, images: ["https://images.unsplash.com/photo-1706765779494-2705542ebe74?w=800&q=80"], description: "Warm and cozy white puffer jacket." },
  { name: "Yellow Shirt", category: "Men", price: 899, stock: 20, images: ["https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80"], description: "Trendy African American man wearing sunglasses.", isFeatured: true },
  { name: "Brown Leather Jacket", category: "Men", price: 1499, stock: 15, images: ["https://images.unsplash.com/photo-1627637454030-5ddd536e06e5?w=800&q=80"], description: "Rugged brown leather streetwear." },
  { name: "Black Woolen Jacket", category: "Men", price: 1299, stock: 8, images: ["https://plus.unsplash.com/premium_photo-1671030274122-b6ac34f87b8b?w=800&q=80"], description: "Refined black woolen winter layer." },
  { name: "Black Puffer Jacket", category: "Men", price: 1399, stock: 30, images: ["https://images.unsplash.com/photo-1557418669-db3f781a58c0?w=800&q=80"], description: "Heavy-duty outdoor black puffer." },
  { name: "Green Jacket", category: "Men", price: 1099, stock: 12, images: ["https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=800&q=80"], description: "Minimalist casual green jacket." },

  // JEANS
  { name: "Blue Jeans", category: "Men", price: 999, stock: 50, images: ["https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=800&q=80"], description: "Standard fit men's blue jeans." },
  { name: "Blue Jeans", category: "Women", price: 999, stock: 45, images: ["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80"], description: "Standard fit women's blue jeans." },
  { name: "Ripped Blue Jeans", category: "Men", price: 899, stock: 22, images: ["https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80"], description: "Distressed denim jeans." },
  { name: "Skinny Blue Jeans", category: "Women", price: 799, compareAtPrice: 1199, stock: 35, images: ["https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&q=80"], description: "Form-fitting skinny jeans.", isFeatured: true },
  { name: "Straight Fit Blue Jeans", category: "Men", price: 899, stock: 40, images: ["https://images.unsplash.com/photo-1714143136372-ddaf8b606da7?w=800&q=80"], description: "Classic straight cut denim." },
  { name: "Black Jeans", category: "Men", price: 990, stock: 30, images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"], description: "Deep black rugged jeans." },
  { name: "Baggy Fit Blue Jeans", category: "Women", price: 999, stock: 15, images: ["https://plus.unsplash.com/premium_photo-1689371953420-b6981e43fa38?w=800&q=80"], description: "Oversized baggy casual wear." },

  // SHIRTS & TEES
  { name: "White T-Shirt", category: "Unisex", price: 499, stock: 100, images: ["https://plus.unsplash.com/premium_photo-1718913936342-eaafff98834b?w=800&q=80"], description: "The essential blank white tee.", isFeatured: true },
  { name: "Black Printed T-Shirt", category: "Unisex", price: 499, stock: 65, images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"], description: "Graphic printed black t-shirt." },
  { name: "Brown Sweater", category: "Women", price: 999, stock: 30, images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80"], description: "A sweater hanging on a hook in a room." },
  { name: "Blue Shirt", category: "Men", price: 499, stock: 45, images: ["https://images.unsplash.com/photo-1740711152088-88a009e877bb?w=800&q=80"], description: "Casual blue button-up." },
  { name: "Olive Green Shirt", category: "Men", price: 499, stock: 20, images: ["https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=800&q=80"], description: "Earthy tones casual top." },
  { name: "Yellow Checkered Shirt", category: "Men", price: 799, compareAtPrice: 1099, stock: 25, images: ["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80"], description: "Premium yellow flannel.", isFeatured: true },
  
  // ADDITIONAL CATEGORIES FOR FILTERS
  { name: "Classic Navy Suit", category: "Men", price: 4999, stock: 10, images: ["https://images.unsplash.com/photo-1594932224010-756184a86989?w=800&q=80"], description: "Traditional slim fit navy suit." },
  { name: "Charcoal Grey Coat", category: "Unisex", price: 3499, stock: 15, images: ["https://images.unsplash.com/photo-1539533377285-3c12ee3c544d?w=800&q=80"], description: "Elegant long wool coat." },
  { name: "Summer Chino Shorts", category: "Men", price: 899, stock: 40, images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80"], description: "Breathable cotton chino shorts." },
  { name: "Classic Polo Shirt", category: "Men", price: 1299, stock: 25, images: ["https://images.unsplash.com/photo-1626497748470-281923f938f5?w=800&q=80"], description: "Signature pique cotton polo." },
  { name: "Graphic Cotton T-Shirt", category: "Unisex", price: 699, stock: 50, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"], description: "Premium weight graphic tee." },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("-> Connected to Database.");
    await Product.deleteMany({});
    console.log("-> Cleared old product cache.");
    const docs = await Product.create(products);
    console.log(`-> Successfully seeded ${docs.length} high-quality products with working direct CDN links!`);
    process.exit();
  })
  .catch(err => {
    console.error("Error Seeding Data: ", err);
    process.exit(1);
  });
