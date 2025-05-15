import React, { useState, useEffect } from 'react';

// --- Constants for Sales Form ---
const SALE_PLATFORMS = ['eBay', 'Facebook Marketplace', 'Nextdoor', 'Etsy', 'Other'];

// Helper to generate unique user-facing Item Numbers
const generateItemNumber = () => {
  const randomNumber = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `ITEM-${randomNumber}`;
};

// Helper to generate internal unique IDs for React keys
const generateInternalId = () => '_inv_' + Math.random().toString(36).substr(2, 9);

// Define initial inventory items
const initialInventoryItems = [
  { 
    id: generateInternalId(), 
    itemNumber: generateItemNumber(), 
    itemName: 'Vintage T-Shirt - Band Edition', 
    description: 'Rare 1990s band t-shirt, size L', 
    itemCost: 4.00, 
    purchaseShippingCost: 1.00, 
    purchaseSalesTax: 0.00, 
    totalPurchasePrice: 5.00,
    quantityInStock: 10, 
    supplier: 'Retro Finds Co.',
    purchaseDate: '2024-04-15'
  },
  { 
    id: generateInternalId(), 
    itemNumber: generateItemNumber(), 
    itemName: 'Antique Ceramic Vase', 
    description: 'Hand-painted, 19th century', 
    itemCost: 60.00, 
    purchaseShippingCost: 5.00, 
    purchaseSalesTax: 5.00, 
    totalPurchasePrice: 70.00,
    quantityInStock: 3, 
    supplier: 'Estate Sales Inc.',
    purchaseDate: '2024-03-20'
  },
  { 
    id: generateInternalId(), 
    itemNumber: generateItemNumber(), 
    itemName: 'Action Figure - Hero X', 
    description: 'Limited edition, mint condition', 
    itemCost: 25.00, 
    purchaseShippingCost: 3.00, 
    purchaseSalesTax: 2.00, 
    totalPurchasePrice: 30.00,
    quantityInStock: 0, // Example of an out-of-stock item
    supplier: 'Collectibles R Us',
    purchaseDate: '2024-05-01'
  },
];

