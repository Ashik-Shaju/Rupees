// Store configuration
const Store = {
    getProducts: () => JSON.parse(localStorage.getItem('rupees_products') || '[]'),
    saveProducts: (products) => localStorage.setItem('rupees_products', JSON.stringify(products)),

    getHistory: () => JSON.parse(localStorage.getItem('rupees_history') || '[]'),
    saveHistory: (history) => localStorage.setItem('rupees_history', JSON.stringify(history)),

    // In-memory checkout cart
    cart: [],
    checkoutRemarks: ''
};

// UI Elements
const contentContainer = document.getElementById('app-content');
const navItems = document.querySelectorAll('.nav-item');
const modalContainer = document.getElementById('modal-container');

// Views content
const views = {
    checkout: `
        <div class="view active" id="view-checkout">
            <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-muted)">Products</h2>
            <div style="position: relative; margin-bottom: 8px; margin-right: 6px;">
                <input type="text" id="search-checkout" class="form-control" placeholder="Search products..." style="padding-left: 36px; border-radius: 99px; background: var(--surface-color);">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div id="checkout-category-chips" style="display:flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 4px; scrollbar-width: none; -ms-overflow-style: none;"></div>
            <div id="checkout-product-list" style="overflow-y: auto; flex: 1; padding-right: 6px;"></div>
            
            <!-- Bottom Sheet for Totals -->
            <div id="checkout-totals-sheet" style="background: var(--surface-color); border-top: 1px solid var(--border-color); border-radius: 16px 16px 0 0; padding: 1rem; box-shadow: 0 -4px 10px rgba(0,0,0,0.05); margin: 0 -1rem -1rem -1rem;">
                <input type="text" id="checkout-remarks" class="form-control" style="margin-bottom: 1rem; font-size: 0.9rem; padding: 0.5rem;" placeholder="Remarks (optional, e.g. buyer's name)">
                <div style="display:flex; flex-wrap:wrap; gap: 8px; margin-bottom: 1rem; max-height: 100px; overflow-y: auto; padding-right: 6px;" id="checkout-pills">
                    <!-- Pills go here -->
                </div>
                <div class="flex-between" style="align-items: center;">
                    <span style="font-size: 1.5rem; font-weight: 700;">Total = <span id="checkout-total-price" style="color: var(--accent-primary)">₹0</span></span>
                    <div id="checkout-actions-container" style="display: none; gap: 16px;">
                        <button class="btn" style="width: auto; padding: 0.5rem 1rem; border-radius: 99px; background: rgba(244, 67, 54, 0.1); color: var(--danger-color); border: 1px solid var(--danger-color);" id="btn-clear-cart">Clear</button>
                        <button class="btn btn-primary" style="width: auto; padding: 0.5rem 1.5rem; border-radius: 99px;" id="btn-save-transaction">Ok</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    history: `
        <div class="view active" id="view-history">
            <div id="history-dashboard-container">
                <div class="dashboard-scroller" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; padding-bottom: 8px; margin-left: -1rem; margin-right: -1rem; padding-left: 1rem; padding-right: 1rem;">
                    <div class="dashboard-filter-chip active" id="filter-sales" style="border-color: var(--dash-orange); background: var(--dash-orange-light);">
                        <div class="dash-title" style="color: var(--dash-orange);">Total Sales</div>
                        <div class="dash-value" id="val-sales">₹0</div>
                    </div>
                    <div class="dashboard-filter-chip" id="filter-net" style="border-color: var(--border-color); background: var(--surface-color);">
                        <div class="dash-title" style="color: var(--dash-yellow);">Net Received</div>
                        <div class="dash-value" id="val-net">₹0</div>
                    </div>
                    <div class="dashboard-filter-chip" id="filter-pending" style="border-color: var(--border-color); background: var(--surface-color);">
                        <div class="dash-title" style="color: var(--dash-red);">Pending Balance</div>
                        <div class="dash-value" id="val-pending">₹0</div>
                    </div>
                    <div class="dashboard-filter-chip" id="filter-return" style="border-color: var(--border-color); background: var(--surface-color);">
                        <div class="dash-title" style="color: var(--dash-blue);">Return Amount</div>
                        <div class="dash-value" id="val-return">₹0</div>
                    </div>
                    <div class="dashboard-filter-chip" id="filter-savings" style="border-color: var(--border-color); background: var(--surface-color);">
                        <div class="dash-title" style="color: var(--dash-green);">Savings</div>
                        <div class="dash-value" id="val-savings">₹0</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-toggle-handle" id="history-dash-toggle">
                <div class="handle-bar"></div>
                <div class="handle-text" id="dash-toggle-text">Swipe up to Hide Summary</div>
            </div>

            <div style="margin-bottom: 0.2rem; text-align: center;">
                <h2 style="font-size: 1.1rem; margin-bottom: 0.2rem; color: var(--text-muted); width: 100%;">Transactions</h2>
            </div>
            
            <div id="active-filters-chips" style="display:flex; gap: 6px; overflow-x: auto; margin-bottom: 0.4rem; padding-bottom: 2px; scrollbar-width: none;"></div>
            
            <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; flex-wrap: wrap;">
                <div style="display: flex; gap: 8px; align-items: center; flex: 1; min-width: 0;">
                    <button id="btn-history-filter" style="background:var(--surface-color); border:1px solid var(--border-color); display:flex; align-items:center; gap:6px; font-weight:600; font-size:0.85rem; cursor:pointer; color:var(--text-main); padding: 8px 14px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); flex: 1; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        Filter
                    </button>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="date" id="history-date-picker" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; z-index: -1;">
                        <button id="btn-history-calendar" style="background:var(--surface-color); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--text-main); padding:8px 12px; border-radius: 8px; position: relative; z-index: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex: 1.2; justify-content: flex-end;">
                    <button id="btn-toggle-history-select-all" style="background:var(--surface-color); border:1px solid var(--border-color); font-weight:600; font-size:0.85rem; cursor:pointer; color:var(--text-main); display:none; padding: 8px 14px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); flex: 1;">Select All</button>
                    <button id="btn-toggle-history-select" style="background:var(--accent-light); border:1px solid var(--accent-primary); font-weight:600; font-size:0.85rem; cursor:pointer; color:var(--accent-primary); display:none; padding: 8px 14px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); flex: 1;">Select</button>
                </div>
            </div>
            <div id="history-list" style="overflow-y: auto; flex: 1; padding-bottom: 80px; padding-right: 6px;"></div>
        </div>
    `,
    products: `
        <div class="view active" id="view-products" style="position: relative;">
            <div class="flex-between" style="margin-bottom: 0.5rem;">
                <h2 style="font-size: 1.1rem; color: var(--text-muted)">Products</h2>
                <div style="display: flex; gap: 12px; align-items: center; padding-right: 8px;">
                    <button id="btn-toggle-select-all" style="background:var(--surface-color); border:1px solid var(--border-color); font-weight:600; font-size:0.85rem; cursor:pointer; color:var(--text-main); display:none; padding: 6px 12px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Select All</button>
                    <button id="btn-toggle-select" style="background:var(--accent-light); border:1px solid var(--accent-primary); font-weight:600; font-size:0.85rem; cursor:pointer; color:var(--accent-primary); padding: 6px 12px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Select</button>
                </div>
            </div>
            <div style="position: relative; margin-bottom: 8px; margin-right: 6px;">
                <input type="text" id="search-products" class="form-control" placeholder="Search products..." style="padding-left: 36px; border-radius: 99px; background: var(--surface-color);">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div id="products-category-chips" style="display:flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 4px; scrollbar-width: none; -ms-overflow-style: none;"></div>
            <div id="products-list-container" style="overflow-y: auto; flex: 1; padding-right: 6px; padding-bottom: 80px;"></div>
            <button class="fab" id="fab-add-product">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
        </div>
    `
};

// Initialize App
function init() {
    let initialTab = 'checkout';
    if (location.hash) {
        const hashTab = location.hash.substring(1);
        if (['checkout', 'products', 'history'].includes(hashTab)) {
            initialTab = hashTab;
        }
    }

    if (!history.state || history.state.appState !== 'tab') {
        history.replaceState({ appState: 'tab', tab: initialTab }, '', '#' + initialTab);
    }

    navItems.forEach(n => n.classList.remove('active'));
    const initialNav = document.querySelector(`.nav-item[data-tab="${initialTab}"]`);
    if (initialNav) initialNav.classList.add('active');

    loadTab(initialTab);

    // Tab switching listener
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            if (history.state && history.state.tab === tab) return;

            navItems.forEach(n => n.classList.remove('active'));
            e.currentTarget.classList.add('active');

            history.pushState({ appState: 'tab', tab: tab }, '', '#' + tab);
            loadTab(tab);
        });
    });
}

function loadTab(tabId) {
    window.currentActiveTab = tabId;
    contentContainer.innerHTML = views[tabId];

    // After HTML is injected, we need to initialize functionality for that view
    setTimeout(() => {
        if (tabId === 'products') initProductsTab();
        if (tabId === 'checkout') initCheckoutTab();
        if (tabId === 'history') initHistoryTab();
    }, 0);
}

// ==========================================
// PRODUCTS TAB LOGIC
// ==========================================
function initProductsTab() {
    const fabButton = document.getElementById('fab-add-product');
    const listContainer = document.getElementById('products-list-container');
    const searchInput = document.getElementById('search-products');

    fabButton.addEventListener('click', () => openProductModal());

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderProductsList(listContainer, e.target.value, window.activeProductCategory);
        });
    }

    renderProductsList(listContainer, searchInput ? searchInput.value : '', window.activeProductCategory);
}

function renderProductsList(container, searchQuery = '', activeCategory = 'All') {
    // Keep track of state
    window.selectedProductIds = window.selectedProductIds || new Set();
    window.isSelectMode = window.isSelectMode || false;
    window.activeProductCategory = activeCategory;

    const products = Store.getProducts();

    // Ensure bulk action bar exists
    if (!document.getElementById('bulk-action-bar')) {
        const bar = document.createElement('div');
        bar.id = 'bulk-action-bar';
        bar.className = 'bulk-action-bar';
        bar.style.cssText = 'position: absolute; bottom: 24px; left: 24px; right: 24px; background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 8px 16px; display: none; justify-content: space-between; align-items: center; gap: 16px; box-shadow: var(--shadow-md); z-index: 20;';
        bar.innerHTML = `
            <span style="font-weight: 600; font-size: 0.9rem; flex: 1;"><span id="bulk-selected-count">0</span> Selected</span>
            <button class="btn btn-danger" id="btn-bulk-delete" style="margin: 0; padding: 6px 16px; width: auto; font-size: 0.85rem;">Delete</button>
        `;
        document.getElementById('view-products').appendChild(bar);

        document.getElementById('btn-bulk-delete').addEventListener('click', () => {
            const count = window.selectedProductIds.size;
            if (count === 0) return;

            modalContainer.innerHTML = `
                <div class="modal-overlay active" id="confirm-modal">
                    <div class="modal">
                        <h3 class="modal-title">Delete Products?</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--text-muted)">Are you sure you want to delete ${count} selected product(s)?</p>
                        <div class="input-row">
                            <button class="btn" style="background: transparent; color: var(--text-muted);" onclick="closeModal('confirm-modal')">Cancel</button>
                            <button class="btn btn-danger" id="btn-confirm-bulk-delete" style="margin-top: 0;">Delete</button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('btn-confirm-bulk-delete').addEventListener('click', () => {
                let currentProducts = Store.getProducts();
                currentProducts = currentProducts.filter(p => !window.selectedProductIds.has(p.id));
                Store.saveProducts(currentProducts);
                window.selectedProductIds.clear();
                window.isSelectMode = false; // Exit select mode on delete
                renderProductsList(document.getElementById('products-list-container'));
                closeModal('confirm-modal');
            });
        });
    }

    const bulkBar = document.getElementById('bulk-action-bar');
    const updateUIState = () => {
        const count = window.selectedProductIds.size;
        document.getElementById('bulk-selected-count').textContent = count;

        // Update button state (disabled if 0 selected)
        const delBtn = document.getElementById('btn-bulk-delete');
        if (count === 0) {
            delBtn.style.opacity = '0.5';
            delBtn.style.pointerEvents = 'none';
        } else {
            delBtn.style.opacity = '1';
            delBtn.style.pointerEvents = 'auto';
        }

        const productsCount = Store.getProducts().length;
        const selectAllBtn = document.getElementById('btn-toggle-select-all');
        if (selectAllBtn) {
            selectAllBtn.textContent = count === productsCount && productsCount > 0 ? 'Deselect All' : 'Select All';
            selectAllBtn.style.display = window.isSelectMode ? 'block' : 'none';
        }

        if (window.isSelectMode) {
            bulkBar.classList.add('visible');
            document.getElementById('fab-add-product').style.transform = 'scale(0)'; // hide fab
            // Show checkboxes
            document.querySelectorAll('.prod-checkbox').forEach(cb => cb.style.display = 'inline-flex');
            // Hide edit icons
            document.querySelectorAll('.edit-icon').forEach(icon => icon.style.display = 'none');
        } else {
            bulkBar.classList.remove('visible');
            document.getElementById('fab-add-product').style.transform = 'scale(1)'; // show fab
            // Hide checkboxes
            document.querySelectorAll('.prod-checkbox').forEach(cb => cb.style.display = 'none');
            // Show edit icons
            document.querySelectorAll('.edit-icon').forEach(icon => icon.style.display = 'block');
        }

        // Update header button text
        const toggleBtn = document.getElementById('btn-toggle-select');
        if (toggleBtn) {
            toggleBtn.textContent = window.isSelectMode ? 'Cancel' : 'Select';
            toggleBtn.style.color = window.isSelectMode ? 'var(--text-muted)' : 'var(--accent-primary)';
        }
    };

    // Clean up selected IDs that might have been deleted elsewhere
    const validIds = new Set(products.map(p => p.id));
    window.selectedProductIds = new Set([...window.selectedProductIds].filter(id => validIds.has(id)));

    // Apply search and category filtering
    const normalizedQuery = searchQuery.trim().toLowerCase();

    // First figure out unique categories
    const categoriesSet = new Set();
    products.forEach(p => {
        if (p.category) categoriesSet.add(p.category);
    });
    const categories = ['All', ...Array.from(categoriesSet).sort()];

    // Render chips
    const chipsContainer = document.getElementById('products-category-chips');
    if (chipsContainer) {
        if (categories.length > 1) {
            chipsContainer.style.display = 'flex';
            chipsContainer.innerHTML = categories.map(cat => {
                const isActive = cat === window.activeProductCategory;
                const bg = isActive ? 'var(--accent-light)' : 'var(--surface-color)';
                const border = isActive ? 'var(--accent-primary)' : 'var(--border-color)';
                const color = isActive ? 'var(--accent-primary)' : 'var(--text-main)';
                return `<div class="cat-chip" data-cat="${cat}" style="white-space:nowrap; background:${bg}; border:1px solid ${border}; color:${color}; padding:4px 12px; border-radius:16px; font-size:0.8rem; font-weight:600; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,0.05); transition:all 0.1s;">${cat}</div>`;
            }).join('');

            // Re-bind click listeners for chips
            chipsContainer.querySelectorAll('.cat-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const searchInput = document.getElementById('search-products');
                    renderProductsList(container, searchInput ? searchInput.value : '', chip.dataset.cat);
                });
            });
        } else {
            chipsContainer.style.display = 'none';
        }
    }

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchQuery = !normalizedQuery || p.name.toLowerCase().includes(normalizedQuery);
        const matchCat = window.activeProductCategory === 'All' || p.category === window.activeProductCategory;
        return matchQuery && matchCat;
    });

    // Render logic
    let html = '';

    if (filteredProducts.length > 0) {
        html += filteredProducts.map(p => {
            const isChecked = window.selectedProductIds.has(p.id) ? 'checked' : '';
            return `
            <div class="card flex-between product-item" data-id="${p.id}" style="transition: transform 0.1s;">
                <div style="display: flex; align-items: center; width: 100%;">
                    <input type="checkbox" class="checkbox-custom prod-checkbox" data-id="${p.id}" ${isChecked} style="pointer-events: none; display: ${window.isSelectMode ? 'inline-flex' : 'none'};">
                    <div>
                        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 4px;">${p.name}</div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">
                            ${p.prices ? p.prices.map(pr => `₹${pr.price}/${pr.unit}`).join(' | ') : `₹${p.price} / ${p.unit}`}
                        </div>
                    </div>
                </div>
                <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="padding: 4px; box-sizing: content-box; flex-shrink: 0; display: ${window.isSelectMode ? 'none' : 'block'};"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            `;
        }).join('');
    } else {
        html = `<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">${normalizedQuery ? 'No matching products found.' : 'No products added. Click + to add.'}</div>`;
    }

    container.innerHTML = html;

    // Defer attaching listeners and state update to ensure DOM is ready
    setTimeout(() => {
        const freshToggleAllBtn = document.getElementById('btn-toggle-select-all');
        if (freshToggleAllBtn) {
            const newToggleAllBtn = freshToggleAllBtn.cloneNode(true);
            freshToggleAllBtn.parentNode.replaceChild(newToggleAllBtn, freshToggleAllBtn);
            newToggleAllBtn.addEventListener('click', () => {
                const currentProducts = Store.getProducts();
                if (window.selectedProductIds.size === currentProducts.length) {
                    window.selectedProductIds.clear(); // Deselect all
                } else {
                    currentProducts.forEach(p => window.selectedProductIds.add(p.id)); // Select all
                }
                document.querySelectorAll('.prod-checkbox').forEach(cb => {
                    cb.checked = window.selectedProductIds.has(cb.dataset.id);
                });
                updateUIState();
            });
        }

        const freshToggleBtn = document.getElementById('btn-toggle-select');
        if (freshToggleBtn) {
            const newToggleBtn = freshToggleBtn.cloneNode(true);
            freshToggleBtn.parentNode.replaceChild(newToggleBtn, freshToggleBtn);
            newToggleBtn.style.display = products.length > 0 ? 'inline-block' : 'none';
            newToggleBtn.addEventListener('click', () => {
                window.isSelectMode = !window.isSelectMode;
                if (!window.isSelectMode) window.selectedProductIds.clear(); // Clear selections on cancel
                updateUIState();
            });
        }

        if (products.length > 0) {

            // Interaction logic (click the entire card)
            container.querySelectorAll('.product-item').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.dataset.id;
                    if (window.isSelectMode) {
                        // Toggle selection
                        if (window.selectedProductIds.has(id)) {
                            window.selectedProductIds.delete(id);
                            el.querySelector('.prod-checkbox').checked = false;
                        } else {
                            window.selectedProductIds.add(id);
                            el.querySelector('.prod-checkbox').checked = true;
                        }
                        updateUIState();
                    } else {
                        // Open Edit Modal
                        const prod = products.find(p => p.id === id);
                        openProductModal(prod);
                    }
                });
            });
        }
        updateUIState();
    }, 0);
}

