<?php
/**
 * Header Partial
 * Nellai Specialz Backend Architecture
 */
?>
<!-- Top Announcement Bar -->
<div class="bg-[#32110D] text-[#D9B86C] text-xs font-semibold uppercase tracking-[0.18em] py-2 px-4 border-b border-[#B88932]/20">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
    <div class="flex items-center space-x-3 text-xs">
      <a href="https://instagram.com" target="_blank" rel="noopener" class="hover:text-white transition-colors" aria-label="Instagram">
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
      </a>
      <a href="https://facebook.com" target="_blank" rel="noopener" class="hover:text-white transition-colors" aria-label="Facebook">
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener" class="hover:text-white transition-colors" aria-label="YouTube">
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
      </a>
    </div>
    
    <div class="flex items-center space-x-2 text-[11px] sm:text-xs text-center tracking-[0.15em]">
      <span>❖</span>
      <span>Freshly Prepared Traditional Halwa</span>
      <span>❖</span>
      <span class="text-[#F5E6C8]">Festival Offers Live Now</span>
      <span>❖</span>
    </div>

    <div class="hidden sm:flex items-center space-x-4 text-[11px] uppercase">
      <a href="#story" class="hover:text-white transition-colors">About Us</a>
      <span>|</span>
      <a href="#contact" class="hover:text-white transition-colors">Contact Us</a>
    </div>
  </div>
</div>

<!-- Main Sticky Header -->
<header class="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#B88932]/20 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
    
    <!-- Mobile Menu Button -->
    <button id="mobileMenuBtn" class="lg:hidden p-2 text-[#32110D] hover:text-[#B88932] focus:outline-none" aria-label="Toggle navigation">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>

    <!-- Navigation Left -->
    <nav class="hidden lg:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#32110D]">
      <a href="#hero" class="hover:text-[#B88932] transition-colors py-1 border-b-2 border-transparent hover:border-[#B88932]">Home</a>
      <a href="#story" class="hover:text-[#B88932] transition-colors py-1 border-b-2 border-transparent hover:border-[#B88932]">Our Story</a>
      <div class="relative group">
        <a href="#product" class="hover:text-[#B88932] transition-colors py-1 flex items-center space-x-1 border-b-2 border-transparent hover:border-[#B88932]">
          <span>Shop</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>
      <a href="#combos" class="hover:text-[#B88932] transition-colors py-1 border-b-2 border-transparent hover:border-[#B88932]">Halwa Combos</a>
    </nav>

    <!-- Center Brand Logo -->
    <a href="index.html" class="flex flex-col items-center group text-center mx-auto lg:mx-0">
      <div class="w-8 h-8 mb-1 flex items-center justify-center text-[#B88932]">
        <!-- Royal Crown Emblem SVG -->
        <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
        </svg>
      </div>
      <span class="font-serif text-xl sm:text-2xl font-bold tracking-widest text-[#32110D] group-hover:text-[#B88932] transition-colors">
        NELLAI <span class="text-[#B88932]">SPECIALZ</span>
      </span>
      <span class="text-[9px] uppercase tracking-[0.25em] text-[#8C6D3F] font-semibold">Traditional Sweets & Snacks</span>
    </a>

    <!-- Header Actions Right -->
    <div class="flex items-center space-x-4 sm:space-x-6 text-[#32110D]">
      <!-- Search Input Box -->
      <div class="hidden md:flex items-center relative">
        <input type="text" placeholder="Search for Halwa..." class="w-48 lg:w-60 bg-[#F7F1E5] border border-[#B88932]/30 rounded-full py-1.5 pl-4 pr-9 text-xs focus:outline-none focus:border-[#B88932] text-[#32110D] placeholder-[#A38A68]">
        <button class="absolute right-2.5 text-[#B88932] hover:text-[#32110D] search-trigger" aria-label="Search">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </button>
      </div>

      <!-- Search Mobile Icon -->
      <button class="md:hidden search-trigger text-[#32110D] hover:text-[#B88932]" aria-label="Search">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </button>

      <!-- Wishlist -->
      <a href="#wishlist" class="relative text-[#32110D] hover:text-[#B88932] transition-colors" aria-label="Wishlist">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z"/>
        </svg>
        <span class="absolute -top-1.5 -right-2 bg-[#B88932] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
      </a>

      <!-- User Account -->
      <a href="#account" class="text-[#32110D] hover:text-[#B88932] transition-colors" aria-label="Account">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </a>

      <!-- Shopping Cart -->
      <a href="#cart" class="relative text-[#32110D] hover:text-[#B88932] transition-colors flex items-center" aria-label="Cart">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L20.5 8H6"/>
          <circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>
        </svg>
        <span class="cart-badge absolute -top-1.5 -right-2 bg-[#5A160F] text-[#F5E6C8] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
      </a>
    </div>
  </div>
</header>
