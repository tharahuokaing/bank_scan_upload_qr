document.addEventListener('DOMContentLoaded', () => {
  const uploadBox = document.getElementById('upload-box');
  const qrInput = document.getElementById('qr-input');
  const previewImg = document.getElementById('preview-img');
  const uploadContent = document.querySelector('.upload-content');
  const amountInput = document.getElementById('amount');
  const currencySymbol = document.getElementById('currency-symbol');
  const rawDataTextarea = document.getElementById('raw-data');
  const statusMsg = document.getElementById('status-msg');
  const resetBtn = document.getElementById('reset-btn');
  const canvas = document.getElementById('qr-canvas');
  const ctx = canvas.getContext('2d');

  // Trigger file selection on box click
  uploadBox.addEventListener('click', () => qrInput.click());

  // Handle Drag and Drop
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#2563eb';
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#d1d5db';
  });

  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#d1d5db';
    if (e.dataTransfer.files.length) {
      qrInput.files = e.dataTransfer.files;
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Handle file select
  qrInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  });

  // Reset UI
  resetBtn.addEventListener('click', () => {
    qrInput.value = '';
    previewImg.src = '';
    previewImg.hidden = true;
    uploadContent.classList.remove('hidden');
    amountInput.value = '';
    rawDataTextarea.value = '';
    currencySymbol.textContent = '$';
    hideStatus();
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Show preview image
        previewImg.src = e.target.result;
        previewImg.hidden = false;
        uploadContent.classList.add('hidden');

        // Draw image onto canvas to process pixels
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          rawDataTextarea.value = code.data;
          parseBankQR(code.data);
        } else {
          showStatus('No QR code detected in the uploaded image.', 'error');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Parse EMVCo / Bank QR Standard (TLV format: Tag - Length - Value)
   * Tag 54 = Transaction Amount
   * Tag 53 = Transaction Currency (840 = USD, 116 = KHR)
   */
  function parseBankQR(qrString) {
    const parsedData = parseEMVCo(qrString);

    // Check Tag 54 for Amount
    if (parsedData['54']) {
      const amount = parsedData['54'];
      amountInput.value = parseFloat(amount).toFixed(2);

      // Check Tag 53 for Currency
      if (parsedData['53'] === '116') {
        currencySymbol.textContent = '៛'; // KHR
      } else {
        currencySymbol.textContent = '$'; // USD (Default / 840)
      }

      showStatus('Amount successfully detected!', 'success');
    } else {
      amountInput.value = '';
      showStatus('QR Code detected, but no amount tag (Tag 54) was found (Dynamic amount not set).', 'warning');
    }
  }

  /**
   * Decodes TLV (Tag-Length-Value) strings used in EMVCo standard bank QRs
   */
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

  function hideStatus() {
    statusMsg.className = 'status-msg hidden';
  }
});
