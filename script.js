// Database initialization
let db = null;
let SQL = null;

// Initialize SQLite database
async function initDatabase() {
    try {
        // Check if initSqlJs is available
        if (typeof initSqlJs === 'undefined') {
            console.error('SQL.js library not loaded. Waiting for library...');
            // Wait a bit and try again
            setTimeout(() => {
                if (typeof initSqlJs !== 'undefined') {
                    initDatabase();
                } else {
                    showMessage('addStockMessage', 'SQL.js library failed to load. Please check your internet connection and refresh the page.', 'error');
                }
            }, 1000);
            return;
        }
        
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        if (!SQL) {
            throw new Error('SQL.js library not loaded');
        }
        
        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem('medicineDb');
        let isNewDb = false;
        
        if (savedDb) {
            try {
                const binary = atob(savedDb);
                const buffer = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    buffer[i] = binary.charCodeAt(i);
                }
                db = new SQL.Database(buffer);
            } catch (e) {
                // If loading fails, create new database
                console.log('Creating new database:', e);
                db = new SQL.Database();
                isNewDb = true;
            }
        } else {
            db = new SQL.Database();
            isNewDb = true;
        }
        
        // Ensure medicines table exists
        db.run(`
            CREATE TABLE IF NOT EXISTS medicines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                expiry_date TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Ensure billing history table exists
        db.run(`
            CREATE TABLE IF NOT EXISTS billing_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bill_time TEXT NOT NULL,
                items TEXT NOT NULL,
                total REAL NOT NULL
            )
        `);
        
        saveDatabase();
        
        // Load initial data
        loadBillingMedicines();
        loadStockTable();
        
        console.log('Database initialized successfully!');
        
        // Show success message on main menu if this is first load
        if (document.getElementById('mainMenu').classList.contains('active')) {
            // Database ready, no message needed
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        const errorMsg = error.message || 'Unknown error';
        console.error('Full error:', error);
        
        // Show error on all pages
        const errorMessage = `Database initialization failed. Error: ${errorMsg}. Please check console (F12) for details and refresh the page.`;
        showMessage('addStockMessage', errorMessage, 'error');
        
        // If we're on main menu, show error there too
        if (document.getElementById('mainMenu').classList.contains('active')) {
            const mainMenu = document.getElementById('mainMenu');
            let errorDiv = mainMenu.querySelector('.db-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'message error db-error';
                errorDiv.style.marginTop = '20px';
                mainMenu.querySelector('.menu-card').appendChild(errorDiv);
            }
            errorDiv.textContent = errorMessage;
            errorDiv.className = 'message error db-error';
        }
    }
}

// Save database to localStorage
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = new Uint8Array(data);
        const binary = String.fromCharCode.apply(null, buffer);
        localStorage.setItem('medicineDb', btoa(binary));
    }
}

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Load data when switching pages
    if (pageId === 'billing') {
        loadBillingMedicines();
        clearBill();
    } else if (pageId === 'billingHistory') {
        loadBillingHistory();
    } else if (pageId === 'checkStock') {
        loadStockTable();
    } else if (pageId === 'addStock') {
        document.getElementById('addStockForm').reset();
        clearMessage('addStockMessage');
    }
}

// Check if date is expired
function isExpired(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(dateString);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
}

// Show message
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.className = 'message';
    }, 5000);
}

// Clear message
function clearMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = '';
    messageEl.className = 'message';
}

// Add Stock Form Handler
document.getElementById('addStockForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('medicineName').value.trim();
    const expiryDate = document.getElementById('expiryDate').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    
    // Validate expiry date
    if (isExpired(expiryDate)) {
        showMessage('addStockMessage', 'Error: Cannot add expired medicine to stock!', 'error');
        return;
    }
    
    if (!db || !SQL) {
        showMessage('addStockMessage', 'Database not initialized. Please wait a moment and try again, or refresh the page.', 'error');
        // Try to reinitialize
        if (typeof initSqlJs !== 'undefined') {
            initDatabase();
        }
        return;
    }
    
    try {
        // Check if medicine already exists
        const existing = db.exec(`
            SELECT id, quantity FROM medicines 
            WHERE name = ? AND expiry_date = ?
        `, [name, expiryDate]);
        
        if (existing.length > 0 && existing[0].values.length > 0) {
            // Update existing medicine
            const existingId = existing[0].values[0][0];
            const existingQuantity = existing[0].values[0][1];
            const newQuantity = existingQuantity + quantity;
            
            db.run(`
                UPDATE medicines 
                SET quantity = ?, price = ?
                WHERE id = ?
            `, [newQuantity, price, existingId]);
            
            showMessage('addStockMessage', 
                `Stock updated successfully! New quantity: ${newQuantity}`, 'success');
        } else {
            // Insert new medicine
            db.run(`
                INSERT INTO medicines (name, expiry_date, quantity, price)
                VALUES (?, ?, ?, ?)
            `, [name, expiryDate, quantity, price]);
            
            showMessage('addStockMessage', 'Medicine added to stock successfully!', 'success');
        }
        
        saveDatabase();
        document.getElementById('addStockForm').reset();
        
        // Update other pages
        setTimeout(() => {
            loadBillingMedicines();
            loadStockTable();
        }, 500);
        
    } catch (error) {
        console.error('Error adding stock:', error);
        showMessage('addStockMessage', 'Error adding stock. Please try again.', 'error');
    }
});

// Load medicines for billing dropdown
function loadBillingMedicines() {
    if (!db) return;
    
    const select = document.getElementById('billingMedicine');
    select.innerHTML = '<option value="">-- Select Medicine --</option>';
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const result = db.exec(`
            SELECT id, name, expiry_date, quantity, price
            FROM medicines
            WHERE quantity > 0 AND expiry_date >= ?
            ORDER BY name
        `, [today]);
        
        if (result.length > 0 && result[0].values.length > 0) {
            result[0].values.forEach(row => {
                const option = document.createElement('option');
                option.value = row[0]; // id
                option.textContent = `${row[1]} (Exp: ${row[2]}) - Stock: ${row[3]}`;
                option.dataset.quantity = row[3];
                option.dataset.price = row[4];
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading medicines:', error);
    }
}

// Update billing info when medicine is selected
document.getElementById('billingMedicine').addEventListener('change', function() {
    const selected = this.options[this.selectedIndex];
    if (selected.value) {
        document.getElementById('availableStock').textContent = selected.dataset.quantity || 0;
        document.getElementById('unitPrice').textContent = parseFloat(selected.dataset.price || 0).toFixed(2);
        document.getElementById('billingQuantity').max = selected.dataset.quantity || 0;
        document.getElementById('billingQuantity').value = '';
        updateTotalAmount();
    } else {
        document.getElementById('availableStock').textContent = '0';
        document.getElementById('unitPrice').textContent = '0.00';
        document.getElementById('totalAmount').textContent = '0.00';
    }
});

// Update total amount
document.getElementById('billingQuantity').addEventListener('input', updateTotalAmount);

function updateTotalAmount() {
    const quantity = parseInt(document.getElementById('billingQuantity').value) || 0;
    const price = parseFloat(document.getElementById('unitPrice').textContent) || 0;
    const total = quantity * price;
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// Bill items array
let billItems = [];

// Add to bill
function addToBill() {
    const medicineSelect = document.getElementById('billingMedicine');
    const quantity = parseInt(document.getElementById('billingQuantity').value);
    
    if (!medicineSelect.value) {
        showMessage('billingMessage', 'Please select a medicine!', 'error');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        showMessage('billingMessage', 'Please enter a valid quantity!', 'error');
        return;
    }
    
    const selected = medicineSelect.options[medicineSelect.selectedIndex];
    const availableStock = parseInt(selected.dataset.quantity);
    
    if (quantity > availableStock) {
        showMessage('billingMessage', `Only ${availableStock} units available in stock!`, 'error');
        return;
    }
    
    // Check expiry date
    const medicineId = parseInt(medicineSelect.value);
    try {
        const result = db.exec(`
            SELECT expiry_date FROM medicines WHERE id = ?
        `, [medicineId]);
        
        if (result.length > 0 && result[0].values.length > 0) {
            const expiryDate = result[0].values[0][0];
            if (isExpired(expiryDate)) {
                showMessage('billingMessage', 'Error: Cannot bill expired medicine!', 'error');
                return;
            }
        }
    } catch (error) {
        console.error('Error checking expiry:', error);
    }
    
    const medicineName = selected.textContent.split(' (')[0];
    const price = parseFloat(selected.dataset.price);
    const total = quantity * price;
    
    // Check if already in bill
    const existingIndex = billItems.findIndex(item => item.id === medicineId);
    if (existingIndex >= 0) {
        billItems[existingIndex].quantity += quantity;
        billItems[existingIndex].total = billItems[existingIndex].quantity * price;
    } else {
        billItems.push({
            id: medicineId,
            name: medicineName,
            quantity: quantity,
            price: price,
            total: total
        });
    }
    
    renderBillItems();
    clearMessage('billingMessage');
    
    // Reset form
    medicineSelect.value = '';
    document.getElementById('billingQuantity').value = '';
    document.getElementById('availableStock').textContent = '0';
    document.getElementById('unitPrice').textContent = '0.00';
    document.getElementById('totalAmount').textContent = '0.00';
}

// Render bill items
function renderBillItems() {
    const container = document.getElementById('billItemsList');
    container.innerHTML = '';
    
    if (billItems.length === 0) {
        container.innerHTML = '<div class="empty-state">No items in bill</div>';
        document.getElementById('processBillBtn').style.display = 'none';
        return;
    }
    
    document.getElementById('processBillBtn').style.display = 'block';
    
    billItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'bill-item';
        div.innerHTML = `
            <div class="bill-item-info">
                <strong>${item.name}</strong><br>
                <small>Qty: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${item.total.toFixed(2)}</small>
            </div>
            <div class="bill-item-actions">
                <button class="remove-btn" onclick="removeBillItem(${index})">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    // Update grand total
    const grandTotal = billItems.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
}

