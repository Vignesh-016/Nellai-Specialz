window.initShopCategories = async () => {
  const first = document.querySelector('.cat-btn');
  const container = first?.parentElement;
  if (!container || !window.NellaiApi) return;
  const fallback = container.innerHTML;
  try {
    const categories = await window.NellaiApi.request('categories/get.php');
    const active = categories.filter(c => String(c.status || '').toLowerCase() === 'active');
    container.replaceChildren();
    const add = (id, name, image) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'cat-btn group flex flex-col items-center shrink-0 text-center cursor-pointer'; b.dataset.categoryId = id; b.innerHTML = `<div class="cat-circle-img w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-[#EADBC1] shadow-xs bg-[#FFFBF5]"><img src="${image || '../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png'}" alt="${name}" class="w-full h-full object-cover rounded-full"></div><span class="cat-label mt-3 text-xs sm:text-sm font-bold text-[#806B58] group-hover:text-[#8C1C13]">${name}</span>`; b.onclick = () => window.loadShopProducts(id); container.appendChild(b); };
    add('', 'All', '../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png');
    active.forEach(c => { const raw = c.image_url || c.image || c.category_image || ''; const image = /^https?:\/\//i.test(raw) ? raw : `https://backend.nellaispecialz.com/${String(raw).replace(/^\/+/, '')}`; add(c.id, c.name, image); });
  } catch (error) { console.error('[Shop] Categories API failed:', error); container.innerHTML = fallback; }
};
