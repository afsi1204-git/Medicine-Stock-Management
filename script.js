let medicines = [];
let billingHistory = [];
let billItems = [];

function initApp() {
    medicines = [];
    billingHistory = [];
    billItems = [];
    loadBillingMedicines();
    loadStockTable();
    renderBillItems();
}

function showPage(pageId) {
    document.querySelectorAll('.container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

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

function isExpired(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(dateString);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    setTimeout(() => {
        messageEl.className = 'message';
    }, 5000);
}

function clearMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = '';
    messageEl.className = 'message';
}

document.getElementById('addStockForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('medicineName').value.trim();
    const expiryDate = document.getElementById('expiryDate').value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    const price = parseFloat(document.getElementById('price').value);

    if (isExpired(expiryDate)) {
        showMessage('addStockMessage', 'Error: Cannot add expired medicine to stock!', 'error');
        return;
    }

    if (!name || !expiryDate || !quantity || quantity <= 0 || isNaN(price) || price < 0) {
        showMessage('addStockMessage', 'Please fill in all fields with valid values.', 'error');
        return;
    }

    try {
        const existingIndex = medicines.findIndex(item => item.name.toLowerCase() === name.toLowerCase() && item.expiry_date === expiryDate);

        if (existingIndex >= 0) {
            medicines[existingIndex].quantity += quantity;
            medicines[existingIndex].price = price;
            showMessage('addStockMessage', `Stock updated successfully! New quantity: ${medicines[existingIndex].quantity}`, 'success');
        } else {
            medicines.push({
                id: Date.now(),
                name: name,
                expiry_date: expiryDate,
                quantity: quantity,
                price: price
            });
            showMessage('addStockMessage', 'Medicine added to stock successfully!', 'success');
        }

        document.getElementById('addStockForm').reset();
        setTimeout(() => {
            loadBillingMedicines();
            loadStockTable();
        }, 200);
    } catch (error) {
        console.error('Error adding stock:', error);
        showMessage('addStockMessage', 'Error adding stock. Please try again.', 'error');
    }
});