function openProductModal(product = null) {
    const isEdit = !!product;
    let currentPresets = product && product.presets ? [...product.presets] : [];
    let currentAddons = product && product.addons ? [...product.addons] : [];

    let currentPrices = [];
    if (product && product.prices) {
        currentPrices = product.prices.map(pr => ({ ...pr }));
    } else if (product && product.price !== undefined && product.unit) {
        currentPrices = [{ price: product.price, unit: product.unit, dateAdded: Date.now() }];
    }

    let editingPrice = null;

    // Render functions for dynamic lists
    const renderPrices = () => {
        const container = document.getElementById('prices-list');
        if (!container) return;

        if (currentPrices.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 4px 0;">No base prices added.</div>';
            return;
        }

        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '6px';
        container.innerHTML = currentPrices.map((pr, idx) => {
            let detailsHtml = '';
            if (pr.dateAdded || pr.dateModified || pr.previousPrice) {
                let parts = [];
                if (pr.dateAdded) parts.push(`Added: ${new Date(pr.dateAdded).toLocaleDateString()}`);
                if (pr.dateModified) parts.push(`Updated: ${new Date(pr.dateModified).toLocaleDateString()}`);
                if (pr.previousPrice) parts.push(`Old: ₹${pr.previousPrice}`);
                if (pr.minQty) parts.push(`Min Qty: ${pr.minQty}`);
                if (pr.minPrice) parts.push(`Min Price: ₹${pr.minPrice}`);

                if (parts.length > 0) {
                    detailsHtml = `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal; margin-top:2px;">${parts.join(' | ')}</div>`;
                }
            }
            return `
            <div class="price-item" data-idx="${idx}" style="cursor:pointer; display:flex; align-items:center; gap:8px; background:var(--bg-color); border:1px solid var(--border-color); padding:6px 10px; border-radius:8px; font-size:0.9rem;" title="Tap to edit">
                <div style="flex:1;">
                    <span style="font-weight:600;">₹${pr.price} <span style="font-weight:normal; color:var(--text-muted);">per ${pr.unit}</span></span>
                    ${detailsHtml}
                </div>
                <span class="remove-price" data-idx="${idx}" style="color:var(--dash-red); font-size:1.2rem; cursor:pointer; font-weight:bold; line-height: 1; padding: 0 4px;">&times;</span>
            </div>
            `;
        }).join('');
    };

    const renderPresets = () => {
        const container = document.getElementById('presets-list');
        if (!container) return;
        if (currentPresets.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 4px 0;">No presets.</div>';
            return;
        }
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '6px';
        container.innerHTML = currentPresets.map((p, idx) => `
            <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-color); border:1px solid var(--border-color); padding:4px 10px; border-radius:16px; font-size:0.85rem;">
                <span style="color:var(--text-main);"><b>${p.name}</b> <span style="color:var(--text-muted); font-size:0.8rem;">(${p.qty}${p.unit})</span></span>
                <span class="remove-preset" data-idx="${idx}" style="color:var(--dash-red); font-size:1.2rem; cursor:pointer; font-weight:bold; line-height: 1;">&times;</span>
            </div>
        `).join('');
    };

    const renderAddons = () => {
        const container = document.getElementById('addons-list');
        if (!container) return;
        if (currentAddons.length === 0) {
            container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 4px 0;">No addons.</div>';
            return;
        }
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '6px';
        container.innerHTML = currentAddons.map((a, idx) => `
            <div style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-color); border:1px solid var(--border-color); padding:4px 10px; border-radius:16px; font-size:0.85rem;">
                <span style="color:var(--text-main);"><b>${a.name}</b> <span style="color:var(--text-muted); font-size:0.8rem;">(+₹${a.price})</span></span>
                <span class="remove-addon" data-idx="${idx}" style="color:var(--dash-red); font-size:1.2rem; cursor:pointer; font-weight:bold; line-height: 1;">&times;</span>
            </div>
        `).join('');
    };

    // Categories for autocomplete
    const allProducts = Store.getProducts();
    const categoriesSet = new Set();
    allProducts.forEach(p => {
        if (p.category) categoriesSet.add(p.category);
    });
    const uniqueCategories = Array.from(categoriesSet).sort();

    const modalHtml = `
        <div class="modal-overlay active" id="product-modal">
            <div class="modal" style="max-height: 90vh; overflow-y: visible; scroll-behavior: smooth; -webkit-overflow-scrolling: touch;">
                <h3 class="modal-title">${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
                
                <div style="display:flex; gap: 8px;">
                    <div class="form-group" style="flex: 2;">
                        <label>Product Name</label>
                        <input type="text" id="prod-name" class="form-control" value="${product ? product.name : ''}" placeholder="e.g. Apple">
                    </div>
                    <div class="form-group autocomplete-container" style="flex: 1.5;">
                        <label>Category (Opt)</label>
                        <input type="text" id="prod-category" class="form-control" value="${product && product.category ? product.category : ''}" placeholder="e.g. Dairy" autocomplete="off">
                        <div id="category-dropdown" class="autocomplete-dropdown"></div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Base Prices</label>
                    <div id="prices-list" style="margin-bottom: 8px;"></div>
                    <div style="display:flex; gap:6px;">
                        <input type="number" id="new-price" class="form-control" placeholder="₹ Base Price" style="flex: 1.5; min-width: 0; padding: 6px 8px;">
                        <span style="display:flex; align-items:center; color:var(--text-muted);">/</span>
                        <select id="new-unit" class="form-control" style="flex: 1; min-width: 0; padding: 6px 8px;">
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="item">item</option>
                            <option value="box">box</option>
                            <option value="pkg">pkg</option>
                        </select>
                    </div>
                    <div style="display:flex; gap:6px; margin-top: 6px;">
                        <input type="number" id="new-min-qty" class="form-control" placeholder="Min Qty (Opt)" style="flex: 1; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                        <input type="number" id="new-min-price" class="form-control" placeholder="Min ₹ (Opt)" style="flex: 1; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                        <button id="btn-add-price" class="btn" style="flex: 1; min-width: 0; padding: 6px 8px; margin: 0; background: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-main);">Add</button>
                    </div>
                </div>

                <div class="form-group" style="padding-top: 8px; border-top: 1px solid var(--border-color);">
                    <label style="display:flex; justify-content:space-between; align-items:center;">
                        Quick Presets
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">For calculator quick-add</span>
                    </label>
                    <div id="presets-list" style="margin-bottom: 8px;"></div>
                    <div style="display:flex; gap:6px;">
                        <input type="text" id="preset-name" class="form-control" placeholder="Name" style="flex: 1; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                        <input type="number" id="preset-qty" class="form-control" placeholder="Qty" style="flex: 1; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                        <select id="preset-unit" class="form-control" style="flex: 1; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="litre">litre</option>
                        </select>
                        <button id="btn-add-preset" class="btn" style="flex: 1; min-width: 0; padding: 6px 8px; margin: 0; background: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.85rem;">Add</button>
                    </div>
                </div>

                <div class="form-group" style="padding-top: 16px; border-top: 1px solid var(--border-color);">
                    <label style="display:flex; justify-content:space-between; align-items:center;">
                        Optional Addons
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">e.g. Bag, Bottle</span>
                    </label>
                    <div id="addons-list" style="margin-bottom: 8px;"></div>
                    <div style="display:flex; gap:6px;">
                        <input type="text" id="addon-name" class="form-control" placeholder="Name" style="flex: 2; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                        <input type="number" id="addon-price" class="form-control" placeholder="₹ Price" style="flex: 1; min-width: 0; padding: 6px 8px; font-size:0.85rem;">
                        <button id="btn-add-addon" class="btn" style="flex: 1; min-width: 0; padding: 6px 8px; margin: 0; background: var(--surface-color); border: 1px solid var(--border-color); color: var(--text-main); font-size:0.85rem;">Add</button>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:8px; margin-top:24px;">
                    <button class="btn btn-primary" id="btn-save-prod" style="margin:0;">Confirm</button>
                    ${isEdit ? '<button class="btn btn-danger" id="btn-delete-prod" style="margin:0;">Delete Product</button>' : ''}
                    <button class="btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-main); margin:0;" onclick="closeModal('product-modal')">Cancel</button>
                </div>
            </div>
        </div>
    `;

    modalContainer.innerHTML = modalHtml;

    // Initialize lists
    renderPrices();
    renderPresets();
    renderAddons();

    // Auto-focus input
    setTimeout(() => {
        const input = document.getElementById('prod-name');
        if (input) {
            input.focus();
            const val = input.value;
            input.value = '';
            input.value = val; // Move cursor to end
        }
    }, 10);

    const nameInput = document.getElementById('prod-name');
    const categoryInput = document.getElementById('prod-category');
    const categoryDropdown = document.getElementById('category-dropdown');
    const priceInput = document.getElementById('new-price');
    const saveBtn = document.getElementById('btn-save-prod');

    // Autocomplete logic
    if (categoryInput && categoryDropdown) {
        const renderDropdown = (query) => {
            const matches = uniqueCategories.filter(c => c.toLowerCase().includes(query.toLowerCase()));
            if (matches.length > 0) {
                categoryDropdown.innerHTML = matches.map(m => `<div class="autocomplete-item">${m}</div>`).join('');
                categoryDropdown.style.display = 'block';

                categoryDropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                    item.addEventListener('mousedown', (e) => { // mousedown fires before blur
                        e.preventDefault();
                        categoryInput.value = item.textContent;
                        categoryDropdown.style.display = 'none';
                    });
                });
            } else {
                categoryDropdown.style.display = 'none';
            }
        };

        categoryInput.addEventListener('focus', () => {
            renderDropdown(categoryInput.value.trim());
        });

        categoryInput.addEventListener('input', (e) => {
            renderDropdown(e.target.value.trim());
        });

        categoryInput.addEventListener('blur', () => {
            categoryDropdown.style.display = 'none';
        });
    }

    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (priceInput) priceInput.focus();
            }
        });
    }
    if (priceInput) {
        priceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('btn-add-price').click();
            }
        });
    }

    // Presets & Addons bindings
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-price')) {
            const idx = parseInt(e.target.dataset.idx);
            currentPrices.splice(idx, 1);
            renderPrices();
            return;
        }

        const priceItem = e.target.closest('.price-item');
        if (priceItem) {
            const idx = parseInt(priceItem.dataset.idx);
            const pr = currentPrices[idx];

            document.getElementById('new-price').value = pr.price;
            document.getElementById('new-unit').value = pr.unit;
            document.getElementById('new-min-qty').value = pr.minQty || '';
            document.getElementById('new-min-price').value = pr.minPrice || '';
            document.getElementById('new-price').focus();

            editingPrice = currentPrices.splice(idx, 1)[0];
            renderPrices();
            return;
        }

        if (e.target.classList.contains('remove-preset')) {
            const idx = parseInt(e.target.dataset.idx);
            currentPresets.splice(idx, 1);
            userHasTouchedPresets = true;
            renderPresets();
            return;
        }
        if (e.target.classList.contains('remove-addon')) {
            const idx = parseInt(e.target.dataset.idx);
            currentAddons.splice(idx, 1);
            renderAddons();
        }
    });

    document.getElementById('btn-add-price').addEventListener('click', () => {
        const pInput = document.getElementById('new-price');
        const mqInput = document.getElementById('new-min-qty');
        const mpInput = document.getElementById('new-min-price');

        const price = parseFloat(pInput.value);
        const unit = document.getElementById('new-unit').value;
        const minQty = parseFloat(mqInput.value);
        const minPrice = parseFloat(mpInput.value);

        // Prevent adding multiple base prices for the same unit "type"
        const isWeight = unit === 'kg' || unit === 'g';
        const conflictingTier = currentPrices.find(pr => {
            if (isWeight) return pr.unit === 'kg' || pr.unit === 'g';
            return pr.unit === unit;
        });

        if (conflictingTier) {
            alert(`A base price for ${isWeight ? 'weight (kg/g)' : unit} already exists. Remove it first.`);
            return;
        }

        if (!isNaN(price) && price > 0) {
            let newPr = { price, unit };
            if (!isNaN(minQty) && minQty > 0) newPr.minQty = minQty;
            if (!isNaN(minPrice) && minPrice > 0) newPr.minPrice = minPrice;

            if (editingPrice) {
                if (editingPrice.dateAdded) newPr.dateAdded = editingPrice.dateAdded;
                if (editingPrice.dateModified) newPr.dateModified = editingPrice.dateModified;
                if (editingPrice.previousPrice) newPr.previousPrice = editingPrice.previousPrice;
                editingPrice = null;
            } else {
                newPr.dateAdded = Date.now();
            }
            currentPrices.push(newPr);
            renderPrices();
            pInput.value = '';
            mqInput.value = '';
            mpInput.value = '';

            if (currentPresets.length === 0) populateDefaultPresets();
        }
    });

    document.getElementById('btn-add-preset').addEventListener('click', () => {
        const nameInput = document.getElementById('preset-name');
        const qtyInput = document.getElementById('preset-qty');
        const unitInput = document.getElementById('preset-unit');

        let name = nameInput.value.trim();
        const qty = parseFloat(qtyInput.value);
        const unit = unitInput.value;

        if (isNaN(qty)) return;
        if (!name) name = `${qty}${unit}`; // Default name to quantity

        currentPresets.push({ name, qty, unit });
        userHasTouchedPresets = true;
        renderPresets();

        nameInput.value = '';
        qtyInput.value = '';
    });

    document.getElementById('btn-add-addon').addEventListener('click', () => {
        const nameInput = document.getElementById('addon-name');
        const priceInput = document.getElementById('addon-price');

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);

        if (!name || isNaN(price)) return;

        currentAddons.push({ name, price });
        renderAddons();

        nameInput.value = '';
        priceInput.value = '';
    });

    // Populate default presets if base unit changes
    let userHasTouchedPresets = false;

    const populateDefaultPresets = () => {
        if (!userHasTouchedPresets && currentPresets.length === 0) {
            const hasKgOrG = currentPrices.some(pr => pr.unit === 'kg' || pr.unit === 'g');
            if (hasKgOrG) {
                currentPresets = [
                    { name: '100g', qty: 100, unit: 'g' },
                    { name: '200g', qty: 200, unit: 'g' },
                    { name: '250g', qty: 250, unit: 'g' },
                    { name: '500g', qty: 500, unit: 'g' },
                    { name: '1kg', qty: 1, unit: 'kg' }
                ];
                renderPresets();
            }
        }
    };

    // Trigger default population once on open for new products
    if (!isEdit) {
        populateDefaultPresets();
    }

    // Save logic
    saveBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();

        // Check if unconfirmed price is typed in the row
        const pendingPrice = parseFloat(document.getElementById('new-price').value);
        if (!isNaN(pendingPrice) && pendingPrice > 0) {
            document.getElementById('btn-add-price').click();
        }

        if (!name || currentPrices.length === 0 || currentPrices.some(pr => !pr.price)) {
            modalContainer.innerHTML += `
                <div class="modal-overlay active" id="error-modal" style="z-index: 200;">
                    <div class="modal">
                        <h3 class="modal-title" style="color: var(--danger-color)">Error</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--text-muted)">Please enter a valid product name and at least one price.</p>
                        <button class="btn btn-primary" onclick="document.getElementById('error-modal').remove()">OK</button>
                    </div>
                </div>
            `;
            return;
        }

        let finalPrices = currentPrices;
        if (isEdit && product.prices) {
            finalPrices = currentPrices.map(newPr => {
                const oldPr = product.prices.find(p => p.unit === newPr.unit);
                if (oldPr) {
                    if (oldPr.price !== newPr.price) {
                        return { ...newPr, dateAdded: oldPr.dateAdded || Date.now(), dateModified: Date.now(), previousPrice: oldPr.price };
                    }
                    return { ...newPr, dateAdded: oldPr.dateAdded, dateModified: oldPr.dateModified, previousPrice: oldPr.previousPrice };
                }
                return { ...newPr, dateAdded: newPr.dateAdded || Date.now() };
            });
        } else {
            finalPrices = currentPrices.map(pr => ({ ...pr, dateAdded: pr.dateAdded || Date.now() }));
        }

        let products = Store.getProducts();
        const finalProduct = {
            id: isEdit ? product.id : Date.now().toString(),
            name,
            category: document.getElementById('prod-category').value.trim(),
            prices: finalPrices,
            presets: currentPresets,
            addons: currentAddons
        };

        if (isEdit) {
            products = products.map(p => p.id === product.id ? finalProduct : p);
        } else {
            products.push(finalProduct);
        }

        Store.saveProducts(products);
        closeModal('product-modal');
        renderProductsList(document.getElementById('products-list-container'));
    });

    // Delete logic
    if (isEdit) {
        document.getElementById('btn-delete-prod').addEventListener('click', () => {
            modalContainer.innerHTML = `
                <div class="modal-overlay active" id="confirm-modal">
                    <div class="modal">
                        <h3 class="modal-title">Delete Product?</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--text-muted)">Are you sure you want to delete ${product.name}?</p>
                        <div class="input-row">
                            <button class="btn" style="background: transparent; color: var(--text-muted);" onclick="closeModal('confirm-modal')">Cancel</button>
                            <button class="btn btn-danger" id="btn-confirm-delete" style="margin-top: 0;">Delete</button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('btn-confirm-delete').addEventListener('click', () => {
                let products = Store.getProducts();
                products = products.filter(p => p.id !== product.id);
                Store.saveProducts(products);
                closeModal('confirm-modal');
                renderProductsList(document.getElementById('products-list-container'));
            });
        });
    }
}

// ==========================================
// CHECKOUT TAB LOGIC
// ==========================================
function initCheckoutTab() {
    const listContainer = document.getElementById('checkout-product-list');
    const searchInput = document.getElementById('search-checkout');
    const products = Store.getProducts();

    if (products.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No products available. Add some in the Products tab.</div>';
        if (searchInput && searchInput.parentElement) searchInput.parentElement.style.display = 'none';
        return;
    }

    const remarksInput = document.getElementById('checkout-remarks');
    if (remarksInput) {
        remarksInput.value = Store.checkoutRemarks;
        remarksInput.addEventListener('input', (e) => {
            Store.checkoutRemarks = e.target.value;
            updateCheckoutActionsVisibility();
        });
        remarksInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                remarksInput.blur();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderCheckoutProductList(listContainer, products, e.target.value, window.activeCheckoutCategory);
        });
        // Initial render
        renderCheckoutProductList(listContainer, products, searchInput.value, window.activeCheckoutCategory);
    } else {
        renderCheckoutProductList(listContainer, products, '', window.activeCheckoutCategory);
    }

    renderCheckoutPills();

    document.getElementById('btn-clear-cart').addEventListener('click', () => {
        if (Store.cart.length === 0 && !Store.checkoutRemarks) return;
        if (confirm('Are you sure you want to clear the cart and remarks?')) {
            Store.cart = [];
            Store.checkoutRemarks = '';
            const remarksInput = document.getElementById('checkout-remarks');
            if (remarksInput) remarksInput.value = '';
            renderCheckoutPills();
        }
    });

    document.getElementById('btn-save-transaction').addEventListener('click', () => {
        if (Store.cart.length === 0) return alert('No items in checkout!');

        const total = Store.cart.reduce((sum, item) => sum + item.cost, 0);
        const remarksInput = document.getElementById('checkout-remarks');
        const remarks = remarksInput ? remarksInput.value.trim() : '';

        const pendingTransaction = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: Store.cart,
            total: total,
            remarks: remarks,
            paidAmount: 0,
            balance: total,
            paymentStatus: 'unpaid'
        };

        openSettlementModal(pendingTransaction, (finalizedTx) => {
            const history = Store.getHistory();
            history.unshift(finalizedTx);
            Store.saveHistory(history);

            Store.cart = []; // Clear
            Store.checkoutRemarks = '';
            if (remarksInput) remarksInput.value = ''; // Clear input
            renderCheckoutPills();

            // Show success toast/alert
            const toast = document.createElement('div');
            toast.textContent = 'Transaction Saved';
            toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:var(--text-main); color:var(--bg-color); padding:8px 16px; border-radius:30px; z-index:9999; box-shadow:var(--shadow-md); transition:opacity 0.3s;';
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
        });
    });
}

function renderCheckoutProductList(container, products, searchQuery = '', activeCategory = 'All') {
    window.activeCheckoutCategory = activeCategory;

    // Apply search and category filtering
    const normalizedQuery = searchQuery.trim().toLowerCase();

    // First figure out unique categories
    const categoriesSet = new Set();
    products.forEach(p => {
        if (p.category) categoriesSet.add(p.category);
    });
    const categories = ['All', ...Array.from(categoriesSet).sort()];

    // Render chips
    const chipsContainer = document.getElementById('checkout-category-chips');
    if (chipsContainer) {
        if (categories.length > 1) {
            chipsContainer.style.display = 'flex';
            chipsContainer.innerHTML = categories.map(cat => {
                const isActive = cat === window.activeCheckoutCategory;
                const bg = isActive ? 'var(--accent-light)' : 'var(--surface-color)';
                const border = isActive ? 'var(--accent-primary)' : 'var(--border-color)';
                const color = isActive ? 'var(--accent-primary)' : 'var(--text-main)';
                return `<div class="cat-chip" data-cat="${cat}" style="white-space:nowrap; background:${bg}; border:1px solid ${border}; color:${color}; padding:4px 12px; border-radius:16px; font-size:0.8rem; font-weight:600; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,0.05); transition:all 0.1s;">${cat}</div>`;
            }).join('');

            // Re-bind click listeners for chips
            chipsContainer.querySelectorAll('.cat-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const searchInput = document.getElementById('search-checkout');
                    renderCheckoutProductList(container, products, searchInput ? searchInput.value : '', chip.dataset.cat);
                });
            });
        } else {
            chipsContainer.style.display = 'none';
        }
    }

    const filteredProducts = products.filter(p => {
        const matchQuery = !normalizedQuery || p.name.toLowerCase().includes(normalizedQuery);
        const matchCat = window.activeCheckoutCategory === 'All' || p.category === window.activeCheckoutCategory;
        return matchQuery && matchCat;
    });

    if (filteredProducts.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No matching products found.</div>`;
        return;
    }

    // Render available products to select
    container.innerHTML = filteredProducts.map(p => {
        const prices = p.prices || [{ price: p.price || 0, unit: p.unit || 'kg' }];

        const pricesHtml = prices.map(pr => {
            return `<div style="margin-bottom:2px; display:flex; align-items:baseline;"><span style="font-weight:600; color:var(--text-main);">₹${pr.price}</span><span style="color:var(--text-muted); margin-left:2px;">/${pr.unit}</span></div>`;
        }).join('');

        let presetsHtml = '';
        if (p.presets && p.presets.length > 0) {
            presetsHtml = `<div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px;">` + p.presets.map(preset => {
                let baseTier = prices.find(pr => pr.unit === preset.unit);
                if (!baseTier) {
                    if (preset.unit === 'g') baseTier = prices.find(pr => pr.unit === 'kg');
                    else if (preset.unit === 'ml') baseTier = prices.find(pr => pr.unit === 'litre');
                }

                let presetPriceStr = '?';
                if (baseTier) {
                    let cost = 0;
                    if (baseTier.unit === preset.unit) cost = baseTier.price * preset.qty;
                    else if (baseTier.unit === 'kg' && preset.unit === 'g') cost = (preset.qty / 1000) * baseTier.price;
                    else if (baseTier.unit === 'litre' && preset.unit === 'ml') cost = (preset.qty / 1000) * baseTier.price;
                    presetPriceStr = `₹${cost.toFixed(1).replace('.0', '')}`;
                }
                return `<span style="background:var(--surface-color); border:1px solid var(--border-color); padding:2px 6px; border-radius:6px; font-size:0.75rem; color:var(--text-muted);">${preset.name}: <span style="font-weight:600; color:var(--text-main);">${presetPriceStr}</span></span>`;
            }).join('') + `</div>`;
        }

        return `
        <div class="card flex-between checkout-item" data-id="${p.id}" style="align-items:flex-start;">
            <div style="flex:1;">
                <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 6px;">${p.name}</div>
                <div style="font-size: 0.9rem;">
                    ${pricesHtml}
                </div>
                ${presetsHtml}
            </div>
            <div style="width: 32px; height: 32px; border-radius: 16px; background: var(--accent-light); display: flex; align-items: center; justify-content: center; color: var(--accent-primary); margin-top:2px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
        </div>
        `;
    }).join('');

    container.querySelectorAll('.checkout-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            const prod = products.find(p => p.id === id);
            openCalculatorModal(prod);
        });
    });
}

