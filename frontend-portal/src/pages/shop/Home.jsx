import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

export default function Home() {
  const { data: fetchResult, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products?isFeatured=true').then(res => res.data)
  });

  const featuredProducts = fetchResult?.data || [];
  
  // Fallback placeholder images if no real products exist
  const heroImage1 = featuredProducts[0]?.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80";
  const heroImage2 = featuredProducts[1]?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80";

  const [showCount, setShowCount] = useState(3);
  
  const allCollections = [
    { img: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=600&q=80", name: "Basic Heavy Weight T-Shirt", price: "$199" },
    { img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", name: "Soft Wash Straight Fit Jeans", price: "$199" },
    { img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", name: "Basic Heavy Weight T-Shirt", price: "$199" },
    { img: "https://images.unsplash.com/photo-1627153559528-476916f98ecc?w=800&q=80", name: "Checkered Oxford Shirt", price: "$149" },
    { img: "https://images.unsplash.com/photo-1587886372516-ed2e153a0e9e?w=800&q=80", name: "Minimalist Zip Hoodie", price: "$249" },
    { img: "https://images.unsplash.com/photo-1588099768531-a72d4a198538?w=600&q=80", name: "Vintage Canvas Sneakers", price: "$129" }
  ];

  return (
    <div className="bg-noise min-h-screen text-black overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 pt-20 pb-32">
        <motion.div 
          initial="hidden" animate="visible" variants={STAGGER}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12"
        >
          {/* Left Hero Text */}
          <div className="w-full lg:w-1/2 mt-12 lg:mt-0 relative z-10">
            <motion.div variants={FADE_UP} className="mb-8">
              <h1 className="text-6xl md:text-[80px] font-black uppercase leading-[0.9] tracking-tighter mix-blend-difference">
                NEW <br /> COLLECTION
              </h1>
              <p className="text-lg md:text-xl uppercase tracking-[0.2em] mt-6 text-[#5e5e5e] font-semibold">
                Summer <br /> 2026
              </p>
            </motion.div>
            
            <motion.div variants={FADE_UP}>
              <Link to="/shop" className="group inline-flex items-center bg-[#d9d9d9] hover:bg-[#c0c0c0] text-black px-8 py-3 w-[265px] transition-colors">
                <span className="font-bold tracking-widest uppercase text-sm">Go To Shop</span>
                <ArrowRight className="ml-auto group-hover:translate-x-2 transition-transform" size={18} />
              </Link>
            </motion.div>
          </div>

          {/* Right Hero Imagery (Staggered Layout) */}
          <div className="w-full lg:w-1/2 relative h-[500px]">
            <motion.div 
              variants={FADE_UP} 
              className="absolute top-0 right-[20%] w-[55%] h-[400px] border border-[#d7d7d7]"
            >
              <img src={heroImage1} className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-700" alt="Look 1" />
            </motion.div>
            <motion.div 
              variants={FADE_UP} 
              className="absolute top-[100px] right-0 w-[45%] h-[350px] border border-[#d7d7d7] z-10"
            >
              <img src={heroImage2} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Look 2" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 2. NEW THIS WEEK */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 border-t border-[#d7d7d7]">
        <div className="flex justify-between items-end mb-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{once:true}} variants={FADE_UP}>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter">
              NEW<br />THIS WEEK
            </h2>
          </motion.div>
          <Link to="/shop" className="text-sm font-semibold tracking-widest uppercase text-[#5e5e5e] hover:text-black border-b border-[#5e5e5e] pb-1">
            See All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
             Array.from({length: 4}).map((_, i) => (
                <div key={i} className="card h-[400px] w-full animate-pulse bg-[#eaeaea]"></div>
             ))
          ) : featuredProducts.length > 0 ? (
             featuredProducts.slice(0,4).map((product, idx) => (
               <motion.div 
                 key={product._id} 
                 initial={{ opacity: 0, y: 20 }} 
                 whileInView={{ opacity: 1, y: 0 }} 
                 transition={{ delay: idx * 0.1 }}
                 viewport={{ once: true }}
                 className="group"
               >
                 <Link to={`/shop/${product._id}`} className="block relative border border-[#d7d7d7] h-[340px] bg-white overflow-hidden mb-4">
                   {product.images?.[0] ? (
                     <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full bg-[#f5f5f5]" />
                   )}
                   <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 group-hover:bottom-4 transition-all duration-300">
                     <span className="bg-white border border-[#a3a3a3] w-8 h-8 flex items-center justify-center rounded-sm">
                       <Plus size={16} />
                     </span>
                   </div>
                 </Link>
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-[11px] font-bold text-[#8a8a8a] uppercase mb-1">{product.category}</p>
                     <h3 className="text-sm font-semibold capitalize max-w-[200px] truncate">{product.name}</h3>
                   </div>
                   <p className="font-bold">₹{product.price}</p>
                 </div>
               </motion.div>
             ))
          ) : (
             <div className="col-span-full py-20 text-center text-[#8a8a8a] border border-[#d7d7d7] uppercase tracking-widest text-sm">
               No inventory loaded
             </div>
          )}
        </div>
      </section>

      {/* 3. XIV COLLECTIONS 23-24 */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{once:true}} variants={FADE_UP} className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter mb-8">
            XIV<br/>COLLECTIONS<br/>26-27
          </h2>
          
          {/* Brutalist Filter Navigation */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#a3a3a3] pb-4">
            <div className="flex space-x-8 uppercase tracking-widest text-sm font-semibold">
              <Link to="/shop" className="text-black border-b-2 border-black pb-1 hover:text-gray-600">(ALL)</Link>
              <Link to="/shop?category=Men" className="text-[#8a8a8a] hover:text-black transition-colors">MEN</Link>
              <Link to="/shop?category=Women" className="text-[#8a8a8a] hover:text-black transition-colors">WOMEN</Link>
              <Link to="/shop" className="text-[#8a8a8a] hover:text-black transition-colors">KID</Link>
            </div>
            <div className="flex space-x-12 uppercase tracking-widest text-xs">
              <span className="cursor-pointer">Filters (+)</span>
              <span className="cursor-pointer">Sorts (-)</span>
            </div>
          </div>
        </motion.div>

        {/* Large structural grid from Figma dynamically expanding */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {allCollections.slice(0, showCount).map((item, i) => (
             <motion.div key={i} initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay: (i % 3)*0.2}}>
               <Link to="/shop" className="block border border-[#d7d7d7] h-[450px] mb-4 bg-white relative overflow-hidden group">
                 <img src={item.img} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-500" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
               </Link>
               <div className="flex justify-between items-start text-sm px-1">
                 <div>
                   <p className="text-[11px] text-[#8a8a8a] uppercase mb-1">Cotton Blend</p>
                   <Link to="/shop" className="font-semibold hover:underline">{item.name}</Link>
                 </div>
                 <p className="font-bold">{item.price}</p>
               </div>
             </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          {showCount < allCollections.length ? (
            <button 
              onClick={() => setShowCount(allCollections.length)}
              className="flex items-center gap-2 text-sm uppercase tracking-widest text-[#8a8a8a] hover:text-black cursor-pointer transition-colors"
            >
              More <ChevronDown size={16} />
            </button>
          ) : (
            <Link to="/shop" className="flex items-center gap-2 text-sm uppercase tracking-widest text-black border-b border-black pb-1 hover:text-[#5e5e5e] hover:border-[#5e5e5e] transition-colors">
              Explore Full Shop <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {/* 4. BRAND PHILOSOPHY / LOOKBOOK SECTION */}
      <section className="py-32 border-t border-[#d7d7d7] mt-12 bg-white relative">
        <div className="absolute inset-0 bg-noise pointer-events-none opacity-50" />
        <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10 mb-24">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{once:true}} variants={FADE_UP}
            className="text-3xl md:text-5xl font-black uppercase tracking-widest leading-snug text-center mx-auto"
          >
            OUR APPROACH TO FASHION DESIGN
          </motion.h2>
          <motion.p 
            initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:0.3}} viewport={{once:true}}
            className="mt-8 text-black uppercase text-xs sm:text-sm tracking-[0.2em] leading-loose max-w-3xl mx-auto opacity-80"
          >
            at elegant vogue , we blend creativity with craftsmanship to create fashion that transcends trends and stands the test of time. each design is meticulously crafted, ensuring the highest quality exquisite finish.
          </motion.p>
        </div>

        {/* Masonry / Staggered Lookbook Layout */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10 h-[600px] hidden md:block">
          <motion.div initial={{y:50, opacity:0}} whileInView={{y:0, opacity:1}} transition={{delay:0.1}} viewport={{once:true}} className="absolute top-[10%] left-[5%] w-[30%] h-[400px] border border-[#d7d7d7]">
            <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80" alt="Lookbook 1" className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div initial={{y:50, opacity:0}} whileInView={{y:0, opacity:1}} transition={{delay:0.3}} viewport={{once:true}} className="absolute top-[30%] left-[38%] w-[25%] h-[420px] border border-[#d7d7d7] z-20">
            <img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80" alt="Lookbook 2" className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div initial={{y:50, opacity:0}} whileInView={{y:0, opacity:1}} transition={{delay:0.5}} viewport={{once:true}} className="absolute top-0 right-[5%] w-[28%] h-[390px] border border-[#d7d7d7]">
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80" alt="Lookbook 3" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

    </div>
  );
}