function loadBillingMedicines() {
    const select = document.getElementById('billingMedicine');
    select.innerHTML = '<option value="">-- Select Medicine --</option>';

    const today = new Date().toISOString().split('T')[0];
    const availableMedicines = medicines
        .filter(item => item.quantity > 0 && item.expiry_date >= today)
        .sort((a, b) => a.name.localeCompare(b.name));

    availableMedicines.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (Exp: ${item.expiry_date}) - Stock: ${item.quantity}`;
        option.dataset.quantity = item.quantity;
        option.dataset.price = item.price;
        select.appendChild(option);
    });
}

document.getElementById('billingMedicine').addEventListener('change', function() {
    const selected = this.options[this.selectedIndex];
    if (selected && selected.value) {
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

function updateTotalAmount() {
    const quantity = parseInt(document.getElementById('billingQuantity').value, 10) || 0;
    const price = parseFloat(document.getElementById('unitPrice').textContent) || 0;
    const total = quantity * price;
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

function addToBill() {
    const medicineSelect = document.getElementById('billingMedicine');
    const quantity = parseInt(document.getElementById('billingQuantity').value, 10);

    if (!medicineSelect.value) {
        showMessage('billingMessage', 'Please select a medicine!', 'error');
        return;
    }

    if (!quantity || quantity <= 0) {
        showMessage('billingMessage', 'Please enter a valid quantity!', 'error');
        return;
    }

    const selected = medicineSelect.options[medicineSelect.selectedIndex];
    const availableStock = parseInt(selected.dataset.quantity, 10);

    if (quantity > availableStock) {
        showMessage('billingMessage', `Only ${availableStock} units available in stock!`, 'error');
        return;
    }

    const medicineId = parseInt(medicineSelect.value, 10);
    const medicine = medicines.find(item => item.id === medicineId);
    if (!medicine) {
        showMessage('billingMessage', 'Selected medicine not found.', 'error');
        return;
    }

    if (isExpired(medicine.expiry_date)) {
        showMessage('billingMessage', 'Error: Cannot bill expired medicine!', 'error');
        return;
    }

    const price = parseFloat(selected.dataset.price);
    const total = quantity * price;
    const existingIndex = billItems.findIndex(item => item.id === medicineId);

    if (existingIndex >= 0) {
        billItems[existingIndex].quantity += quantity;
        billItems[existingIndex].total = billItems[existingIndex].quantity * price;
    } else {
        billItems.push({
            id: medicineId,
            name: medicine.name,
            quantity: quantity,
            price: price,
            total: total
        });
    }

    renderBillItems();
    clearMessage('billingMessage');

    medicineSelect.value = '';
    document.getElementById('billingQuantity').value = '';
    document.getElementById('availableStock').textContent = '0';
    document.getElementById('unitPrice').textContent = '0.00';
    document.getElementById('totalAmount').textContent = '0.00';
}

function renderBillItems() {
    const container = document.getElementById('billItemsList');
    container.innerHTML = '';

    if (billItems.length === 0) {
        container.innerHTML = '<div class="empty-state">No items in bill</div>';
        document.getElementById('processBillBtn').style.display = 'none';
        document.getElementById('grandTotal').textContent = '0.00';
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

    const grandTotal = billItems.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
}

function removeBillItem(index) {
    billItems.splice(index, 1);
    renderBillItems();
}

function processBill() {
    if (billItems.length === 0) {
        showMessage('billingMessage', 'No items in bill!', 'error');
        return;
    }

    try {
        for (const item of billItems) {
            const medicine = medicines.find(m => m.id === item.id);
            if (!medicine) {
                showMessage('billingMessage', `Medicine ${item.name} not found!`, 'error');
                return;
            }
            if (isExpired(medicine.expiry_date)) {
                showMessage('billingMessage', `Error: ${item.name} is expired and cannot be billed!`, 'error');
                return;
            }
            if (item.quantity > medicine.quantity) {
                showMessage('billingMessage', `Insufficient stock for ${item.name}!`, 'error');
                return;
            }
            medicine.quantity -= item.quantity;
        }

        const grandTotal = billItems.reduce((sum, item) => sum + item.total, 0);
        saveBillHistory(billItems, grandTotal);
        showMessage('billingMessage', `Bill processed successfully! Total: ₹${grandTotal.toFixed(2)}`, 'success');
        clearBill();

        setTimeout(() => {
            loadBillingMedicines();
            loadStockTable();
        }, 200);
    } catch (error) {
        console.error('Error processing bill:', error);
        showMessage('billingMessage', 'Error processing bill. Please try again.', 'error');
    }
}

function clearBill() {
    billItems = [];
    renderBillItems();
    clearMessage('billingMessage');
}

function saveBillHistory(items, total) {
    const billTime = new Date().toISOString();
    billingHistory.unshift({
        bill_time: billTime,
        items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total
        })),
        total: total
    });
}

function loadBillingHistory() {
    const tbody = document.getElementById('billingHistoryBody');
    tbody.innerHTML = '';
    clearMessage('billingHistoryMessage');

    if (billingHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No billing history found</td></tr>';
        return;
    }

    billingHistory.forEach(record => {
        const itemsText = record.items.map(item => `${item.name} x${item.quantity}`).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(record.bill_time).toLocaleString()}</td>
            <td>${itemsText}</td>
            <td>₹${parseFloat(record.total).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function loadStockTable() {
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    const searchTerm = document.getElementById('searchMedicine').value.trim().toLowerCase();
    const rows = medicines
        .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm))
        .sort((a, b) => a.name.localeCompare(b.name));

    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No medicines found</td></tr>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rows.forEach(item => {
        const expiryDate = new Date(item.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        let statusClass = 'in-stock';
        let statusText = 'In Stock';

        if (expiryDate < today) {
            statusClass = 'expired';
            statusText = 'Expired';
        } else if (item.quantity === 0) {
            statusClass = 'out-of-stock';
            statusText = 'Out of Stock';
        } else if (item.quantity < 10) {
            statusClass = 'low-stock';
            statusText = 'Low Stock';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.expiry_date}</td>
            <td>${item.quantity}</td>
            <td>₹${parseFloat(item.price).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('searchMedicine').addEventListener('input', loadStockTable);

window.addEventListener('load', function() {
    initApp();
});
