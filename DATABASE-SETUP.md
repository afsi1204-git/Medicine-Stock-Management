# Database Setup Guide

## ✅ Automatic Setup - No Manual Configuration Required!

The database is **automatically set up** when you first open the application. You don't need to do anything manually!

---

## How It Works

### 1. **Automatic Initialization**
- When you open `index.html` in your browser, the database initializes automatically
- The system uses **SQLite** (via sql.js library) running entirely in your browser
- No server-side database installation needed!

### 2. **Database Structure**
The system automatically creates a table called `medicines` with the following structure:

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

### 3. **Data Storage**
- All data is stored in your **browser's localStorage**
- Data persists even after closing the browser
- Each browser has its own separate database

---

## Verification Steps

### Check if Database is Working:

1. **Open the Application**
   - Start the server and open `http://localhost:8000/index.html`

2. **Try Adding a Medicine**
   - Click "Add Stock"
   - Fill in the form:
     - Medicine Name: e.g., "Paracetamol"
     - Expiry Date: (select a future date)
     - Quantity: e.g., 100
     - Price: e.g., 5.00
   - Click "Add/Update Stock"
   - You should see a success message ✅

3. **Check Stock**
   - Click "Check Stock"
   - You should see the medicine you just added in the table

4. **Verify Billing**
   - Click "Billing"
   - Your medicine should appear in the dropdown

If all these work, your database is set up correctly! 🎉

---

## Troubleshooting

### If Database Doesn't Initialize:

1. **Check Browser Console**
   - Press `F12` to open Developer Tools
   - Go to "Console" tab
   - Look for any error messages

2. **Check Internet Connection**
   - The sql.js library loads from CDN
   - Make sure you have internet connection on first load

3. **Try Refreshing**
   - Press `F5` to refresh the page
   - The database will re-initialize

4. **Check Browser Compatibility**
   - Works best in: Chrome, Edge, Firefox (latest versions)
   - Make sure JavaScript is enabled

---

## Database Management

### Clear/Reset Database

If you want to start fresh and clear all data:

1. **Method 1: Using Browser Console**
   - Press `F12` to open Developer Tools
   - Go to "Console" tab
   - Type: `localStorage.removeItem('medicineDb')`
   - Press Enter
   - Refresh the page (F5)

2. **Method 2: Using Browser Settings**
   - Open Browser Settings
   - Go to Privacy/Security
   - Clear browsing data
   - Select "Local storage" or "Site data"
   - Clear data for `localhost:8000`

### Export Database (Advanced)

To backup your data, you can export it from the browser console:

```javascript
// In browser console (F12)
const dbData = localStorage.getItem('medicineDb');
console.log(dbData); // Copy this value to save it
```

### Import Database (Advanced)

To restore from backup:

```javascript
// In browser console (F12)
localStorage.setItem('medicineDb', 'YOUR_BACKUP_DATA_HERE');
location.reload(); // Refresh the page
```

---

## Database Location

- **Storage Type**: Browser localStorage
- **Key Name**: `medicineDb`
- **Format**: Base64 encoded SQLite database
- **Location**: 
  - Chrome/Edge: `%LocalAppData%\Microsoft\Edge\User Data\Default\Local Storage\`
  - Firefox: `%AppData%\Mozilla\Firefox\Profiles\[profile]\storage\default\`

---

## Features

✅ **Automatic Setup** - No configuration needed  
✅ **Persistent Storage** - Data survives browser restarts  
✅ **No Installation** - Works entirely in browser  
✅ **Fast Performance** - SQLite is very efficient  
✅ **Secure** - Data stored locally, never sent to server  

---

## Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Make sure you're using a modern browser
3. Try clearing the database and starting fresh
4. Ensure the server is running on `http://localhost:8000`



