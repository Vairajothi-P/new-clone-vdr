

// export const generateSecureHtmlWrapper = (docId, fileName, encryptedPayload, accessLevel = 'view') => {
//     const API_BASE = "http://localhost:3000";
//     const fileExt = fileName.split('.').pop().toLowerCase();

//     const isEditMode = accessLevel === 'edit' && (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv');
//     const titleBar = isEditMode ? `SECURE EDIT MODE: ${fileName}` : `SECURE VIEW: ${fileName}`;

//     const htmlContent = `<!DOCTYPE html>
// <html>
// <head>
//     <title>${titleBar}</title>
//     <script src="https://cdn.jsdelivr.net/npm/fernet@0.4.0/fernetBrowser.js"></script>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
//     <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js"></script>

//     <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/css/pluginsCss.css' />
//     <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/plugins.css' />
//     <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/css/luckysheet.css' />
//     <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/luckysheet/dist/assets/iconfont/iconfont.css' />
//     <script src="https://cdn.jsdelivr.net/npm/luckysheet/dist/plugins/js/plugin.js"></script>
//     <script src="https://cdn.jsdelivr.net/npm/luckysheet/dist/luckysheet.umd.js"></script>
//     <script src="https://cdn.jsdelivr.net/npm/luckyexcel/dist/luckyexcel.umd.js"></script>

//     <style>
//         body { margin: 0; background: #1e1e1e; color: white; font-family: sans-serif; user-select: none; -webkit-user-select: none; overflow: hidden; }
//         @media print { body { display: none !important; } }
        
//         .login-box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2d2d2d; padding: 40px; border-radius: 8px; text-align: center; width: 350px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 1000; }
        
//         /* 🔥 Updated Input Styles for the Eye Icon */
//         .input-group { position: relative; width: 100%; margin: 10px 0; }
//         .login-box input { width: 100%; padding: 12px; border: none; background: #1e1e1e; color: white; border-radius: 4px; box-sizing: border-box; }
//         .login-box input[type="password"], .login-box input.pwd-text { padding-right: 40px; }
//         .eye-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #888; font-size: 16px; user-select: none; }
//         .eye-icon:hover { color: white; }

//         .btn { background: #007acc; color: white; padding: 10px 20px; border: none; cursor: pointer; border-radius: 5px; font-weight: bold; width: 100%; margin-top: 15px; }
//         .btn-success { background: #28a745; }
        
//         #toolbar { display: none; height: 50px; background: #2d2d2d; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #444; }
//         #viewer-container { display: none; width: 100vw; height: calc(100vh - 50px); overflow: auto; padding: 20px 0; flex-direction: column; align-items: center; position: relative; }
        
//         .pdf-page-wrapper { margin-bottom: 20px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.5); pointer-events: none; }
//         .word-wrapper { background: white; color: black; padding: 60px; width: 210mm; min-height: 297mm; box-shadow: 0 4px 15px rgba(0,0,0,0.5); pointer-events: none; text-align: left; }
//         #luckysheet-container { margin: 0; padding: 0; position: absolute; width: 100%; height: 100%; left: 0; top: 0; }
//     </style>
// </head>
// <body>
//     <script>
//         document.addEventListener('contextmenu', e => e.preventDefault());
//         document.addEventListener('keydown', e => {
//             if (e.key === 'F12' || (e.ctrlKey && ['c', 'p', 's', 'i'].includes(e.key.toLowerCase()))) e.preventDefault();
//         });
//     </script>

//     <div id="login-ui" class="login-box">
//         <h2 style="margin-top:0;">${isEditMode ? 'Vault Edit Auth' : 'Vault View Auth'}</h2>
//         <p style="font-size: 11px; color: #888;">Doc ID: ${docId.substring(0, 8)}... | ${fileExt.toUpperCase()}</p>
        
//         <div class="input-group">
//             <input type="email" id="email" placeholder="Corporate Email">
//         </div>
        