// Remove bill item
function removeBillItem(index) {
    billItems.splice(index, 1);
    renderBillItems();
}

// Process bill
function processBill() {
    if (billItems.length === 0) {
        showMessage('billingMessage', 'No items in bill!', 'error');
        return;
    }
    
    if (!db) {
        showMessage('billingMessage', 'Database not initialized. Please refresh the page.', 'error');
        return;
    }
    
    try {
        // Process each item
        for (const item of billItems) {
            // Check stock and expiry again
            const result = db.exec(`
                SELECT quantity, expiry_date FROM medicines WHERE id = ?
            `, [item.id]);
            
            if (result.length === 0 || result[0].values.length === 0) {
                showMessage('billingMessage', `Medicine ${item.name} not found!`, 'error');
                return;
            }
            
            const currentQuantity = result[0].values[0][0];
            const expiryDate = result[0].values[0][1];
            
            if (isExpired(expiryDate)) {
                showMessage('billingMessage', `Error: ${item.name} is expired and cannot be billed!`, 'error');
                return;
            }
            
            if (item.quantity > currentQuantity) {
                showMessage('billingMessage', `Insufficient stock for ${item.name}!`, 'error');
                return;
            }
            
            // Update stock
            const newQuantity = currentQuantity - item.quantity;
            db.run(`
                UPDATE medicines SET quantity = ? WHERE id = ?
            `, [newQuantity, item.id]);
        }
        
        saveDatabase();
        
        const grandTotal = billItems.reduce((sum, item) => sum + item.total, 0);
        // Save history before clearing bill
        saveBillHistory(billItems, grandTotal);
        
        showMessage('billingMessage', 
            `Bill processed successfully! Total: ₹${grandTotal.toFixed(2)}`, 'success');
        
        // Clear bill
        clearBill();
        
        // Reload data
        setTimeout(() => {
            loadBillingMedicines();
            loadStockTable();
        }, 500);
        
    } catch (error) {
        console.error('Error processing bill:', error);
        showMessage('billingMessage', 'Error processing bill. Please try again.', 'error');
    }
}

