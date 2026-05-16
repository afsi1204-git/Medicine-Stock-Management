# SQLite Database Setup and Usage Guide

## ✅ Automatic Database Creation

**Good News!** The database is **automatically created** when you first open the application. You don't need to manually create it!

---

## How the Database is Created

### 1. **Automatic Initialization Process**

When you open `index.html` in your browser:

1. **SQL.js Library Loads** - The SQLite library loads from CDN
2. **Database Object Created** - A new SQLite database is created in memory
3. **Table Creation** - The `medicines` table is automatically created
4. **Storage** - Database is saved to browser's localStorage

### 2. **Database Schema (Auto-Created)**

The system automatically creates this table structure:

```sql
CREATE TABLE medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**Table Fields:**
- `id` - Unique identifier (auto-increments)
- `name` - Medicine name (required)
- `expiry_date` - Expiry date in YYYY-MM-DD format (required)
- `quantity` - Number of units in stock (required)
- `price` - Price per unit in ₹ (required)
- `created_at` - Timestamp when record was created (auto-filled)

---

## Verification Steps

### Step 1: Open the Application
1. Start the server: `python -m http.server 8000`
2. Open: `http://localhost:8000/index.html` in Edge

### Step 2: Check Browser Console
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Look for: `"Database initialized successfully!"`
4. If you see this message, database is ready! ✅

### Step 3: Test Database by Adding Medicine
1. Click **"Add Stock"**
2. Fill in the form:
   - Medicine Name: `Test Medicine`
   - Expiry Date: `2026-12-31` (future date)
   - Quantity: `100`
   - Price: `10.00`
3. Click **"Add/Update Stock"**
4. You should see: **"Medicine added to stock successfully!"** ✅

### Step 4: Verify Data is Stored
1. Click **"Check Stock"**
2. You should see your test medicine in the table
3. If it appears, database is working perfectly! ✅

---

## Database Location

### Storage Details:
- **Type**: Browser localStorage
- **Key**: `medicineDb`
- **Format**: Base64-encoded SQLite database file
- **Persistence**: Data survives browser restarts

### Physical Location (Windows):
- **Edge**: `%LocalAppData%\Microsoft\Edge\User Data\Default\Local Storage\leveldb\`
- **Chrome**: `%LocalAppData%\Google\Chrome\User Data\Default\Local Storage\leveldb\`

---

## Manual Database Operations (Advanced)

### View Database in Browser Console

Open Console (F12) and run:

```javascript
// Check if database exists
const dbData = localStorage.getItem('medicineDb');
console.log('Database exists:', dbData ? 'Yes' : 'No');
console.log('Database size:', dbData ? dbData.length + ' characters' : '0');
```

### View All Medicines

```javascript
// This requires the database to be initialized
// Run this after the page loads
if (db) {
    const result = db.exec("SELECT * FROM medicines");
    console.table(result[0].values);
}
```

### Clear/Reset Database

```javascript
// WARNING: This will delete all data!
localStorage.removeItem('medicineDb');
location.reload(); // Refresh page to recreate empty database
```

### Export Database (Backup)

```javascript
// Copy the database data
const dbData = localStorage.getItem('medicineDb');
console.log('Copy this value to backup:');
console.log(dbData);

// Save to file (manual step)
// 1. Copy the output
// 2. Paste into a text file
// 3. Save as backup.txt
```

### Import Database (Restore)

```javascript
// Paste your backup data here
const backupData = 'YOUR_BACKUP_DATA_HERE';

// Restore database
localStorage.setItem('medicineDb', backupData);
location.reload(); // Refresh to load restored database
```

---

## Database Operations in the Application

### 1. **Add Medicine** (INSERT)
- Adds new medicine or updates existing one
- Validates expiry date (cannot add expired)
- Auto-increments ID

### 2. **Update Stock** (UPDATE)
- Updates quantity when same medicine+expiry exists
- Updates price if changed

### 3. **Billing** (UPDATE)
- Reduces quantity when medicine is billed
- Validates stock availability
- Prevents billing expired medicines

### 4. **Check Stock** (SELECT)
- Displays all medicines
- Filters by search term
- Shows status (In Stock, Low Stock, Out of Stock, Expired)

---

## Troubleshooting

### Database Not Initializing?

1. **Check Internet Connection**
   - SQL.js loads from CDN
   - First load requires internet

2. **Check Browser Console (F12)**
   - Look for error messages
   - Common errors:
     - `initSqlJs is not defined` → Library not loaded
     - `CORS error` → Need to use local server (not file://)

3. **Try Hard Refresh**
   - Press `Ctrl + Shift + R`
   - Clears cache and reloads

4. **Check Browser Compatibility**
   - Works in: Chrome, Edge, Firefox (latest)
   - May not work in: Internet Explorer

### Database Corrupted?

1. **Clear and Recreate**
   ```javascript
   localStorage.removeItem('medicineDb');
   location.reload();
   ```

2. **Check Console for Errors**
   - F12 → Console tab
   - Look for SQL errors

### Data Not Persisting?

1. **Check localStorage is Enabled**
   - Some browsers block localStorage in private mode
   - Use normal browsing mode

2. **Check Browser Settings**
   - Ensure cookies/localStorage is allowed
   - Check privacy settings

---

## SQL Queries Used in Application

### Insert New Medicine
```sql
INSERT INTO medicines (name, expiry_date, quantity, price)
VALUES (?, ?, ?, ?)
```

### Update Existing Medicine
```sql
UPDATE medicines 
SET quantity = ?, price = ?
WHERE id = ?
```

### Select All Medicines
```sql
SELECT name, expiry_date, quantity, price
FROM medicines
ORDER BY name
```

### Select Available for Billing
```sql
SELECT id, name, expiry_date, quantity, price
FROM medicines
WHERE quantity > 0 AND expiry_date >= ?
ORDER BY name
```

### Update Stock After Billing
```sql
UPDATE medicines 
SET quantity = quantity - ?
WHERE id = ?
```

---

## Next Steps After Database Creation

1. ✅ **Database is Auto-Created** - No action needed
2. ✅ **Start Adding Medicines** - Use "Add Stock" page
3. ✅ **Process Bills** - Use "Billing" page
4. ✅ **Monitor Stock** - Use "Check Stock" page

---

## Summary

- ✅ **Database creates automatically** - Just open the app!
- ✅ **No manual setup required** - Everything is handled
- ✅ **Data persists** - Saved in browser localStorage
- ✅ **Ready to use** - Start adding medicines immediately

**You're all set! Just open the application and start using it!** 🎉