function updateCheckoutActionsVisibility() {
    const actionsContainer = document.getElementById('checkout-actions-container');
    const totalPrice = document.getElementById('checkout-total-price');
    if (!actionsContainer || !totalPrice) return;

    if (Store.cart.length > 0 || (Store.checkoutRemarks && Store.checkoutRemarks.trim() !== '')) {
        actionsContainer.style.display = 'flex';
        totalPrice.style.display = 'inline-block';
    } else {
        actionsContainer.style.display = 'none';
        totalPrice.style.display = 'inline-block'; // Keep total visible even when 0
    }
}

function openCalculatorModal(product, existingCartItemIndex = -1) {
    const isEdit = existingCartItemIndex >= 0;
    const initialQty = isEdit ? Store.cart[existingCartItemIndex].qty : '';
    const initialCost = isEdit ? Store.cart[existingCartItemIndex].cost : '';

    // Fallback for old data
    const pPrices = product.prices || [{ price: product.price || 0, unit: product.unit || 'kg' }];
    const initialUnit = isEdit ? Store.cart[existingCartItemIndex].unit : pPrices[0].unit;
    const initialAddons = isEdit && Store.cart[existingCartItemIndex].addons ? Store.cart[existingCartItemIndex].addons.map(a => a.name) : [];

    // Determine Allowed Units based on base prices
    let allowedUnits = [];
    pPrices.forEach(pr => {
        if (!allowedUnits.includes(pr.unit)) allowedUnits.push(pr.unit);
        // Natural conversions
        if (pr.unit === 'kg' && !allowedUnits.includes('g')) allowedUnits.push('g');
        if (pr.unit === 'g' && !allowedUnits.includes('kg')) allowedUnits.push('kg');
    });

    // In the future, unit conversions would append more units here.

    const unitOptionsHtml = allowedUnits.map(u =>
        `<option value="${u}" ${u === initialUnit ? 'selected' : ''}>${u}</option>`
    ).join('');

    // Generate Presets HTML
    const presets = product.presets || [];
    let presetsHtml = '';
    if (presets.length > 0) {
        presetsHtml = `
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
                ${presets.map(p => `<button class="btn-preset" data-qty="${p.qty}" data-unit="${p.unit}" style="background:var(--bg-color); border:1px solid var(--border-color); padding:4px 10px; border-radius:12px; font-size:0.85rem; color:var(--text-main); cursor:pointer;">${p.name}</button>`).join('')}
            </div>
        `;
    }

    // Generate Addons HTML
    const addons = product.addons || [];
    let addonsHtml = '';
    if (addons.length > 0) {
        addonsHtml = `
            <div style="margin-top:16px; border-top:1px solid var(--border-color); padding-top:16px;">
                <label style="font-size:0.9rem; margin-bottom:12px; display:block; color:var(--text-muted); font-weight:600;">Optional Addons</label>
                <div style="display:flex; flex-wrap:wrap; gap:10px;">
                    ${addons.map(a => `
                        <label style="display:inline-flex; align-items:center; gap:12px; font-size:1rem; cursor:pointer; background:var(--bg-color); padding:10px 14px; border-radius:12px; border:1px solid var(--border-color); transition: border-color 0.2s;">
                            <input type="checkbox" class="checkbox-custom addon-checkbox" value="${a.name}" data-price="${a.price}" ${initialAddons.includes(a.name) ? 'checked' : ''} style="pointer-events:none;">
                            <span style="font-weight:500;">${a.name}</span>
                            <span style="color:var(--text-muted); font-size: 0.95rem;">+₹${a.price}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const modalHtml = `
        <div class="modal-overlay active" id="calc-modal">
            <div class="modal" style="max-height:90vh; overflow-y:auto;">
                <h3 class="modal-title">${product.name}</h3>
                <div style="font-size:0.9rem; margin-bottom:12px; color:var(--text-muted);">
                    ${pPrices.map(pr => `₹${pr.price}/${pr.unit}`).join(' | ')}
                </div>
                
                <div style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.85rem;">
                    Enter Quantity OR Target Price.
                </div>

                <div class="form-group">
                    <label>Quantity</label>
                    <div class="input-row">
                        <input type="number" id="calc-qty" class="form-control" placeholder="Qty" value="${initialQty}">
                        <select id="calc-unit" class="form-control" style="width: 100px;">
                            ${unitOptionsHtml}
                        </select>
                    </div>
                    <div id="calc-constraints-hint" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;"></div>
                    ${presetsHtml}
                </div>
                
                <div style="text-align:center; font-weight:bold; color:var(--text-muted); padding: 5px 0;">= OR =</div>
                
                <div class="form-group">
                    <label>Total Price (₹)</label>
                    <input type="number" id="calc-price" class="form-control" placeholder="Calculate backwards" value="${initialCost}">
                </div>
                
                <div id="calc-validation-hint" style="font-size: 0.85rem; color: var(--danger-color); margin-top: 8px; display: none; font-weight: 500; text-align: center;"></div>

                ${addonsHtml}

                <div style="display: flex; gap: 8px; margin-top: 1.5rem;">
                    <button class="btn btn-primary" style="flex:1" id="btn-calc-ok">OK</button>
                    <button class="btn" style="flex:1; background: var(--bg-color); color: var(--text-main);" onclick="closeModal('calc-modal')">Cancel</button>
                </div>
                ${isEdit ? '<button class="btn btn-danger" id="btn-calc-remove" style="margin-top: 8px; width:100%;">Remove from Cart</button>' : ''}
            </div>
        </div>
    `;

    modalContainer.innerHTML = modalHtml;

    // Auto-focus input
    setTimeout(() => {
        const input = document.getElementById('calc-qty');
        if (input) {
            input.focus();
            const val = input.value;
            input.value = '';
            input.value = val; // Move cursor to end
        }
    }, 10);

    const qtyInput = document.getElementById('calc-qty');
    const priceInput = document.getElementById('calc-price');
    const unitSelect = document.getElementById('calc-unit');
    const addonCheckboxes = document.querySelectorAll('.addon-checkbox');

    const getAddonsTotal = () => {
        let sum = 0;
        addonCheckboxes.forEach(cb => {
            if (cb.checked) sum += parseFloat(cb.dataset.price);
        });
        return sum;
    };

    // Helper to dynamically find the correct base price given the currently selected unit
    const getBaseTier = (unit) => {
        let tier = pPrices.find(pr => pr.unit === unit);
        if (tier) return { tierPrice: tier.price, multiplier: 1, minQty: tier.minQty, minPrice: tier.minPrice };

        // Check natural conversions if direct match not found
        if (unit === 'g') {
            tier = pPrices.find(pr => pr.unit === 'kg');
            if (tier) return { tierPrice: tier.price, multiplier: 1 / 1000, minQty: tier.minQty ? tier.minQty * 1000 : null, minPrice: tier.minPrice };
        }
        if (unit === 'kg') {
            tier = pPrices.find(pr => pr.unit === 'g');
            if (tier) return { tierPrice: tier.price, multiplier: 1000, minQty: tier.minQty ? tier.minQty / 1000 : null, minPrice: tier.minPrice };
        }

        // Fallback
        return { tierPrice: pPrices[0].price, multiplier: 1, minQty: pPrices[0].minQty, minPrice: pPrices[0].minPrice };
    };

    // Helper to get formatted constraints message
    const getConstraintsMessage = (tier) => {
        let msgs = [];
        if (tier.minQty) msgs.push(`Min ${tier.minQty} ${unitSelect.value}`);
        if (tier.minPrice) msgs.push(`Min ₹${tier.minPrice}`);
        return msgs.length > 0 ? `Constraints: ${msgs.join(', ')}` : '';
    };

    // Core Calculation Logic
    const calculate = (source) => {
        const currentUnit = unitSelect.value;
        const addonsTotal = getAddonsTotal();

        const baseTier = getBaseTier(currentUnit);
        const uPrice = baseTier.tierPrice;
        const multiplier = baseTier.multiplier;

        let targetQty = qtyInput.value ? parseFloat(qtyInput.value) : 0;
        let targetCost = priceInput.value ? parseFloat(priceInput.value) : 0;
        let validationMsg = '';

        if (source === 'qty' || source === 'addon') {
            if (qtyInput.value) {
                const basePrice = targetQty * multiplier * uPrice;
                targetCost = basePrice + addonsTotal;
                priceInput.value = targetCost.toFixed(2);
            } else if (source === 'qty') {
                priceInput.value = '';
                targetCost = 0;
            }
        } else if (source === 'price') {
            if (priceInput.value) {
                // Backwards calc: subtract addons, then divide to find qty
                const baseCost = Math.max(0, targetCost - addonsTotal);
                targetQty = baseCost / (uPrice * multiplier);
                qtyInput.value = targetQty.toFixed(3);
            } else {
                qtyInput.value = '';
                targetQty = 0;
            }
        } else if (source === 'unit') {
            document.getElementById('calc-constraints-hint').textContent = getConstraintsMessage(baseTier);
            if (qtyInput.value) calculate('qty');
        }

        // Check Constraints visually (do not hard enforce on typings, only on save or blur)
        if (targetQty > 0 || targetCost > 0) {
            if (baseTier.minQty && targetQty < baseTier.minQty) {
                validationMsg = `Minimum quantity is ${baseTier.minQty} ${currentUnit}`;
            } else if (baseTier.minPrice && targetCost < baseTier.minPrice) {
                validationMsg = `Minimum price is ₹${baseTier.minPrice}`;
            }
        }

        const hintEl = document.getElementById('calc-validation-hint');
        if (hintEl) {
            hintEl.textContent = validationMsg;
            hintEl.style.display = validationMsg ? 'block' : 'none';
        }
    };

    qtyInput.addEventListener('input', () => calculate('qty'));
    priceInput.addEventListener('input', () => calculate('price'));
    unitSelect.addEventListener('change', () => calculate('unit'));

    // Update constraints text on init
    setTimeout(() => {
        const initialTier = getBaseTier(unitSelect.value);
        const hintEl = document.getElementById('calc-constraints-hint');
        if (hintEl) hintEl.textContent = getConstraintsMessage(initialTier);
    }, 0);

    addonCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            // Re-calc based on whichever field was last filled, biased heavily towards qty
            if (qtyInput.value) calculate('qty');
            else if (priceInput.value) calculate('price');
        });
    });

    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const qty = btn.dataset.qty;
            const unit = btn.dataset.unit;

            // Check if this unit is allowed/available in the select options
            const optionExists = Array.from(unitSelect.options).some(opt => opt.value === unit);
            if (optionExists) {
                unitSelect.value = unit;
            }

            qtyInput.value = qty;
            calculate('qty');
        });
    });

    qtyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btn-calc-ok').click();
        }
    });
    priceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btn-calc-ok').click();
        }
    });

    document.getElementById('btn-calc-ok').addEventListener('click', () => {
        let cost = parseFloat(priceInput.value);
        let qty = parseFloat(qtyInput.value);
        if (isNaN(cost) || isNaN(qty) || cost <= 0) return alert('Invalid entry');

        const baseTier = getBaseTier(unitSelect.value);

        // Enforce Minimums on Save
        let constrained = false;
        let originalQty = qty;
        let originalCost = cost;

        if (baseTier.minQty && qty < baseTier.minQty) {
            qtyInput.value = baseTier.minQty;
            calculate('qty');
            cost = parseFloat(priceInput.value);
            qty = parseFloat(qtyInput.value);
            constrained = true;
        }
        if (baseTier.minPrice && cost < baseTier.minPrice) {
            priceInput.value = baseTier.minPrice;
            calculate('price');
            cost = parseFloat(priceInput.value);
            qty = parseFloat(qtyInput.value);
            constrained = true;
        }

        const selectedAddons = [];
        addonCheckboxes.forEach(cb => {
            if (cb.checked) {
                selectedAddons.push({
                    name: cb.value,
                    price: parseFloat(cb.dataset.price)
                });
            }
        });

        const cartItem = {
            productId: product.id,
            name: product.name,
            qty: qty,
            unit: unitSelect.value,
            cost: cost,
            addons: selectedAddons,
            basePrice: baseTier.tierPrice
        };

        if (constrained) {
            cartItem.originalQty = originalQty;
            cartItem.originalCost = originalCost;
        }

        if (isEdit) {
            Store.cart[existingCartItemIndex] = cartItem;
        } else {
            Store.cart.push(cartItem);
        }

        closeModal('calc-modal');
        renderCheckoutPills();
    });

    if (isEdit) {
        document.getElementById('btn-calc-remove').addEventListener('click', () => {
            Store.cart.splice(existingCartItemIndex, 1);
            closeModal('calc-modal');
            renderCheckoutPills();
        });
    }
}