//         <div class="input-group">
//             <input type="password" id="password" placeholder="Vault Password">
//             <span class="eye-icon" id="toggle-pwd" title="Show Password">👁️</span>
//         </div>

//         <button id="auth-btn" class="btn">Decrypt & Unlock</button>
//         <div id="error-msg" style="color: #ff4d4d; margin-top: 10px; font-size: 13px;"></div>
//     </div>

//     <div id="toolbar">
//         <span style="font-size: 14px; font-weight: bold;">${titleBar}</span>
//         ${isEditMode ? '<button id="save-btn" class="btn btn-success" style="width: auto; margin:0; padding: 6px 15px;">💾 Save & Sync to Vault</button>' : ''}
//     </div>

//     <div id="viewer-container"></div>

//     <script>
//         const SECURE_DATA = { 
//             docId: "${docId}", 
//             authUrl: "${API_BASE}/api/documents/unlock",
//             updateUrl: "${API_BASE}/api/documents/update",
//             encryptedPayload: "${encryptedPayload}",
//             fileExt: "${fileExt}",
//             isEditMode: ${isEditMode},
//             fernetKey: null 
//         };

//         // 🔥 Password Toggle Logic
//         document.getElementById('toggle-pwd').addEventListener('click', function() {
//             const pwdInput = document.getElementById('password');
//             if (pwdInput.type === 'password') {
//                 pwdInput.type = 'text';
//                 pwdInput.classList.add('pwd-text');
//                 this.innerText = '🙈';
//             } else {
//                 pwdInput.type = 'password';
//                 pwdInput.classList.remove('pwd-text');
//                 this.innerText = '👁️';
//             }
//         });

//         document.getElementById('auth-btn').addEventListener('click', async () => {
//             const email = document.getElementById('email').value.trim(); // Email is okay to trim
//             const password = document.getElementById('password').value;  // 🔥 FIX: NO TRIM ON PASSWORD!
            
//             const errorDiv = document.getElementById('error-msg');
//             if(!email || !password) return;
//             errorDiv.style.color = "#ccc"; errorDiv.innerText = "Authenticating with Server...";

//             try {
//                 const response = await fetch(SECURE_DATA.authUrl, {
//                     method: 'POST', headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ email, password, doc_id: SECURE_DATA.docId })
//                 });
//                 const authResult = await response.json();
//                 if (!response.ok || !authResult.success) throw new Error(authResult.message || "Access Denied by Vault.");

//                 errorDiv.style.color = "#28a745"; errorDiv.innerText = "Access Granted. Decrypting in RAM...";
//                 SECURE_DATA.fernetKey = authResult.fernet_key;

//                 const secret = new fernet.Secret(SECURE_DATA.fernetKey);
//                 const token = new fernet.Token({ token: SECURE_DATA.encryptedPayload, secret, ttl: 0 });
//                 const decryptedBase64 = token.decode(); 

//                 document.getElementById('login-ui').style.display = 'none';
//                 document.getElementById('toolbar').style.display = 'flex';
//                 const container = document.getElementById('viewer-container');
//                 container.style.display = (SECURE_DATA.fileExt === 'xlsx' || SECURE_DATA.fileExt === 'csv') ? 'block' : 'flex';

//                 if (SECURE_DATA.fileExt === 'pdf') {
//                     renderPDF(decryptedBase64, container);
//                 } else if (SECURE_DATA.fileExt === 'docx' || SECURE_DATA.fileExt === 'doc') {
//                     renderWord(decryptedBase64, container);
//                 } else if (SECURE_DATA.fileExt === 'xlsx' || SECURE_DATA.fileExt === 'csv') {
//                     renderExcel(decryptedBase64, container);
//                 } else {
//                     container.innerHTML = '<div style="color:red; padding: 20px;">Format unsupported for secure rendering.</div>';
//                 }

//             } catch (err) {
//                 errorDiv.style.color = "#ff4d4d"; errorDiv.innerText = err.message;
//             }
//         });

//         // ... (Keep the rest of your save-btn and render scripts exactly the same) ...

