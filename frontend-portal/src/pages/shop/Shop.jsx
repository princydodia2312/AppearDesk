import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingBag, ChevronDown, ChevronUp, Filter, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import useCartStore from '../../store/cart.store';

/* ─── Constants ─── */
const CATEGORY_CHIPS = [
  "New", "Best Sellers", "Shirts", "Polo Shirts", "Shorts",
  "Suits", "T-Shirts", "Jeans", "Jackets", "Coats"
];

const SIDEBAR_CATEGORIES = ["Men", "Women", "Unisex"];

const PRICE_RANGES = [
  { label: "Under ₹500",     min: 0,    max: 499 },
  { label: "₹500 – ₹999",    min: 500,  max: 999 },
  { label: "₹1,000 – ₹1,299", min: 1000, max: 1299 },
  { label: "₹1,300 – ₹1,500", min: 1300, max: 1500 },
  { label: "Above ₹1,500",   min: 1501, max: 99999 },
];

const SIZES = ["XS", "S", "M", "L", "XL", "2X"];

/* ─── Reusable Accordion ─── */
const FilterAccordion = ({ title, children, defaultOpen = false, count }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#d7d7d7] py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full uppercase tracking-[2px] text-[13px] font-bold text-black group"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && <span className="text-[10px] font-bold text-[#000e8a]">({count})</span>}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 px-1 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Checkbox Component ─── */
const FilterCheckbox = ({ label, checked, onChange, count }) => (
  <div onClick={onChange} className="flex items-center justify-between cursor-pointer group py-1.5 select-none">
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 border flex items-center justify-center transition-all duration-200 ${checked ? 'bg-black border-black' : 'border-[#a3a3a3] group-hover:border-black'}`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <span className={`text-[12px] uppercase tracking-[1px] transition-colors ${checked ? 'text-black font-medium' : 'text-[#8a8a8a] group-hover:text-black'}`}>{label}</span>
    </div>
    {count !== undefined && <span className="text-[11px] font-bold text-[#000e8a]">({count})</span>}
  </div>
);

/* ─── Main Component ─── */
export default function Shop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [addedProductId, setAddedProductId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filter states
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [availability, setAvailability] = useState('all'); // 'all' | 'inStock' | 'outOfStock'
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null); // index into PRICE_RANGES
  const [selectedChip, setSelectedChip] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high' | 'name'

  const addItem = useCartStore((state) => state.addItem);

  // Build API params from filter state
  const apiParams = useMemo(() => {
    const params = {};
    const search = searchParams.get('search');
    if (search) params.search = search;
    
    // Category
    if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    } 
    
    // Collections / Chip filter
    if (selectedChip && ['Jeans', 'Jackets', 'Shirts', 'Coats', 'Shorts', 'Suits', 'T-Shirts', 'Polo Shirts'].includes(selectedChip)) {
      // Map plural UI names to singular search terms which exist in DB
      const chipToSearchMap = {
        'Jackets': 'Jacket',
        'Shirts': 'Shirt',
        'Coats': 'Coat',
        'Suits': 'Suit',
        'T-Shirts': 'T-Shirt',
        'Polo Shirts': 'Polo',
        'Jeans': 'Jeans', // Jeans is plural in DB too
        'Shorts': 'Short',
      };
      
      // If user also typed a custom search, combine them or let chip override. 
      // Overriding is safer for exact matches.
      params.search = chipToSearchMap[selectedChip] || selectedChip;
    }

    // Availability
    if (availability === 'inStock') params.inStock = 'true';
    if (availability === 'outOfStock') params.inStock = 'false';

    // Price range
    if (selectedPriceRange !== null) {
      const range = PRICE_RANGES[selectedPriceRange];
      params.minPrice = range.min;
      params.maxPrice = range.max;
    }

    // Featured filter for special chips
    if (selectedChip === 'Best Sellers') params.isFeatured = 'true';
    if (selectedChip === 'New') params.isFeatured = 'true';

    return params;
  }, [searchParams, selectedCategory, availability, selectedPriceRange, selectedChip]);

  // Fetch products (filtered)
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', apiParams],
    queryFn: () => api.get('/products', { params: { ...apiParams, limit: 50 } }).then(r => r.data)
  });

  // Fetch stats (unfiltered by sidebar, only search)
  const { data: statsData } = useQuery({
    queryKey: ['products-stats', searchParams.get('search')],
    queryFn: () => api.get('/products', { params: { search: searchParams.get('search') || undefined, limit: 100 } }).then(r => r.data)
  });

  const allProducts = data?.data || [];
  const allStatsProducts = statsData?.data || [];

  // Client-side sort (backend returns unsorted)
  const products = useMemo(() => {
    let sorted = [...allProducts];
    switch (sortBy) {
      case 'price-low':  sorted.sort((a, b) => a.price - b.price); break;
      case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
      case 'name':       sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    }
    return sorted;
  }, [allProducts, sortBy]);

  // Compute counts for sidebar display (using stats products)
  const counts = useMemo(() => {
    const inStock = allStatsProducts.filter(p => p.stock > 0).length;
    const outOfStock = allStatsProducts.filter(p => p.stock === 0).length;
    const categories = {};
    allStatsProducts.forEach(p => {
      if (p.category) categories[p.category] = (categories[p.category] || 0) + 1;
    });
    return { inStock, outOfStock, total: allStatsProducts.length, categories };
  }, [allStatsProducts]);

  // Active filter count for badge
  const activeFilterCount = [
    selectedCategory !== 'All',
    selectedSizes.length > 0,
    availability !== 'all',
    selectedPriceRange !== null,
    selectedChip !== '',
  ].filter(Boolean).length;

  /* ─── Handlers ─── */
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addItem(product, 1);
    setAddedProductId(product._id);
    setTimeout(() => setAddedProductId(null), 1000);
  };

  const toggleSize = (size) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const handleCategoryClick = (cat) => {
    const newCat = selectedCategory === cat ? 'All' : cat;
    setSelectedCategory(newCat);
  };

  const handleChipClick = (chip) => {
    setSelectedChip(prev => prev === chip ? '' : chip);
  };

  const handleSearch = () => {
    setSearchParams(p => {
      if (searchInput.trim()) p.set('search', searchInput.trim());
      else p.delete('search');
      return p;
    });
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSizes([]);
    setAvailability('all');
    setSelectedPriceRange(null);
    setSelectedChip('');
    setSortBy('newest');
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white font-['Outfit',sans-serif]">
      <div className="fixed inset-0 bg-noise pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-[12px] uppercase tracking-[1px] text-[#8a8a8a] mb-2 px-1">
          <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span className="text-black font-semibold">Products</span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-[1px] mb-12">Products</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* MOBILE FILTER TOGGLE */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-black px-4 py-2 uppercase text-xs font-bold w-max mb-6 relative"
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* ─── LEFT SIDEBAR ─── */}
          <aside className={`
            fixed inset-0 z-[100] bg-white p-8 overflow-y-auto lg:p-0 lg:relative lg:inset-auto lg:z-10 lg:w-64 lg:shrink-0 lg:block
            ${isSidebarOpen ? 'block' : 'hidden'}
          `}>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-6 right-6">
              <X size={24} />
            </button>

            <div className="sticky top-12 space-y-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[16px] font-black uppercase tracking-[2px]">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] uppercase tracking-[1px] text-[#8a8a8a] hover:text-black underline">
                    Clear All
                  </button>
                )}
              </div>
              
              {/* SIZE */}
              <div className="mb-6 pb-6 border-b border-[#d7d7d7]">
                <h3 className="text-[14px] font-bold uppercase tracking-[2px] mb-4">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map(s => (
                    <button 
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`h-10 border text-[13px] font-medium transition-all duration-200
                        ${selectedSizes.includes(s) ? 'bg-black text-white border-black' : 'border-[#a3a3a3] text-black hover:border-black'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* AVAILABILITY */}
              <FilterAccordion title="Availability" defaultOpen={true}>
                <div className="space-y-1">
                  <FilterCheckbox 
                    label="In Stock" 
                    checked={availability === 'inStock'} 
                    onChange={() => setAvailability(prev => prev === 'inStock' ? 'all' : 'inStock')} 
                    count={counts.inStock}
                  />
                  <FilterCheckbox 
                    label="Out Of Stock" 
                    checked={availability === 'outOfStock'} 
                    onChange={() => setAvailability(prev => prev === 'outOfStock' ? 'all' : 'outOfStock')} 
                    count={counts.outOfStock}
                  />
                </div>
              </FilterAccordion>

              {/* CATEGORY */}
              <FilterAccordion title="Category" defaultOpen={true}>
                <div className="space-y-1">
                  {SIDEBAR_CATEGORIES.map(cat => (
                    <FilterCheckbox
                      key={cat}
                      label={cat}
                      checked={selectedCategory === cat}
                      onChange={() => handleCategoryClick(cat)}
                      count={counts.categories[cat] || 0}
                    />
                  ))}
                </div>
              </FilterAccordion>

              {/* PRICE RANGE */}
              <FilterAccordion title="Price Range" defaultOpen={false}>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range, i) => (
                    <FilterCheckbox
                      key={i}
                      label={range.label}
                      checked={selectedPriceRange === i}
                      onChange={() => setSelectedPriceRange(prev => prev === i ? null : i)}
                    />
                  ))}
                </div>
              </FilterAccordion>

              {/* COLLECTIONS (maps to category chips) */}
              <FilterAccordion title="Collections" defaultOpen={false}>
                <div className="space-y-1">
                  {["Jackets", "Jeans", "Shirts", "Coats"].map(col => (
                    <FilterCheckbox
                      key={col}
                      label={col}
                      checked={selectedChip === col}
                      onChange={() => handleChipClick(col)}
                    />
                  ))}
                </div>
              </FilterAccordion>

              {/* TAGS */}
              <FilterAccordion title="Tags" defaultOpen={false}>
                <div className="flex flex-wrap gap-2">
                  {["Featured", "New Arrival", "Sale", "Premium", "Casual", "Streetwear"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (tag === 'Featured' || tag === 'New Arrival') {
                          setSelectedChip(prev => prev === 'Best Sellers' ? '' : 'Best Sellers');
                        }
                      }}
                      className={`px-3 py-1.5 border text-[10px] uppercase tracking-[1px] font-medium transition-all
                        ${(tag === 'Featured' && selectedChip === 'Best Sellers') 
                          ? 'bg-black text-white border-black' 
                          : 'border-[#a3a3a3] text-[#8a8a8a] hover:border-black hover:text-black'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </FilterAccordion>

              {/* SORT (as Ratings section — repurposed for UX) */}
              <FilterAccordion title="Sort By" defaultOpen={false}>
                <div className="space-y-1">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price-low', label: 'Price: Low → High' },
                    { value: 'price-high', label: 'Price: High → Low' },
                    { value: 'name', label: 'Name: A → Z' },
                  ].map(opt => (
                    <FilterCheckbox
                      key={opt.value}
                      label={opt.label}
                      checked={sortBy === opt.value}
                      onChange={() => setSortBy(opt.value)}
                    />
                  ))}
                </div>
              </FilterAccordion>
            </div>
          </aside>

          {/* ─── MAIN CONTENT ─── */}
          <main className="flex-1 min-w-0">
            {/* SEARCH & CHIP GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12 items-start">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#8a8888b6]" />
                </div>
                <input 
                  type="text"
                  placeholder="SEARCH"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-[#dddddd] border-none px-12 py-4 h-[56px] text-xs uppercase tracking-[2px] font-medium focus:ring-1 focus:ring-black outline-none"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(''); setSearchParams(p => { p.delete('search'); return p; }); }} className="absolute inset-y-0 right-4 flex items-center">
                    <X size={14} className="text-[#8a8a8a] hover:text-black" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {CATEGORY_CHIPS.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => handleChipClick(cat)}
                    className={`border px-2 py-1 text-[10px] uppercase tracking-[1px] font-medium transition-all min-h-[40px] flex items-center justify-center text-center leading-tight
                      ${selectedChip === cat ? 'bg-black text-white border-black' : 'border-[#a3a3a3] text-black hover:border-black'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-[10px] uppercase tracking-[2px] text-[#8a8a8a] mr-2">Active:</span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-[10px] uppercase tracking-[1px]">
                    {selectedCategory} <X size={10} className="cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </span>
                )}
                {selectedChip && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-[10px] uppercase tracking-[1px]">
                    {selectedChip} <X size={10} className="cursor-pointer" onClick={() => setSelectedChip('')} />
                  </span>
                )}
                {availability !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-[10px] uppercase tracking-[1px]">
                    {availability === 'inStock' ? 'In Stock' : 'Out of Stock'} <X size={10} className="cursor-pointer" onClick={() => setAvailability('all')} />
                  </span>
                )}
                {selectedPriceRange !== null && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-[10px] uppercase tracking-[1px]">
                    {PRICE_RANGES[selectedPriceRange].label} <X size={10} className="cursor-pointer" onClick={() => setSelectedPriceRange(null)} />
                  </span>
                )}
                <button onClick={clearFilters} className="text-[10px] uppercase tracking-[1px] text-[#8a8a8a] hover:text-black underline ml-2">
                  Clear All
                </button>
              </div>
            )}

            {/* Result count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] uppercase tracking-[2px] text-[#8a8a8a]">
                {isLoading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* PRODUCT GRID */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-100 aspect-[3/4] mb-4 border border-[#d9d9d9]" />
                    <div className="h-4 bg-gray-100 w-1/3 mb-2" />
                    <div className="h-6 bg-gray-100 w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-[#d7d7d7]">
                <ShoppingBag className="mx-auto h-12 w-12 text-[#d7d7d7] mb-4" />
                <h3 className="text-lg font-bold uppercase tracking-widest mb-2">No Items Found</h3>
                <p className="text-sm text-[#8a8a8a] mb-8">Try adjusting your filters or search term.</p>
                <button onClick={clearFilters} className="border border-black px-8 py-3 uppercase text-xs font-bold hover:bg-black hover:text-white transition-colors">Clear All</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {products.map(p => (
                  <motion.div 
                    key={p._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <div 
                      className="relative aspect-[4/5] bg-white border border-[#d9d9d9] overflow-hidden cursor-pointer mb-6"
                      onClick={() => navigate(`/shop/${p._id}`)}
                    >
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#fafafa]">
                          <ShoppingBag size={48} className="text-[#eeeeee]" />
                        </div>
                      )}

                      {/* Out of Stock Overlay */}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="uppercase text-xs font-bold tracking-[3px] text-[#8a8a8a]">Sold Out</span>
                        </div>
                      )}

                      {/* Compare price badge */}
                      {p.compareAtPrice > p.price && (
                        <span className="absolute top-3 left-3 bg-black text-white text-[10px] uppercase tracking-[1px] font-bold px-2 py-1">
                          {Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}% Off
                        </span>
                      )}

                      {/* Low stock indicator */}
                      {p.stock > 0 && p.stock < 10 && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] uppercase tracking-[1px] font-bold px-2 py-1">
                          Only {p.stock} left
                        </span>
                      )}

                      {/* Quick Add */}
                      {p.stock > 0 && (
                        <button 
                          onClick={(e) => handleAddToCart(e, p)}
                          className={`absolute bottom-0 left-0 right-0 py-4 uppercase text-xs font-bold tracking-[2px] transition-all transform translate-y-full group-hover:translate-y-0
                            ${addedProductId === p._id ? 'bg-green-600 text-white' : 'bg-black/90 text-white hover:bg-black'}`}
                        >
                          {addedProductId === p._id ? 'Added to Cart ✓' : 'Quick Add +'}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 px-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] uppercase tracking-[1px] text-[rgba(0,0,0,0.66)] font-medium">{p.category}</span>
                        {p.stock > 0 ? (
                          <span className="text-[10px] text-[rgba(0,0,0,0.4)]">In Stock</span>
                        ) : (
                          <span className="text-[10px] text-red-500 font-medium">Sold Out</span>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.5px] leading-tight flex-1">{p.name}</h3>
                        <div className="text-right shrink-0">
                          <p className="text-[14px] font-bold whitespace-nowrap">₹{p.price?.toLocaleString('en-IN')}</p>
                          {p.compareAtPrice > p.price && (
                            <p className="text-[11px] text-[#8a8a8a] line-through">₹{p.compareAtPrice?.toLocaleString('en-IN')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
