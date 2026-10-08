window.initShopCategories = async () => {
  const first = document.querySelector('.cat-btn');
  const container = first?.parentElement;
  if (!container || !window.NellaiApi) return;
  const fallback = container.innerHTML;
  try {
    const categories = await window.NellaiApi.request('categories/get.php');
    const active = categories.filter(c => String(c.status || '').toLowerCase() === 'active');
    container.replaceChildren();
    const add = (id, name, image) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cat-btn group flex flex-col items-center shrink-0 text-center cursor-pointer'; b.dataset.categoryId = id; b.innerHTML = `<div class="cat-circle-img w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-[#B88932]/30 shadow-sm bg-[#EFE4D2]"><img src="${image || '../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png'}" alt="${name}" class="w-full h-full object-cover rounded-full"></div><span class="cat-label mt-3 text-xs sm:text-sm font-bold text-[#786153]">${name}</span>`; b.onclick = () => window.loadShopProducts(id); container.appendChild(b); };
    add('', 'All', '../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png');
    active.forEach(c => add(c.id, c.name, c.image || c.image_url || c.category_image));
  } catch (error) { console.error('[Shop] Categories API failed:', error); container.innerHTML = fallback; }
};