// Main App Component
function App() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [currentItemForForm, setCurrentItemForForm] = useState(null); // Used for both edit and log sale
  const [isLoggingSale, setIsLoggingSale] = useState(false); // New state for sales modal
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const processedInitialItems = initialInventoryItems.map(item => ({
        ...item,
        totalPurchasePrice: (item.itemCost || 0) + (item.purchaseShippingCost || 0) + (item.purchaseSalesTax || 0)
    }));
    setInventoryItems(processedInitialItems);
  }, []);

  const handleAddItem = (itemData) => {
    const newItemNumber = generateItemNumber();
    const internalId = generateInternalId();
    const totalPurchasePrice = (itemData.itemCost || 0) + (itemData.purchaseShippingCost || 0) + (itemData.purchaseSalesTax || 0);
    setInventoryItems([...inventoryItems, { ...itemData, id: internalId, itemNumber: newItemNumber, totalPurchasePrice }]);
    setIsAddingItem(false);
  };

  const handleUpdateItem = (updatedItemData) => {
    const totalPurchasePrice = (updatedItemData.itemCost || 0) + (updatedItemData.purchaseShippingCost || 0) + (updatedItemData.purchaseSalesTax || 0);
    setInventoryItems(inventoryItems.map(item => 
        item.id === updatedItemData.id ? { ...item, ...updatedItemData, totalPurchasePrice } : item
    ));
    setIsEditingItem(false);
    setCurrentItemForForm(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      setInventoryItems(inventoryItems.filter(item => item.id !== itemId));
    }
  };

  // --- Handlers for opening/closing forms ---
  const openAddInventoryForm = () => {
    setIsAddingItem(true);
    setIsEditingItem(false);
    setIsLoggingSale(false);
    setCurrentItemForForm(null);
  };

  const openEditInventoryForm = (item) => {
    setCurrentItemForForm(item);
    setIsEditingItem(true);
    setIsAddingItem(false);
    setIsLoggingSale(false);
  };

  const openLogSaleForm = (item) => {
    setCurrentItemForForm(item);
    setIsLoggingSale(true);
    setIsAddingItem(false);
    setIsEditingItem(false);
  };

  const closeAllForms = () => {
    setIsAddingItem(false);
    setIsEditingItem(false);
    setIsLoggingSale(false);
    setCurrentItemForForm(null);
  };

  // --- Handler for when a sale is logged from inventory ---
  const handleLogSaleFromInventory = (saleDetails, inventoryItemId, quantitySold) => {
    console.log("Sale Logged from Inventory:", {
        inventoryItemNumber: inventoryItems.find(i => i.id === inventoryItemId)?.itemNumber,
        ...saleDetails
    });
    // Decrement stock
    setInventoryItems(prevItems => 
        prevItems.map(item => 
            item.id === inventoryItemId 
            ? { ...item, quantityInStock: item.quantityInStock - quantitySold } 
            : item
        )
    );
    closeAllForms();
  };


  const filteredItems = inventoryItems.filter(item =>
    (item.itemName && item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.itemNumber && item.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-screen-xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            Inventory Tracker
          </h1>
        </header>

        {isAddingItem && (
          <InventoryForm
            onSave={handleAddItem}
            onCancel={closeAllForms}
            formTitle="Add New Inventory Item"
          />
        )}
        {isEditingItem && currentItemForForm && (
          <InventoryForm
            itemToEdit={currentItemForForm}
            onSave={handleUpdateItem}
            onCancel={closeAllForms}
            formTitle="Edit Inventory Item"
          />
        )}
        {isLoggingSale && currentItemForForm && (
          <LogSaleFromInventoryForm
            inventoryItem={currentItemForForm}
            onSave={handleLogSaleFromInventory}
            onCancel={closeAllForms}
          />
        )}

        {!isAddingItem && !isEditingItem && !isLoggingSale && (
          <div className="bg-slate-800 shadow-2xl rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full sm:w-2/3 lg:w-1/2">
                <input
                  type="text"
                  placeholder="Search by Item Name or Item Number..."
                  className="w-full p-3 pl-10 rounded-lg bg-slate-700 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <button
                onClick={openAddInventoryForm}
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                Add New Item
              </button>
            </div>
            <InventoryList items={filteredItems} onEdit={openEditInventoryForm} onDelete={handleDeleteItem} onLogSale={openLogSaleForm} />
          </div>
        )}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} InventoryTrack Systems. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

// InventoryForm Component (for adding/editing inventory)
function InventoryForm({ itemToEdit, onSave, onCancel, formTitle }) {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [purchaseShippingCost, setPurchaseShippingCost] = useState('');
  const [purchaseSalesTax, setPurchaseSalesTax] = useState('');
  const [quantityInStock, setQuantityInStock] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');

  const currentTotalPurchasePrice = 
    (parseFloat(itemCost) || 0) + 
    (parseFloat(purchaseShippingCost) || 0) + 
    (parseFloat(purchaseSalesTax) || 0);

  useEffect(() => {
    if (itemToEdit) {
      setItemName(itemToEdit.itemName || '');
      setDescription(itemToEdit.description || '');
      setItemCost(itemToEdit.itemCost ? itemToEdit.itemCost.toString() : '');
      setPurchaseShippingCost(itemToEdit.purchaseShippingCost ? itemToEdit.purchaseShippingCost.toString() : '');
      setPurchaseSalesTax(itemToEdit.purchaseSalesTax ? itemToEdit.purchaseSalesTax.toString() : '');
      setQuantityInStock(itemToEdit.quantityInStock ? itemToEdit.quantityInStock.toString() : '');
      setSupplier(itemToEdit.supplier || '');
      setPurchaseDate(itemToEdit.purchaseDate || new Date().toISOString().split('T')[0]);
    } else {
      setItemName('');
      setDescription('');
      setItemCost('');
      setPurchaseShippingCost('');
      setPurchaseSalesTax('');
      setQuantityInStock('');
      setSupplier('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
    }
    setErrorMessage('');
  }, [itemToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!itemName || quantityInStock === '' || !purchaseDate) {
      setErrorMessage('Please fill in Item Name, Quantity in Stock, and Purchase Date.');
      return;
    }
    // ... (rest of validation from previous version)
    const numericFields = [
        { value: itemCost, name: 'Item Cost', optional: false },
        { value: purchaseShippingCost, name: 'Purchase Shipping Cost', optional: true },
        { value: purchaseSalesTax, name: 'Purchase Sales Tax', optional: true },
    ];
    for (const field of numericFields) {
        if (field.value !== '') {
            if (isNaN(parseFloat(field.value)) || parseFloat(field.value) < 0) {
                setErrorMessage(`${field.name} must be a valid positive number if entered.`);
                return;
            }
        } else if (!field.optional) {
            setErrorMessage(`${field.name} is required.`);
            return;
        }
    }
    if (isNaN(parseInt(quantityInStock, 10)) || parseInt(quantityInStock, 10) < 0) {
        setErrorMessage('Quantity in Stock must be a valid non-negative number.');
        return;
    }
    const itemData = {
      itemName, description,
      itemCost: parseFloat(itemCost) || 0,
      purchaseShippingCost: parseFloat(purchaseShippingCost) || 0,
      purchaseSalesTax: parseFloat(purchaseSalesTax) || 0,
      quantityInStock: parseInt(quantityInStock, 10),
      supplier, purchaseDate,
    };
    if (itemToEdit) {
        itemData.id = itemToEdit.id;
        itemData.itemNumber = itemToEdit.itemNumber;
    }
    onSave(itemData);
  };

  const inputClass = "w-full p-3 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        <h2 className="text-2xl font-semibold text-sky-400 mb-6">{formTitle}</h2>
        {itemToEdit && itemToEdit.itemNumber && (
            <p className="mb-4 text-sm text-slate-400">Item Number: <span className="font-semibold text-slate-200">{itemToEdit.itemNumber}</span></p>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 text-red-400 border border-red-500/50">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label htmlFor="itemName" className={labelClass}>Item Name <span className="text-red-400">*</span></label><input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="purchaseDate" className={labelClass}>Purchase Date <span className="text-red-400">*</span></label><input type="date" id="purchaseDate" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputClass} /></div>
          </div>
          <div><label htmlFor="description" className={labelClass}>Description</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-24`} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label htmlFor="itemCost" className={labelClass}>Item Cost ($) <span className="text-red-400">*</span></label><input type="number" id="itemCost" value={itemCost} onChange={(e) => setItemCost(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
            <div><label htmlFor="purchaseShippingCost" className={labelClass}>Purchase Shipping ($)</label><input type="number" id="purchaseShippingCost" value={purchaseShippingCost} onChange={(e) => setPurchaseShippingCost(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
            <div><label htmlFor="purchaseSalesTax" className={labelClass}>Purchase Sales Tax ($)</label><input type="number" id="purchaseSalesTax" value={purchaseSalesTax} onChange={(e) => setPurchaseSalesTax(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
          </div>
          <div><label className={labelClass}>Total Purchase Price ($)</label><input type="text" value={`$${currentTotalPurchasePrice.toFixed(2)}`} className={`${inputClass} bg-slate-600 cursor-not-allowed`} readOnly /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label htmlFor="quantityInStock" className={labelClass}>Quantity in Stock <span className="text-red-400">*</span></label><input type="number" id="quantityInStock" value={quantityInStock} onChange={(e) => setQuantityInStock(e.target.value)} className={inputClass} min="0" /></div>
            <div><label htmlFor="supplier" className={labelClass}>Supplier</label><input type="text" id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} className={inputClass} /></div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">{itemToEdit ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- New Component: LogSaleFromInventoryForm ---
function LogSaleFromInventoryForm({ inventoryItem, onSave, onCancel }) {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [platform, setPlatform] = useState(SALE_PLATFORMS[0]);
  const [quantitySold, setQuantitySold] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [shippingCost, setShippingCost] = useState(''); // Sale shipping cost
  const [salesTax, setSalesTax] = useState('');       // Sale sales tax
  const [platformFees, setPlatformFees] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const maxQuantity = inventoryItem.quantityInStock;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const soldQty = parseInt(quantitySold, 10);

    if (!saleDate || !platform || quantitySold === '' || salePrice === '') {
      setErrorMessage('Please fill in Sale Date, Platform, Quantity Sold, and Sale Price.');
      return;
    }
    if (isNaN(soldQty) || soldQty <= 0) {
      setErrorMessage('Quantity Sold must be a positive number.');
      return;
    }
    if (soldQty > maxQuantity) {
      setErrorMessage(`Quantity Sold cannot exceed available stock (${maxQuantity}).`);
      return;
    }

    const numericSaleFields = [
        { value: salePrice, name: 'Sale Price' },
        { value: shippingCost, name: 'Shipping Cost (Sale)', optional: true },
        { value: salesTax, name: 'Sales Tax (Sale)', optional: true },
        { value: platformFees, name: 'Platform Fees', optional: true },
    ];

    for (const field of numericSaleFields) {
        if (field.value !== '') {
            if (isNaN(parseFloat(field.value)) || parseFloat(field.value) < 0) {
                setErrorMessage(`${field.name} must be a valid positive number if entered.`);
                return;
            }
        }
    }
    
    const saleDetails = {
      itemName: inventoryItem.itemName, // Pre-filled
      // Use inventoryItem.itemNumber as the link to the inventory.
      // In the Sales Tracker, this would correspond to 'inventoryItemNumber' or a similar field.
      inventoryItemNumber: inventoryItem.itemNumber, 
      saleDate,
      platform,
      quantitySold: soldQty,
      salePrice: parseFloat(salePrice),
      shippingCost: shippingCost ? parseFloat(shippingCost) : 0,
      salesTax: salesTax ? parseFloat(salesTax) : 0,
      platformFees: platformFees ? parseFloat(platformFees) : 0,
      // listingId can be added here if needed, or kept separate in a more advanced sales system
    };
    onSave(saleDetails, inventoryItem.id, soldQty);
  };

  const inputClass = "w-full p-3 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow"; // Changed focus color
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl transform transition-all">
        <h2 className="text-2xl font-semibold text-emerald-400 mb-2">Log Sale for:</h2>
        <p className="text-lg text-slate-200 mb-1 font-medium">{inventoryItem.itemName}</p>
        <p className="text-sm text-slate-400 mb-6">Item Number: {inventoryItem.itemNumber} (Available: {maxQuantity})</p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 text-red-400 border border-red-500/50">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label htmlFor="saleDate" className={labelClass}>Sale Date <span className="text-red-400">*</span></label><input type="date" id="saleDate" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="platform" className={labelClass}>Platform <span className="text-red-400">*</span></label>
              <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClass}>
                {SALE_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label htmlFor="quantitySold" className={labelClass}>Quantity Sold <span className="text-red-400">*</span></label><input type="number" id="quantitySold" value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} className={inputClass} min="1" max={maxQuantity} /></div>
            <div><label htmlFor="salePrice" className={labelClass}>Sale Price (per item) ($) <span className="text-red-400">*</span></label><input type="number" id="salePrice" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label htmlFor="shippingCost" className={labelClass}>Shipping Cost ($)</label><input type="number" id="shippingCost" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
            <div><label htmlFor="salesTax" className={labelClass}>Sales Tax ($)</label><input type="number" id="salesTax" value={salesTax} onChange={(e) => setSalesTax(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
            <div><label htmlFor="platformFees" className={labelClass}>Platform Fees ($)</label><input type="number" id="platformFees" value={platformFees} onChange={(e) => setPlatformFees(e.target.value)} className={inputClass} min="0" step="0.01" /></div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all">Log This Sale</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// InventoryList Component - Added onLogSale prop
function InventoryList({ items, onEdit, onDelete, onLogSale }) {
  if (items.length === 0) {
    return <p className="text-center text-slate-400 py-8">No items in inventory. Add your first item!</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-700/50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Item Number</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Item Name</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">Purchase Date</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-sky-300 uppercase tracking-wider">Qty in Stock</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-sky-300 uppercase tracking-wider">Total Purch. Price</th>
            <th className="px-3 py-3 text-center text-xs font-medium text-sky-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-slate-800 divide-y divide-slate-700">
          {items.map((item) => (
            <InventoryItem key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onLogSale={onLogSale} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// InventoryItem Component - Added onLogSale button and logic
function InventoryItem({ item, onEdit, onDelete, onLogSale }) {
  const canLogSale = item.quantityInStock > 0;
  return (
    <tr className="hover:bg-slate-700/70 transition-colors duration-150">
      <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-300">{item.itemNumber}</td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-slate-100" title={item.description}>{item.itemName}</td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-slate-300">{item.purchaseDate}</td>
      <td className={`px-3 py-4 whitespace-nowrap text-sm text-right ${item.quantityInStock === 0 ? 'text-red-500 font-semibold' : 'text-slate-300'}`}>{item.quantityInStock}</td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-slate-100 text-right">${item.totalPurchasePrice ? item.totalPurchasePrice.toFixed(2) : '0.00'}</td>
      <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1">
        <button 
            onClick={() => onLogSale(item)} 
            disabled={!canLogSale}
            className={`p-1 rounded transition-colors ${canLogSale ? 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'}`} 
            title={canLogSale ? "Log Sale for this Item" : "Out of Stock"}
        >
            {/* Log Sale Icon (e.g., a dollar sign or cart icon) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
        </button>
        <button onClick={() => onEdit(item)} className="text-sky-400 hover:text-sky-300 transition-colors p-1 rounded hover:bg-slate-700" title="Edit Item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
        </button>
        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-700" title="Delete Item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        </button>
      </td>
    </tr>
  );
}

export default App;