function openSettlementModal(tx, onComplete) {
    const totalRounded = Math.round(tx.total);
    const initialPaid = tx.paidAmount || 0;

    const itemsListHtml = tx.items.map(i => {
        const derivedUnitPrice = i.basePrice !== undefined ? i.basePrice : (i.cost / i.qty).toFixed(1).replace('.0', '');

        let addonsTotal = 0;
        if (i.addons && i.addons.length > 0) {
            addonsTotal = i.addons.reduce((sum, a) => sum + a.price, 0);
        }
        const productBaseTotal = i.cost - addonsTotal;

        // Base product line
        let html = `
        <div style="font-size: 0.85rem; margin-bottom: 2px;">
            <div style="display:flex; align-items: center;">
                <div style="flex: 2; font-weight: 500; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${i.name}</div>
                <div style="flex: 1; text-align: center; color: var(--text-muted);">${i.qty}${i.unit}</div>
                <div style="flex: 1; text-align: center; color: var(--text-muted);">₹${derivedUnitPrice}</div>
                <div style="flex: 1; text-align: right; font-weight: 600;">₹${productBaseTotal.toFixed(1).replace('.0', '')}</div>
            </div>
        </div>
        `;

        // Addons as separate lines underneath
        if (i.addons && i.addons.length > 0) {
            html += i.addons.map(a => `
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; display:flex; align-items: center;">
                    <div style="flex: 2; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">+ ${a.name}</div>
                    <div style="flex: 1; text-align: center;">1</div>
                    <div style="flex: 1; text-align: center;">₹${a.price}</div>
                    <div style="flex: 1; text-align: right; font-weight: 500;">₹${a.price}</div>
                </div>
            `).join('');
        }

        if (i.originalQty) {
            html += `<div style="font-size: 0.75rem; color: var(--danger-color); margin-top: 4px; font-weight: 500;">* Min constraint applied (Original: ${i.originalQty}${i.unit})</div>`;
        }

        // Add a bottom margin after the full block
        return `<div style="margin-bottom: 8px;">${html}</div>`;
    }).join('');

    const modalHtml = `
        <div class="modal-overlay active" id="settle-modal">
            <div class="modal">
                <h3 class="modal-title" style="margin-bottom: 8px;">Bill Settlement</h3>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                    <div>Sale: ${new Date(tx.date).toLocaleString()}</div>
                    ${(tx.updates || (tx.updatedAt ? [{ date: tx.updatedAt, status: tx.paymentStatus }] : [])).map((u, i) => {
        const dateStr = new Date(u.date || u).toLocaleString(); // Fallback for old numeric updates
        const statusStr = u.status ? ` - ${u.status.toUpperCase()}` : '';
        const balStr = u.balance !== undefined ? ` (Bal: ₹${u.balance})` : '';
        return `<div style="margin-top: 2px;">Update ${i + 1}: ${dateStr}${statusStr}${balStr}</div>`;
    }).join('')}
                </div>
                
                <div style="background: var(--bg-color); border: 1px dashed var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 1.5rem; max-height: 140px; overflow-y: auto;">
                    <div style="display:flex; align-items: center; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); padding-bottom: 6px; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;">
                        <div style="flex: 2; min-width: 0;">Name</div>
                        <div style="flex: 1; text-align: center;">Qty</div>
                        <div style="flex: 1; text-align: center;">Price</div>
                        <div style="flex: 1; text-align: right;">Amount</div>
                    </div>
                    ${itemsListHtml}
                    ${tx.remarks ? `<div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 4px;">Remarks: ${tx.remarks}</div>` : ''}
                </div>
                
                <div class="flex-between" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem;">
                    <span>Grand Total:</span>
                    <span style="color: var(--accent-primary)">₹${totalRounded}</span>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label>Amount Paid (₹)</label>
                    <div style="display:flex; gap: 8px;">
                        <button class="btn" id="btn-settle-full" style="flex: 1; padding: 10px 4px; background: var(--bg-color); color: var(--text-muted); border: 1px solid var(--border-color); font-size: 0.85rem; transition: all 0.2s; white-space: nowrap;">Paid Full</button>
                        <button class="btn" id="btn-settle-zero" style="flex: 1; padding: 10px 4px; background: var(--bg-color); color: var(--text-muted); border: 1px solid var(--border-color); font-size: 0.85rem; transition: all 0.2s; white-space: nowrap;">Unpaid</button>
                        <input type="number" id="settle-paid" class="form-control" value="${initialPaid > 0 ? initialPaid : ''}" placeholder="Amount" style="flex: 1; min-width: 0; padding: 10px 4px; text-align: center; border-radius: 99px; font-size: 0.85rem; transition: all 0.2s; background: var(--bg-color); color: var(--text-main); border: 1px solid var(--border-color); outline: none;">
                    </div>
                </div>

                <div class="flex-between" style="padding: 12px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1.5rem;">
                    <span style="font-weight:600; color: var(--text-muted);">Balance Status:</span>
                    <span id="settle-balance-text" style="font-weight:700; font-size: 1.1rem; color: var(--danger-color)">To Pay: ₹${totalRounded}</span>
                </div>

                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" style="flex:1" id="btn-settle-ok">Save Bill</button>
                    <button class="btn" style="flex:1; background: var(--bg-color); color: var(--text-main);" onclick="closeModal('settle-modal')">Cancel</button>
                </div>
            </div>
        </div>
    `;

    modalContainer.innerHTML = modalHtml;

    const paidInput = document.getElementById('settle-paid');
    const balanceText = document.getElementById('settle-balance-text');
    const btnFull = document.getElementById('btn-settle-full');
    const btnZero = document.getElementById('btn-settle-zero');

    let currentPaid = initialPaid;
    let settleMode = initialPaid === 0 ? 'zero' : (initialPaid === totalRounded && totalRounded > 0 ? 'full' : 'custom');

    const updateCalc = () => {
        let val = parseFloat(paidInput.value);
        if (isNaN(val) || val < 0) val = 0;
        currentPaid = val;

        const balance = totalRounded - currentPaid;

        if (balance > 0) {
            balanceText.textContent = `To Pay: ₹${balance}`;
            balanceText.style.color = 'var(--danger-color)';
        } else if (balance < 0) {
            balanceText.textContent = `Return: ₹${Math.abs(balance)}`;
            balanceText.style.color = '#0ea5e9'; // Light Blue
        } else {
            balanceText.textContent = 'Settled';
            balanceText.style.color = 'var(--success-text, #137333)';
        }

        // Reset styles
        btnFull.style.background = 'var(--bg-color)';
        btnFull.style.color = 'var(--text-muted)';
        btnFull.style.borderColor = 'var(--border-color)';

        btnZero.style.background = 'var(--bg-color)';
        btnZero.style.color = 'var(--text-muted)';
        btnZero.style.borderColor = 'var(--border-color)';

        paidInput.style.background = 'var(--bg-color)';
        paidInput.style.color = 'var(--text-main)';
        paidInput.style.borderColor = 'var(--border-color)';
        paidInput.style.boxShadow = 'none';

        if (settleMode === 'full') {
            btnFull.style.background = 'rgba(76, 175, 80, 0.15)';
            btnFull.style.color = '#2e7d32';
            btnFull.style.borderColor = '#4caf50';
        } else if (settleMode === 'zero') {
            btnZero.style.background = 'rgba(244, 67, 54, 0.15)';
            btnZero.style.color = '#c62828';
            btnZero.style.borderColor = '#f44336';
        } else if (settleMode === 'custom') {
            if (currentPaid > totalRounded) {
                // Return amount -> Light Blue
                paidInput.style.background = 'rgba(14, 165, 233, 0.15)'; // Blue tint
                paidInput.style.color = '#0ea5e9'; // Blue text
                paidInput.style.borderColor = '#0ea5e9'; // Blue border
                paidInput.style.boxShadow = '0 0 0 2px rgba(14, 165, 233, 0.3)';
            } else {
                // Partial -> Orange
                paidInput.style.background = 'var(--accent-light)';
                paidInput.style.color = 'var(--accent-primary)';
                paidInput.style.borderColor = 'var(--accent-primary)';
                paidInput.style.boxShadow = '0 0 0 2px var(--accent-light)';
            }
        }
    };

    // Initial calc
    updateCalc();

    paidInput.addEventListener('focus', () => {
        settleMode = 'custom';
        updateCalc();
    });

    paidInput.addEventListener('input', () => {
        settleMode = 'custom';
        updateCalc();
    });

    paidInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btn-settle-ok').click();
        }
    });

    document.getElementById('btn-settle-full').addEventListener('click', () => {
        settleMode = 'full';
        paidInput.value = totalRounded;
        updateCalc();
    });

    document.getElementById('btn-settle-zero').addEventListener('click', () => {
        settleMode = 'zero';
        paidInput.value = 0;
        updateCalc();
    });

    document.getElementById('btn-settle-ok').addEventListener('click', () => {
        const finalizedTx = { ...tx };
        finalizedTx.paidAmount = currentPaid;
        finalizedTx.balance = totalRounded - currentPaid;

        if (currentPaid >= totalRounded) {
            finalizedTx.paymentStatus = 'paid';
        } else if (currentPaid === 0) {
            finalizedTx.paymentStatus = 'unpaid';
        } else {
            finalizedTx.paymentStatus = 'partial';
        }

        finalizedTx.updates = finalizedTx.updates || (finalizedTx.updatedAt ? [{ date: finalizedTx.updatedAt, status: 'unknown' }] : []);
        finalizedTx.updates.push({
            date: Date.now(),
            status: finalizedTx.paymentStatus,
            balance: finalizedTx.balance
        });
        delete finalizedTx.updatedAt; // Cleanup the old property

        closeModal('settle-modal');
        if (onComplete) onComplete(finalizedTx);
    });
}

function updateCheckoutActionsVisibility() {
    const actionsContainer = document.getElementById('checkout-actions-container');
    if (!actionsContainer) return;

    const remarksInput = document.getElementById('checkout-remarks');
    const hasRemarks = (remarksInput && remarksInput.value.trim().length > 0) || Store.checkoutRemarks.trim().length > 0;
    const hasCartItems = Store.cart.length > 0;

    if (hasRemarks || hasCartItems) {
        actionsContainer.style.display = 'flex';
    } else {
        actionsContainer.style.display = 'none';
    }
}

function renderCheckoutPills() {
    const pillsContainer = document.getElementById('checkout-pills');
    const totalElement = document.getElementById('checkout-total-price');
    if (!pillsContainer || !totalElement) return;

    if (Store.cart.length === 0) {
        totalElement.textContent = '₹0';
        pillsContainer.innerHTML = '';
        updateCheckoutActionsVisibility();
        return;
    }

    let total = 0;
    pillsContainer.innerHTML = Store.cart.map((item, idx) => {
        total += item.cost;
        let addonNames = '';
        if (item.addons && item.addons.length > 0) {
            addonNames = ` <span style="font-size:0.75rem; color: #fff8;">(+ ${item.addons.map(a => `${a.name} ₹${a.price}`).join(', ')})</span>`;
        }

        let minNote = '';
        if (item.originalQty) minNote = `<div style="font-size:0.7rem; color: #fff8; margin-top:2px;">Original req: ${item.originalQty}${item.unit}</div>`;

        return `
            <div class="pill" data-idx="${idx}" style="background: var(--accent-light); color: var(--accent-primary); padding: 6px 14px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; justify-content: center; border: 1px solid var(--accent-primary);">
                <div style="display: flex; align-items: center; gap: 4px;">
                    ${item.name} (${item.qty}${item.unit}) ${addonNames} <span style="color:var(--text-main); margin-left:4px;">₹${item.cost.toFixed(2)}</span>
                </div>
                ${minNote}
            </div>
        `;
    }).join('');

    totalElement.textContent = '₹' + Math.round(total).toLocaleString('en-IN');

    pillsContainer.querySelectorAll('.pill').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.idx);
            const cartItem = Store.cart[idx];
            // Find underlying product to reopen modal
            const products = Store.getProducts();
            const prod = products.find(p => p.id === cartItem.productId) || { id: 'unk', name: cartItem.name, price: 0, unit: 'kg' };
            openCalculatorModal(prod, idx);
        });
    });

    updateCheckoutActionsVisibility();
}

// ==========================================
// HISTORY TAB LOGIC
// ==========================================
function initHistoryTab() {
    window.selectedHistoryIds = window.selectedHistoryIds || new Set();
    window.isHistorySelectMode = window.isHistorySelectMode || false;
    window.isDashboardCollapsed = window.isDashboardCollapsed || false;

    window.currentHistoryFilter = window.currentHistoryFilter || 'sales';

    const history = Store.getHistory();
    const listContainer = document.getElementById('history-list');
    const toggleBtn = document.getElementById('btn-toggle-history-select');
    const dashContainer = document.getElementById('history-dashboard-container');
    const dashToggle = document.getElementById('history-dash-toggle');
    const dashText = document.getElementById('dash-toggle-text');
    const viewHistory = document.getElementById('view-history');

    const setDashboardState = (collapsed, instant = false) => {
        window.isDashboardCollapsed = collapsed;

        if (instant) {
            dashContainer.classList.add('no-transition');
            // Force reflow
            void dashContainer.offsetHeight;
        }

        if (collapsed) {
            dashContainer.classList.add('collapsed');
            viewHistory.classList.add('dashboard-collapsed');
            dashText.textContent = 'Swipe down to Show Summary';
        } else {
            dashContainer.classList.remove('collapsed');
            viewHistory.classList.remove('dashboard-collapsed');
            dashText.textContent = 'Swipe up to Hide Summary';
        }

        if (instant) {
            // Remove the utility class after a frame to restore transitions for future moves
            setTimeout(() => {
                dashContainer.classList.remove('no-transition');
            }, 50);
        }
    };

    if (dashToggle && dashContainer) {
        // Shared toggle function
        const toggle = () => setDashboardState(!window.isDashboardCollapsed);
        dashToggle.addEventListener('click', toggle);

        // Touch gestures logic
        let touchStartY = 0;
        let touchStartX = 0;

        const handleStart = (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        };

        const handleEnd = (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = Math.abs(touchStartX - touchEndX);

            // Threshold of 40px and more vertical than horizontal
            if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > deltaX) {
                if (deltaY > 0) setDashboardState(true); // Swipe Up -> Collapse
                else setDashboardState(false);          // Swipe Down -> Expand
            }
        };

        // Apply listeners to both the dashboard and the handle
        [dashContainer, dashToggle].forEach(el => {
            el.addEventListener('touchstart', handleStart, { passive: true });
            el.addEventListener('touchend', handleEnd, { passive: true });
        });

        // Initialize state
        setDashboardState(window.isDashboardCollapsed, true);
    }

    if (history.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No previous transactions.</div>';

        window.isHistorySelectMode = false;
        if (toggleBtn) toggleBtn.style.display = 'none';
        const selectAllBtn = document.getElementById('btn-toggle-history-select-all');
        if (selectAllBtn) selectAllBtn.style.display = 'none';
        const bulkBar = document.getElementById('bulk-history-action-bar');
        if (bulkBar) bulkBar.classList.remove('visible');

        // Reset dashboard values
        document.getElementById('val-sales').textContent = '₹0';
        document.getElementById('val-net').textContent = '₹0';
        document.getElementById('val-pending').textContent = '₹0';
        document.getElementById('val-return').textContent = '₹0';
        document.getElementById('val-savings').textContent = '₹0';
        return;
    }
    if (toggleBtn) toggleBtn.style.display = 'block';

    if (!document.getElementById('bulk-history-action-bar')) {
        const bar = document.createElement('div');
        bar.id = 'bulk-history-action-bar';
        bar.className = 'bulk-action-bar';
        bar.style.cssText = 'position: absolute; bottom: 24px; left: 24px; right: 24px; background-color: var(--surface-color); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 8px 16px; display: none; justify-content: space-between; align-items: center; gap: 16px; box-shadow: var(--shadow-md); z-index: 20;';
        bar.innerHTML = `<span style="font-weight: 600; font-size: 0.9rem; flex: 1;"><span id="bulk-history-count">0</span> Selected</span><button class="btn btn-danger" id="btn-bulk-history-delete" style="margin: 0; padding: 6px 16px; width: auto; font-size: 0.85rem;">Delete</button>`;
        const viewHistory = document.getElementById('view-history');
        if (viewHistory) {
            viewHistory.style.position = 'relative';
            viewHistory.appendChild(bar);
        }

        document.getElementById('btn-bulk-history-delete').addEventListener('click', () => {
            const count = window.selectedHistoryIds.size;
            if (count === 0) return;
            modalContainer.innerHTML = `
                <div class="modal-overlay active" id="confirm-history-modal">
                    <div class="modal">
                        <h3 class="modal-title">Delete Transactions?</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--text-muted)">Are you sure you want to delete ${count} selected transaction(s)?</p>
                        <div class="input-row">
                            <button class="btn" style="background: transparent; color: var(--text-muted);" onclick="closeModal('confirm-history-modal')">Cancel</button>
                            <button class="btn btn-danger" id="btn-confirm-bulk-history-delete" style="margin-top: 0;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('btn-confirm-bulk-history-delete').addEventListener('click', () => {
                const currentHistory = Store.getHistory().filter(tx => !window.selectedHistoryIds.has(tx.id));
                Store.saveHistory(currentHistory);
                window.selectedHistoryIds.clear();
                window.isHistorySelectMode = false;
                initHistoryTab();
                closeModal('confirm-history-modal');
            });
        });
    }

    const bulkBar = document.getElementById('bulk-history-action-bar');
    const updateHistoryUI = () => {
        const count = window.selectedHistoryIds.size;
        document.getElementById('bulk-history-count').textContent = count;
        const delBtn = document.getElementById('btn-bulk-history-delete');
        if (count === 0) {
            delBtn.style.opacity = '0.5';
            delBtn.style.pointerEvents = 'none';
        } else {
            delBtn.style.opacity = '1';
            delBtn.style.pointerEvents = 'auto';
        }

        const historyCount = Store.getHistory().length;
        const selectAllBtn = document.getElementById('btn-toggle-history-select-all');
        if (selectAllBtn) {
            selectAllBtn.textContent = count === historyCount && historyCount > 0 ? 'Deselect All' : 'Select All';
            selectAllBtn.style.display = window.isHistorySelectMode ? 'block' : 'none';
        }

        if (window.isHistorySelectMode) {
            bulkBar.classList.add('visible');
            document.querySelectorAll('.hist-checkbox').forEach(cb => cb.style.display = 'inline-flex');
            document.querySelectorAll('.hist-edit-icon').forEach(icon => icon.style.display = 'none');
        } else {
            bulkBar.classList.remove('visible');
            document.querySelectorAll('.hist-checkbox').forEach(cb => cb.style.display = 'none');
            document.querySelectorAll('.hist-edit-icon').forEach(icon => icon.style.display = 'block');
        }

        const freshToggleBtn = document.getElementById('btn-toggle-history-select');
        if (freshToggleBtn) {
            freshToggleBtn.textContent = window.isHistorySelectMode ? 'Cancel' : 'Select';
            freshToggleBtn.style.color = window.isHistorySelectMode ? 'var(--text-muted)' : 'var(--accent-primary)';
        }
    };

    const validIds = new Set(history.map(t => t.id));
    window.selectedHistoryIds = new Set([...window.selectedHistoryIds].filter(id => validIds.has(id)));

    // --- Dashboard Calculations ---
    let totalSales = 0;
    let totalNet = 0;
    let totalPending = 0;
    let totalReturn = 0;
    let totalSavings = 0;

    history.forEach(t => {
        totalSales += t.total;

        if (t.paymentStatus === 'paid') {
            if (t.balance < 0) {
                // Completely paid, but has a return balance (amount paid > grandTotal)
                totalNet += t.paidAmount;
                totalReturn += Math.abs(t.balance);
                totalSavings += t.total;
            } else {
                // Exactly Paid
                totalNet += t.paidAmount;
                totalSavings += t.total;
            }
        } else if (t.paymentStatus === 'partial') {
            // Partially paid
            totalNet += t.paidAmount;
            totalPending += t.balance;
            totalSavings += t.paidAmount;
        } else if (t.paymentStatus === 'unpaid') {
            totalPending += t.balance;
        }
    });

    document.getElementById('val-sales').textContent = '₹' + Math.round(totalSales).toLocaleString('en-IN');
    document.getElementById('val-net').textContent = '₹' + Math.round(totalNet).toLocaleString('en-IN');
    document.getElementById('val-pending').textContent = '₹' + Math.round(totalPending).toLocaleString('en-IN');
    document.getElementById('val-return').textContent = '₹' + Math.round(totalReturn).toLocaleString('en-IN');
    document.getElementById('val-savings').textContent = '₹' + Math.round(totalSavings).toLocaleString('en-IN');

    // --- Filter Active State & Filtering ---
    document.querySelectorAll('.dashboard-filter-chip').forEach(chip => {
        chip.classList.remove('active');
        // Reset styles to default
        chip.style.borderColor = 'var(--border-color)';
        chip.style.background = 'var(--surface-color)';
    });

    const activeChip = document.getElementById('filter-' + window.currentHistoryFilter);
    if (activeChip) {
        activeChip.classList.add('active');
        if (window.currentHistoryFilter === 'sales') {
            activeChip.style.borderColor = 'var(--dash-orange)';
            activeChip.style.background = 'var(--dash-orange-light)';
        } else if (window.currentHistoryFilter === 'net') {
            activeChip.style.borderColor = 'var(--dash-yellow)';
            activeChip.style.background = 'var(--dash-yellow-light)';
        } else if (window.currentHistoryFilter === 'pending') {
            activeChip.style.borderColor = 'var(--dash-red)';
            activeChip.style.background = 'var(--dash-red-light)';
        } else if (window.currentHistoryFilter === 'return') {
            activeChip.style.borderColor = 'var(--dash-blue)';
            activeChip.style.background = 'var(--dash-blue-light)';
        } else if (window.currentHistoryFilter === 'savings') {
            activeChip.style.borderColor = 'var(--dash-green)';
            activeChip.style.background = 'var(--dash-green-light)';
        }
    }

    let filteredHistory = [...history]; // copy to avoid mutating original
    if (window.currentHistoryFilter === 'net') {
        filteredHistory = filteredHistory.filter(t => t.paymentStatus === 'paid' || t.paymentStatus === 'partial' || t.balance < 0);
    } else if (window.currentHistoryFilter === 'pending') {
        filteredHistory = filteredHistory.filter(t => t.paymentStatus === 'unpaid' || t.paymentStatus === 'partial');
    } else if (window.currentHistoryFilter === 'return') {
        filteredHistory = filteredHistory.filter(t => t.balance < 0);
    } else if (window.currentHistoryFilter === 'savings') {
        filteredHistory = filteredHistory.filter(t => t.paymentStatus === 'paid' || t.paymentStatus === 'partial');
    }

    // Apply Advanced Filters
    window.advancedFilters = window.advancedFilters || {
        dateSort: 'latest', // latest, oldest
        amountSort: 'none', // highest, lowest, none
        itemsSort: 'none',  // highest, lowest, none
        statusFilters: { paid: false, unpaid: false, partial: false, returnStatus: false },
        specificDate: null // string 'YYYY-MM-DD' or null
    };

    const af = window.advancedFilters;
    const anyStatusActive = af.statusFilters.paid || af.statusFilters.unpaid || af.statusFilters.partial || af.statusFilters.returnStatus;

    // Status & Date Filtering
    if (anyStatusActive || af.specificDate) {
        filteredHistory = filteredHistory.filter(t => {
            let matchesStatus = !anyStatusActive;
            if (anyStatusActive) {
                if (af.statusFilters.paid && t.paymentStatus === 'paid' && t.balance >= 0) matchesStatus = true;
                if (af.statusFilters.unpaid && t.paymentStatus === 'unpaid') matchesStatus = true;
                if (af.statusFilters.partial && t.paymentStatus === 'partial') matchesStatus = true;
                if (af.statusFilters.returnStatus && t.balance < 0) matchesStatus = true;
            }

            let matchesDate = true;
            if (af.specificDate) {
                // af.specificDate is YYYY-MM-DD local format from input type="date"
                const tDate = new Date(t.date);
                const localYYYYMMDD = tDate.getFullYear() + '-' + String(tDate.getMonth() + 1).padStart(2, '0') + '-' + String(tDate.getDate()).padStart(2, '0');
                matchesDate = localYYYYMMDD === af.specificDate;
            }

            return matchesStatus && matchesDate;
        });
    }

    // Composite Sorting
    filteredHistory.sort((a, b) => {
        let dateDiff = b.date - a.date; // Latest first
        if (af.dateSort === 'oldest') dateDiff = a.date - b.date;

        let amountDiff = 0;
        if (af.amountSort === 'highest') amountDiff = b.total - a.total;
        else if (af.amountSort === 'lowest') amountDiff = a.total - b.total;

        let itemsDiff = 0;
        if (af.itemsSort === 'highest') itemsDiff = b.items.length - a.items.length;
        else if (af.itemsSort === 'lowest') itemsDiff = a.items.length - b.items.length;

        // Priority 1: Amount
        if (af.amountSort !== 'none' && amountDiff !== 0) return amountDiff;
        // Priority 2: Items
        if (af.itemsSort !== 'none' && itemsDiff !== 0) return itemsDiff;
        // Priority 3: Date (fallback)
        return dateDiff;
    });

    const activeChipsContainer = document.getElementById('active-filters-chips');
    if (activeChipsContainer && window.advancedFilters) {
        let chipsHtml = '';
        const addChip = (label, type, val) => {
            let bg = 'var(--dash-orange-light)';
            let color = 'var(--dash-orange)';
            let border = 'var(--dash-orange)';
            let crossColor = 'var(--dash-orange)';

            if (type === 'statusFilters') {
                if (val === 'paid') { bg = 'var(--dash-green-light)'; color = 'var(--dash-green)'; border = 'var(--dash-green)'; crossColor = 'var(--dash-green)'; }
                if (val === 'unpaid') { bg = 'var(--dash-red-light)'; color = 'var(--dash-red)'; border = 'var(--dash-red)'; crossColor = 'var(--dash-red)'; }
                if (val === 'partial') { bg = 'var(--dash-yellow-light)'; color = 'var(--dash-yellow)'; border = 'var(--dash-yellow)'; crossColor = 'var(--dash-yellow)'; }
                if (val === 'returnStatus') { bg = 'var(--dash-blue-light)'; color = 'var(--dash-blue)'; border = 'var(--dash-blue)'; crossColor = 'var(--dash-blue)'; }
            }

            chipsHtml += `<div class="filter-chip-active" data-type="${type}" data-val="${val}" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:${bg}; border:1px solid ${border}; border-radius:99px; font-size:0.8rem; font-weight:600; color:${color}; white-space:nowrap; cursor:pointer; transition: opacity 0.2s;">
                ${label}
                <span style="font-weight:bold; color:${crossColor}; font-size:1rem; line-height:1;">&times;</span>
            </div>`;
        };

        if (af.dateSort === 'oldest') addChip('Oldest First', 'dateSort', 'latest');
        if (af.amountSort !== 'none') addChip(`Amt: ${af.amountSort}`, 'amountSort', 'none');
        if (af.itemsSort !== 'none') addChip(`Items: ${af.itemsSort}`, 'itemsSort', 'none');

        if (af.specificDate) {
            const dp = new Date(af.specificDate);
            addChip(dp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }), 'specificDate', null);
        }

        ['paid', 'unpaid', 'partial', 'returnStatus'].forEach(status => {
            if (af.statusFilters[status]) {
                const displayStatus = status === 'returnStatus' ? 'Return' : status.charAt(0).toUpperCase() + status.slice(1);
                addChip(displayStatus, 'statusFilters', status);
            }
        });

        activeChipsContainer.innerHTML = chipsHtml;

        activeChipsContainer.querySelectorAll('.filter-chip-active').forEach(chip => {
            chip.addEventListener('click', () => {
                const type = chip.dataset.type;
                const val = chip.dataset.val;
                if (type === 'statusFilters') {
                    window.advancedFilters.statusFilters[val] = false;
                } else if (type === 'specificDate') {
                    window.advancedFilters.specificDate = null;
                    const picker = document.getElementById('history-date-picker');
                    if (picker) picker.value = '';
                } else {
                    window.advancedFilters[type] = val;
                }
                initHistoryTab();
            });
        });
    }

    // Date Picker event listener
    const datePicker = document.getElementById('history-date-picker');
    if (datePicker && af.specificDate) datePicker.value = af.specificDate;
    if (datePicker) {
        // Clone and replace to prevent duplicate listeners
        const newPicker = datePicker.cloneNode(true);
        datePicker.parentNode.replaceChild(newPicker, datePicker);
        newPicker.addEventListener('change', (e) => {
            if (e.target.value) {
                window.advancedFilters.specificDate = e.target.value;
                initHistoryTab();
            } else {
                window.advancedFilters.specificDate = null;
                initHistoryTab();
            }
        });
    }

    if (filteredHistory.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No transactions in this view.</div>';
    } else {
        let lastDateString = null;
        const now = new Date();
        const todayStr = now.toLocaleDateString();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString();

        listContainer.innerHTML = filteredHistory.map((t) => {
            const index = history.findIndex(x => x.id === t.id);
            const d = new Date(t.date);
            const ds = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let headerHtml = '';
            // Only group by date if we are sorting by date (which is the default)
            if (af.dateSort !== 'none') {
                const tDateStr = d.toLocaleDateString();
                let displayDate = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                if (tDateStr === todayStr) displayDate = 'Today';
                else if (tDateStr === yesterdayStr) displayDate = 'Yesterday';

                if (displayDate !== lastDateString) {
                    headerHtml = `<div style="padding: 8px 0 4px 0; text-align: center; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); position: sticky; top: -1px; background: var(--bg-color); z-index: 1;">${displayDate}</div>`;
                    lastDateString = displayDate;
                }
            }

            const updates = t.updates || (t.updatedAt ? [{ date: t.updatedAt, status: t.paymentStatus }] : []);
            const updatesHtml = updates.map((u, i) => {
                const ud = new Date(u.date || u); // Fallback for old numeric arrays
                const timeStr = ud.toLocaleDateString() + ' ' + ud.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const statusStr = u.status ? ` - ${u.status.toUpperCase()}` : '';
                const balStr = u.balance !== undefined ? ` (Bal: ₹${u.balance})` : '';
                return `<div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 2px;">Update ${i + 1}: ${timeStr}${statusStr}${balStr}</div>`;
            }).join('');

            // Show up to 3 item names
            let names = t.items.slice(0, 3).map(i => i.name).join(', ');
            if (t.items.length > 3) names += ` + ${t.items.length - 3} more`;

            const remarksHtml = t.remarks ? `<div style="margin-top: 6px; padding: 4px 8px; background: var(--bg-color); border-radius: 4px; font-size: 0.8rem; color: var(--text-muted); border-left: 2px solid var(--accent-primary);"><em>"${t.remarks}"</em></div>` : '';

            let statusBadge = '';
            if (t.paymentStatus === 'paid') {
                if (t.balance < 0) {
                    statusBadge = `<span style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Return: ₹${Math.abs(t.balance)}</span>`;
                } else {
                    statusBadge = `<span style="background: rgba(76, 175, 80, 0.15); color: #2e7d32; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Paid</span>`;
                }
            } else if (t.paymentStatus === 'unpaid') {
                statusBadge = `<span style="background: rgba(244, 67, 54, 0.15); color: #c62828; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Unpaid</span>`;
            } else if (t.paymentStatus === 'partial') {
                statusBadge = `<span style="background: var(--accent-light); color: var(--accent-primary); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Partial (Bal: ₹${t.balance})</span>`;
            }

            const isChecked = window.selectedHistoryIds.has(t.id) ? 'checked' : '';
            const animDelay = Math.min(filteredHistory.indexOf(t) * 0.04, 0.4);
            return `
            ${headerHtml}
            <div class="card flex-between history-item" data-idx="${index}" data-id="${t.id}" style="align-items: flex-start; margin-bottom: 0.85rem; padding: 0.75rem 1rem; cursor: pointer; opacity: 0; animation: fadeInUp 0.3s ease-out forwards; animation-delay: ${animDelay}s;">
                <div style="display: flex; align-items: flex-start; flex: 1; padding-right: 12px; width: 100%;">
                    <input type="checkbox" class="checkbox-custom hist-checkbox" data-id="${t.id}" ${isChecked} style="pointer-events: none; margin-top: 2px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 1rem; margin-bottom: 4px; color: var(--text-main);">${names}</div>
                        <div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 2px;">Sale: ${ds} • ${t.items.length} items</div>
                        ${updatesHtml}
                        <div>${statusBadge}</div>
                        ${remarksHtml}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0;">
                    <div style="font-weight: 700; color: var(--accent-primary); font-size: 1.1rem; text-align: right;">
                        ₹${Math.round(t.total).toLocaleString('en-IN')}
                    </div>
                    <div class="hist-edit-icon" style="font-size: 0.75rem; color: var(--text-muted); margin-top: auto; display: flex; align-items: center; gap: 4px;">
                        Edit <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }


    setTimeout(() => {
        // Wire up dashboard chips
        ['sales', 'net', 'pending', 'return', 'savings'].forEach(filterName => {
            const chip = document.getElementById('filter-' + filterName);
            if (chip) {
                // Remove existing listeners by cloning
                const newChip = chip.cloneNode(true);
                chip.parentNode.replaceChild(newChip, chip);
                newChip.addEventListener('click', () => {
                    window.currentHistoryFilter = filterName;
                    initHistoryTab();
                });
            }
        });

        const freshCalendarBtn = document.getElementById('btn-history-calendar');
        if (freshCalendarBtn) {
            const newCalendarBtn = freshCalendarBtn.cloneNode(true);
            freshCalendarBtn.parentNode.replaceChild(newCalendarBtn, freshCalendarBtn);
            newCalendarBtn.addEventListener('click', () => {
                const picker = document.getElementById('history-date-picker');
                if (picker && typeof picker.showPicker === 'function') {
                    picker.showPicker();
                }
            });
        }

        const freshFilterBtn = document.getElementById('btn-history-filter');
        if (freshFilterBtn) {
            const newFilterBtn = freshFilterBtn.cloneNode(true);
            freshFilterBtn.parentNode.replaceChild(newFilterBtn, freshFilterBtn);

            // Highlight icon if filters are active
            const isFilterActive = window.advancedFilters && (
                window.advancedFilters.dateSort !== 'latest' ||
                window.advancedFilters.amountSort !== 'none' ||
                window.advancedFilters.itemsSort !== 'none' ||
                window.advancedFilters.statusFilters.paid ||
                window.advancedFilters.statusFilters.unpaid ||
                window.advancedFilters.statusFilters.partial ||
                window.advancedFilters.statusFilters.returnStatus
            );
            newFilterBtn.style.color = isFilterActive ? 'var(--accent-primary)' : 'var(--text-main)';

            newFilterBtn.addEventListener('click', () => {
                openHistoryFilterModal();
            });
        }

        const freshToggleAllBtn = document.getElementById('btn-toggle-history-select-all');
        if (freshToggleAllBtn) {
            const newToggleAllBtn = freshToggleAllBtn.cloneNode(true);
            freshToggleAllBtn.parentNode.replaceChild(newToggleAllBtn, freshToggleAllBtn);
            newToggleAllBtn.addEventListener('click', () => {
                const currentHistory = Store.getHistory();
                if (window.selectedHistoryIds.size === currentHistory.length) {
                    window.selectedHistoryIds.clear();
                } else {
                    currentHistory.forEach(tx => window.selectedHistoryIds.add(tx.id));
                }
                document.querySelectorAll('.hist-checkbox').forEach(cb => {
                    cb.checked = window.selectedHistoryIds.has(cb.dataset.id);
                });
                updateHistoryUI();
            });
        }

        const freshToggleBtn = document.getElementById('btn-toggle-history-select');
        if (freshToggleBtn) {
            const newToggleBtn = freshToggleBtn.cloneNode(true);
            freshToggleBtn.parentNode.replaceChild(newToggleBtn, freshToggleBtn);
            newToggleBtn.addEventListener('click', () => {
                window.isHistorySelectMode = !window.isHistorySelectMode;
                if (!window.isHistorySelectMode) window.selectedHistoryIds.clear();
                updateHistoryUI();
            });
        }

        listContainer.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const txId = el.dataset.id;
                if (window.isHistorySelectMode) {
                    if (window.selectedHistoryIds.has(txId)) {
                        window.selectedHistoryIds.delete(txId);
                        el.querySelector('.hist-checkbox').checked = false;
                    } else {
                        window.selectedHistoryIds.add(txId);
                        el.querySelector('.hist-checkbox').checked = true;
                    }
                    updateHistoryUI();
                } else {
                    const idx = parseInt(el.dataset.idx);
                    const tx = history[idx];
                    openSettlementModal(tx, (finalizedTx) => {
                        history[idx] = finalizedTx;
                        Store.saveHistory(history);
                        initHistoryTab(); // re-render
                    });
                }
            });
        });

        updateHistoryUI();
    }, 0);
}

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);

        // Unwind the history stack if a state was pushed for this modal
        if (history.state && history.state.appState === 'modal') {
            history.back();
        }
    }
}

// --- Back Navigation Support (Hardware Back Button) ---
let lastModalStatePushed = false;

window.addEventListener('load', () => {
    // Observe modal changes to push history state automatically
    const modalObserver = new MutationObserver(() => {
        const hasModal = document.querySelector('.modal-overlay.active');
        if (hasModal && !lastModalStatePushed) {
            history.pushState({ appState: 'modal' }, '');
            lastModalStatePushed = true;
        } else if (!hasModal && lastModalStatePushed) {
            lastModalStatePushed = false;
        }
    });

    if (modalContainer) {
        modalObserver.observe(modalContainer, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }
});

// Handle physical back button / swipe back
window.addEventListener('popstate', (e) => {
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    if (activeModals.length > 0) {
        // We are backing out of a modal, forcefully close it
        activeModals.forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 200);
        });
        lastModalStatePushed = false; // Reset internal tracking
    } else if (e.state && e.state.appState === 'tab') {
        const tab = e.state.tab;
        navItems.forEach(n => n.classList.remove('active'));
        const targetNav = document.querySelector(`.nav-item[data-tab="${tab}"]`);
        if (targetNav) targetNav.classList.add('active');
        if (window.currentActiveTab !== tab) {
            loadTab(tab);
        }
    } else if (!e.state) {
        history.replaceState({ appState: 'tab', tab: 'checkout' }, '', '#checkout');
        navItems.forEach(n => n.classList.remove('active'));
        const targetNav = document.querySelector(`.nav-item[data-tab="checkout"]`);
        if (targetNav) targetNav.classList.add('active');
        if (window.currentActiveTab !== 'checkout') {
            loadTab('checkout');
        }
    }
});

// Make init global
window.onload = init;

function openHistoryFilterModal() {
    window.advancedFilters = window.advancedFilters || {
        dateSort: 'latest',
        amountSort: 'none',
        itemsSort: 'none',
        statusFilters: { paid: false, unpaid: false, partial: false, returnStatus: false }
    };
    const af = window.advancedFilters;

    const modalHtml = `
        <div class="modal-overlay active" id="filter-modal">
            <div class="modal" style="max-height: 85vh; overflow-y: auto;">
                <h3 class="modal-title flex-between">
                    <span>Advanced Filters</span>
                    <button class="btn" id="btn-filter-clear" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--dash-red); font-size: 0.75rem; color: var(--dash-red); padding: 4px 10px; border-radius: 99px; font-weight: 600; width: fit-content; flex: 0 0 auto;">Clear All</button>
                </h3>
                
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Sort by Date</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="filter-btn ${af.dateSort === 'latest' ? 'active' : ''}" data-group="dateSort" data-val="latest">Latest First</button>
                        <button class="filter-btn ${af.dateSort === 'oldest' ? 'active' : ''}" data-group="dateSort" data-val="oldest">Oldest First</button>
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Sort by Amount</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="filter-btn ${af.amountSort === 'highest' ? 'active' : ''}" data-group="amountSort" data-val="highest">Highest Amount</button>
                        <button class="filter-btn ${af.amountSort === 'lowest' ? 'active' : ''}" data-group="amountSort" data-val="lowest">Lowest Amount</button>
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Sort by Item Count</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="filter-btn ${af.itemsSort === 'highest' ? 'active' : ''}" data-group="itemsSort" data-val="highest">Most Items</button>
                        <button class="filter-btn ${af.itemsSort === 'lowest' ? 'active' : ''}" data-group="itemsSort" data-val="lowest">Least Items</button>
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Filter by Status</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <button class="filter-btn multi paid ${af.statusFilters.paid ? 'active' : ''}" data-group="status" data-val="paid">Paid</button>
                        <button class="filter-btn multi unpaid ${af.statusFilters.unpaid ? 'active' : ''}" data-group="status" data-val="unpaid">Unpaid</button>
                        <button class="filter-btn multi partial ${af.statusFilters.partial ? 'active' : ''}" data-group="status" data-val="partial">Partial</button>
                        <button class="filter-btn multi returnStatus ${af.statusFilters.returnStatus ? 'active' : ''}" data-group="status" data-val="returnStatus">Return</button>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; margin-top: 1.5rem;">
                    <button class="btn btn-primary" style="flex:1; padding: 8px 12px; font-size: 0.85rem;" id="btn-filter-apply">Apply Filters</button>
                    <button class="btn" style="flex:1; background: var(--bg-color); color: var(--text-main); padding: 8px 12px; font-size: 0.85rem;" onclick="closeModal('filter-modal')">Cancel</button>
                </div>
            </div>
        </div>
        <style>
            .filter-btn {
                background: var(--surface-color);
                border: 1px solid var(--border-color);
                color: var(--text-main);
                padding: 8px 12px;
                border-radius: 99px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
                flex: 1;
                white-space: nowrap;
            }
            .filter-btn.active {
                background: var(--accent-light);
                color: var(--accent-primary);
                border-color: var(--accent-primary);
                font-weight: 600;
            }
        </style>
    `;

    modalContainer.innerHTML = modalHtml;

    // Single-selection groups
    ['dateSort', 'amountSort', 'itemsSort'].forEach(group => {
        document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isActive = btn.classList.contains('active');
                document.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));

                if (isActive) {
                    af[group] = 'none';
                } else {
                    btn.classList.add('active');
                    af[group] = btn.dataset.val;
                }
            });
        });
    });

    // Multi-selection status group
    document.querySelectorAll('.filter-btn.multi').forEach(btn => {
        btn.addEventListener('click', (e) => {
            btn.classList.toggle('active');
            af.statusFilters[btn.dataset.val] = btn.classList.contains('active');
        });
    });

    document.getElementById('btn-filter-clear').addEventListener('click', () => {
        af.dateSort = 'latest';
        af.amountSort = 'none';
        af.itemsSort = 'none';
        af.statusFilters = { paid: false, unpaid: false, partial: false, returnStatus: false };
        closeModal('filter-modal');
        initHistoryTab();
    });

    document.getElementById('btn-filter-apply').addEventListener('click', () => {
        if (af.amountSort === 'none' && af.itemsSort === 'none' && af.dateSort === 'none') {
            af.dateSort = 'latest'; // Fallback to explicitly select Date Sort if no other sort is set
        }
        closeModal('filter-modal');
        initHistoryTab(); // re-render list with new filters applied
    });
}
