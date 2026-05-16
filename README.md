# Medicine Stock Management System

A web-based medicine stock management application with green and white theme, built using HTML, CSS, JavaScript, and SQLite.

## How to Run the Project

### Option 1: Using Python (Easiest - Recommended)

If you have Python installed:

1. Open PowerShell or Command Prompt in the project folder
2. Run one of these commands:

**For Python 3:**
```bash
python -m http.server 8000
```

**For Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

3. Open your browser and go to: `http://localhost:8000`

### Option 2: Using Node.js

If you have Node.js installed:

1. Install a simple HTTP server globally:
```bash
npm install -g http-server
```

2. Navigate to the project folder and run:
```bash
http-server -p 8000
```

3. Open your browser and go to: `http://localhost:8000`

### Option 3: Using VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Direct File Opening (May not work due to CORS)

Simply double-click `index.html` to open it in your browser. However, this may not work properly due to browser security restrictions with SQL.js WASM files.

## Features

- ✅ Add/Update Medicine Stock
- ✅ Billing System with Automatic Stock Reduction
- ✅ Check Stock Levels
- ✅ Expiry Date Validation
- ✅ Prevents Adding/Billing Expired Medicines
- ✅ Out of Stock Prevention
- ✅ Search Functionality
- ✅ Beautiful Green & White Theme with Transitions

## Browser Compatibility

Works best with modern browsers:
- Chrome/Edge (Recommended)
- Firefox
- Safari

## Data Storage

All data is stored locally in your browser using SQLite (via localStorage). Your data persists even after closing the browser.