// Clear bill
function clearBill() {
    billItems = [];
    renderBillItems();
    clearMessage('billingMessage');
}

// Save billing history
function saveBillHistory(items, total) {
    if (!db) return;
    const billTime = new Date().toISOString();
    const itemsJson = JSON.stringify(items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
    })));
    try {
        db.run(`
            INSERT INTO billing_history (bill_time, items, total)
            VALUES (?, ?, ?)
        `, [billTime, itemsJson, total]);
        saveDatabase();
    } catch (error) {
        console.error('Error saving billing history:', error);
    }
}

// Load billing history
function loadBillingHistory() {
    if (!db) return;
    const tbody = document.getElementById('billingHistoryBody');
    const messageEl = document.getElementById('billingHistoryMessage');
    tbody.innerHTML = '';
    clearMessage('billingHistoryMessage');

    try {
        const result = db.exec(`SELECT bill_time, items, total FROM billing_history ORDER BY bill_time DESC`);
        if (result.length > 0 && result[0].values.length > 0) {
            result[0].values.forEach(row => {
                const [billTime, itemsJson, total] = row;
                const items = JSON.parse(itemsJson);
                const itemsText = items.map(item => `${item.name} x${item.quantity}`).join(', ');
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(billTime).toLocaleString()}</td>
                    <td>${itemsText}</td>
                    <td>₹${parseFloat(total).toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No billing history found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading billing history:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Error loading billing history</td></tr>';
        showMessage('billingHistoryMessage', 'Error loading billing history. Please refresh the page.', 'error');
    }
}

// Load stock table
function loadStockTable() {
    if (!db) return;
    
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';
    
    try {
        const searchTerm = document.getElementById('searchMedicine').value.trim().toLowerCase();
        let query = 'SELECT name, expiry_date, quantity, price FROM medicines';
        let params = [];
        
        if (searchTerm) {
            query += ' WHERE LOWER(name) LIKE ?';
            params.push(`%${searchTerm}%`);
        }
        
        query += ' ORDER BY name';
        
        const result = db.exec(query, params);
        
        if (result.length > 0 && result[0].values.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            
            result[0].values.forEach(row => {
                const [name, expiryDate, quantity, price] = row;
                const tr = document.createElement('tr');
                
                let statusClass = 'in-stock';
                let statusText = 'In Stock';
                
                if (isExpired(expiryDate)) {
                    statusClass = 'expired';
                    statusText = 'Expired';
                } else if (quantity === 0) {
                    statusClass = 'out-of-stock';
                    statusText = 'Out of Stock';
                } else if (quantity < 10) {
                    statusClass = 'low-stock';
                    statusText = 'Low Stock';
                }
                
                tr.innerHTML = `
                    <td>${name}</td>
                    <td>${expiryDate}</td>
                    <td>${quantity}</td>
                    <td>₹${parseFloat(price).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No medicines found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading stock:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Error loading stock data</td></tr>';
    }
}

// Search functionality
document.getElementById('searchMedicine').addEventListener('input', loadStockTable);

// Initialize on page load - wait for SQL.js to be available
function waitForSqlJs() {
    if (typeof initSqlJs !== 'undefined') {
        initDatabase();
    } else {
        // Wait a bit longer for the library to load
        setTimeout(waitForSqlJs, 100);
    }
}

// Start initialization when page loads
window.addEventListener('load', function() {
    // Give the script a moment to load
    setTimeout(waitForSqlJs, 500);
});

