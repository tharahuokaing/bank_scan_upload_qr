/* =========================================================
   HUOKAING THARA - BANK QR DETECTOR & SCANNER CONTROLLER
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements Binding
    const tabUpload = document.getElementById('tab-upload');
    const tabCamera = document.getElementById('tab-camera');
    const uploadSection = document.getElementById('upload-section');
    const cameraSection = document.getElementById('camera-section');
    
    const uploadBox = document.getElementById('upload-box');
    const qrInput = document.getElementById('qr-input');
    const previewImg = document.getElementById('preview-img');
    const uploadContent = document.querySelector('.upload-content');
    
    const video = document.getElementById('webcam');
    const amountInput = document.getElementById('amount');
    const merchantInput = document.getElementById('merchant-name');
    const currencySymbol = document.getElementById('currency-symbol');
    const rawDataTextarea = document.getElementById('raw-data');
    const statusMsg = document.getElementById('status-msg');
    const resetBtn = document.getElementById('reset-btn');
    const payBtn = document.getElementById('pay-btn');
    
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');

    let stream = null;
    let scanning = false;

    // Tab Switching Logic
    tabUpload.addEventListener('click', () => {
        tabUpload.classList.add('active');
        tabCamera.classList.remove('active');
        uploadSection.classList.remove('hidden');
        cameraSection.classList.add('hidden');
        stopCamera();
    });

    tabCamera.addEventListener('click', () => {
        tabCamera.classList.add('active');
        tabUpload.classList.remove('active');
        cameraSection.classList.remove('hidden');
        uploadSection.classList.add('hidden');
        startCamera();
    });

    // File Upload Trigger & Handler
    uploadBox.addEventListener('click', () => qrInput.click());
    qrInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                previewImg.src = e.target.result;
                previewImg.hidden = false;
                uploadContent.classList.add('hidden');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    processQRData(code.data);
                } else {
                    showStatus('No QR code detected in the uploaded image.', 'error');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Live Camera Scanner Functions
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            video.setAttribute('playsinline', true);
            video.play();
            scanning = true;
            requestAnimationFrame(scanFrame);
        } catch (err) {
            showStatus('Unable to access camera: ' + err.message, 'error');
        }
    }

    function stopCamera() {
        scanning = false;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    function scanFrame() {
        if (!scanning) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                processQRData(code.data);
                stopCamera(); // Stop camera on successful scan
                return;
            }
        }
        requestAnimationFrame(scanFrame);
    }

    // EMVCo QR Parser (ABA / Bakong / Standard Bank QR)
    function processQRData(qrString) {
        rawDataTextarea.value = qrString;
        const parsed = parseEMVCo(qrString);

        // Merchant Name (Tag 59)
        if (parsed['59']) {
            merchantInput.value = parsed['59'];
        } else {
            merchantInput.value = 'N/A';
        }

        // Currency Check (Tag 53: 116 = KHR, 840 = USD)
        if (parsed['53'] === '116') {
            currencySymbol.textContent = '៛';
        } else {
            currencySymbol.textContent = '$';
        }

        // Amount Check (Tag 54)
        if (parsed['54']) {
            amountInput.value = parseFloat(parsed['54']).toFixed(2);
            showStatus('QR Parsed successfully!', 'success');
        } else {
            amountInput.value = '';
            showStatus('Static QR Code scanned. Amount tag (Tag 54) not included in QR.', 'warning');
        }
    }

    function parseEMVCo(str) {
        const result = {};
        let index = 0;
        while (index < str.length) {
            const tag = str.substring(index, index + 2);
            const length = parseInt(str.substring(index + 2, index + 4), 10);
            if (isNaN(length)) break;
            const value = str.substring(index + 4, index + 4 + length);
            result[tag] = value;
            index += 4 + length;
        }
        return result;
    }

    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status-msg ${type}`;
    }

    // Confirm Payment Button Handler
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            const currentAmount = amountInput.value;
            const currentMerchant = merchantInput.value;

            if (!currentAmount || currentAmount <= 0) {
                showStatus('Please scan a valid QR code or enter an amount before paying.', 'error');
                return;
            }

            console.log(`[PAYMENT GATEWAY]: Processing transaction of ${currencySymbol.textContent}${currentAmount} to merchant: ${currentMerchant}`);
            showStatus(`Processing payment of ${currencySymbol.textContent}${currentAmount} to ${currentMerchant}...`, 'success');
            
            // Optional redirect trigger for banking node integration:
            // window.location.href = `https://tharahuokaing.github.io/deposit/?amount=${currentAmount}`;
        });
    }

    // Reset / Clear Controller
    resetBtn.addEventListener('click', () => {
        stopCamera();
        qrInput.value = '';
        previewImg.src = '';
        previewImg.hidden = true;
        uploadContent.classList.remove('hidden');
        amountInput.value = '';
        merchantInput.value = '';
        rawDataTextarea.value = '';
        currencySymbol.textContent = '$';
        statusMsg.className = 'status-msg hidden';
        
        if (tabCamera.classList.contains('active')) {
            startCamera();
        }
    });
});