//         // 2. SAVE BUTTON SYNC (Only for Editors)
//         if (SECURE_DATA.isEditMode) {
//             document.getElementById('save-btn').addEventListener('click', async () => {
//                 const btn = document.getElementById('save-btn');
//                 btn.innerText = "Encrypting & Saving...";
                
//                 try {
//                     // Extract data from Luckysheet
//                     const allSheetData = luckysheet.getAllSheets();
                    
//                     // Convert JSON back to a raw string/blob representation
//                     // (Note: To rebuild a perfect .xlsx requires ExcelJS. Here we save the raw JSON state securely)
//                     const rawDataString = JSON.stringify(allSheetData);
//                     const base64Update = btoa(unescape(encodeURIComponent(rawDataString)));

//                     // Encrypt with Fernet in RAM
//                     const secret = new fernet.Secret(SECURE_DATA.fernetKey);
//                     const token = new fernet.Token({ secret });
//                     const newEncryptedPayload = token.encode(base64Update);

//                     // Push to Server
//                     const res = await fetch(SECURE_DATA.updateUrl, {
//                         method: 'POST', headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({ doc_id: SECURE_DATA.docId, new_encrypted_payload: newEncryptedPayload })
//                     });
                    
//                     if (!res.ok) throw new Error("Sync Failed");
//                     btn.innerText = "✅ Saved to Vault";
//                     setTimeout(() => btn.innerText = "💾 Save & Sync to Vault", 2000);
//                 } catch (e) {
//                     btn.innerText = "❌ Error Saving";
//                     alert(e.message);
//                 }
//             });
//         }

//         // ─── RENDERERS ───
//         async function renderPDF(base64String, container) {
//             const pdfjsLib = window['pdfjs-dist/build/pdf'];
//             pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
//             const bytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
//             const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
//             for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//                 const page = await pdf.getPage(pageNum);
//                 const viewport = page.getViewport({ scale: 1.5 });
//                 const wrapper = document.createElement('div');
//                 wrapper.className = 'pdf-page-wrapper';
//                 wrapper.style.width = viewport.width + 'px';
//                 wrapper.style.height = viewport.height + 'px';
//                 const canvas = document.createElement('canvas');
//                 canvas.width = viewport.width; canvas.height = viewport.height;
//                 wrapper.appendChild(canvas); container.appendChild(wrapper);
//                 await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
//             }
//         }

//         async function renderWord(base64String, container) {
//             const bytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
//             try {
//                 const res = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
//                 const wrapper = document.createElement('div');
//                 wrapper.className = 'word-wrapper';
//                 wrapper.innerHTML = res.value;
//                 container.appendChild(wrapper);
//             } catch (e) { container.innerHTML = '<div style="color:red;">Render Error</div>'; }
//         }

//         function renderExcel(base64String, container) {
//             const luckyDiv = document.createElement('div');
//             luckyDiv.id = 'luckysheet-container';
//             container.appendChild(luckyDiv);
//             container.style.padding = "0"; 

//             const file = new File([Uint8Array.from(atob(base64String), c => c.charCodeAt(0))], "file.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

//             LuckyExcel.transformExcelToLucky(file, function(exportJson, luckysheetfile) {
//                 window.luckysheet.destroy();
//                 window.luckysheet.create({
//                     container: 'luckysheet-container',
//                     data: exportJson.sheets,
//                     title: SECURE_DATA.docId,
//                     showinfobar: false,      // Hides branding
//                     showtoolbar: SECURE_DATA.isEditMode,      // Hides if viewing!
//                     showstatisticBar: true, 
//                     allowEdit: SECURE_DATA.isEditMode,        // LOCKS CELLS IF VIEWING!
//                     enableAddRow: SECURE_DATA.isEditMode,
//                     enableAddCol: SECURE_DATA.isEditMode,
//                     sheetFormulaBar: SECURE_DATA.isEditMode   // Hides formulas if viewing
//                 });
//             });
//         }
//     </script>
// </body>
// </html>`;

//     return new Blob([htmlContent], { type: 'text/html' });
// }; 