# How to Run in Microsoft Edge

## Method 1: Using Local Server (Recommended) ✅

### Step 1: Start the Server
- **Option A**: Double-click `run-server.bat` file
- **Option B**: Open PowerShell in the project folder and run:
  ```powershell
  python -m http.server 8000
  ```

### Step 2: Open in Edge
1. Open **Microsoft Edge** browser
2. In the address bar, type: `http://localhost:8000`
3. Press **Enter**
4. The Medicine Stock Management application will load!

### Step 3: Keep Server Running
- Keep the terminal/PowerShell window open while using the app
- To stop the server, press `Ctrl+C` in the terminal

---

## Method 2: Direct File Opening (Quick Test)

### Step 1: Open File in Edge
1. Right-click on `index.html` file
2. Select **"Open with"** → **"Microsoft Edge"**
   OR
   - Open Microsoft Edge
   - Press `Ctrl+O` (or go to File → Open)
   - Navigate to the project folder
   - Select `index.html` and click Open

### Step 2: Check if it Works
- If the page loads correctly, you're done! ✅
- If you see errors about SQL.js or CORS, use **Method 1** instead

---

## Method 3: Drag and Drop

1. Open **Microsoft Edge** browser
2. Open File Explorer and navigate to the project folder
3. Drag the `index.html` file into the Edge browser window
4. The application should load!

---

## Troubleshooting

### If you see "CORS error" or "Failed to load SQL.js":
→ Use **Method 1** (local server) - this always works!

### If Python is not installed:
1. Download Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart your computer
4. Try Method 1 again

### If port 8000 is already in use:
- Change the port number in `run-server.bat` to 8001 or 8080
- Update the URL to `http://localhost:8001` (or your chosen port)

---

## Quick Start Checklist

- [ ] Start the server (double-click `run-server.bat`)
- [ ] Open Microsoft Edge
- [ ] Go to `http://localhost:8000`
- [ ] Start using the application!

---

**Note**: All your data is saved locally in Edge's browser storage, so it will persist even after closing the browser.



