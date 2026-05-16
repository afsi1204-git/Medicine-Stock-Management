# Running the Project in Edge from VS Code

## Method 1: Using VS Code Terminal (Recommended) ✅

### Step 1: Open Terminal in VS Code
1. Press `` Ctrl + ` `` (backtick) to open the integrated terminal
   OR
   - Go to **Terminal** → **New Terminal** from the menu

### Step 2: Start the Server
In the terminal, type:
```powershell
python -m http.server 8000
```
Press **Enter**

### Step 3: Open in Edge
1. Press `` Ctrl + Shift + P `` to open Command Palette
2. Type: `Simple Browser: Show`
3. Or manually open Edge and go to: `http://localhost:8000/index.html`

**OR** Right-click on `index.html` in VS Code → **Open with Live Server** (if you have the extension)

---

## Method 2: Using VS Code Live Server Extension

### Step 1: Install Live Server Extension
1. Click the **Extensions** icon in the left sidebar (or press `Ctrl + Shift + X`)
2. Search for **"Live Server"** by Ritwick Dey
3. Click **Install**

### Step 2: Run the Project
1. Right-click on `index.html` in the file explorer
2. Select **"Open with Live Server"**
3. Your default browser will open automatically
4. To use Edge specifically, change your default browser to Edge first

---

## Method 3: Using VS Code Tasks (Automated)

### Step 1: Create a Task
1. Press `` Ctrl + Shift + P ``
2. Type: `Tasks: Configure Task`
3. Select **"Create tasks.json file from template"**
4. Choose **"Others"**

### Step 2: Add This Configuration
Replace the content with:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start Server",
            "type": "shell",
            "command": "python -m http.server 8000",
            "problemMatcher": [],
            "isBackground": true,
            "presentation": {
                "reveal": "always",
                "panel": "new"
            }
        },
        {
            "label": "Open in Edge",
            "type": "shell",
            "command": "start msedge http://localhost:8000/index.html",
            "windows": {
                "command": "start msedge http://localhost:8000/index.html"
            },
            "dependsOn": "Start Server",
            "problemMatcher": []
        }
    ]
}
```

### Step 3: Run the Task
1. Press `` Ctrl + Shift + P ``
2. Type: `Tasks: Run Task`
3. Select **"Open in Edge"**

---

## Method 4: Quick Script (Easiest)

### Create a Launch Script
1. In VS Code, create a new file: `.vscode/launch.json` (if `.vscode` folder doesn't exist, create it)
2. Add this content:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch in Edge",
            "type": "msedge",
            "request": "launch",
            "url": "http://localhost:8000/index.html",
            "webRoot": "${workspaceFolder}",
            "preLaunchTask": "Start Server"
        }
    ]
}
```

3. Then use the tasks.json from Method 3
4. Press `F5` to launch!

---

## Quick Steps Summary (Fastest Way)

1. **Open Terminal**: Press `` Ctrl + ` ``
2. **Start Server**: Type `python -m http.server 8000` and press Enter
3. **Open Browser**: 
   - Press `` Ctrl + Shift + P ``
   - Type: `Simple Browser: Show`
   - Enter URL: `http://localhost:8000/index.html`

OR simply:
- Right-click `index.html` → **Reveal in File Explorer**
- Double-click `index.html` to open in Edge

---

## Troubleshooting

### If Python command doesn't work:
- Make sure Python is installed and in PATH
- Try `python3` instead of `python`
- Check: `python --version` in terminal

### If port 8000 is busy:
- Change port to 8001: `python -m http.server 8001`
- Update URL to: `http://localhost:8001/index.html`

### If Edge doesn't open:
- Manually open Edge
- Navigate to: `http://localhost:8000/index.html`

---

## Recommended VS Code Extensions

- **Live Server** - Auto-refresh on file changes
- **Python** - Better Python support
- **Prettier** - Code formatting
- **Auto Rename Tag** - HTML tag management


