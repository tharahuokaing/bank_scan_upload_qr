# bank_upload_qr
# Bank QR Code Payment & Amount Detector 🇰🇭

A lightweight, modern web application that scans or accepts uploads of standard bank payment QR codes (such as **Bakong, ABA KHQR, and general EMVCo QR standards**), automatically decodes the payload, extracts payment information, and pre-fills the amount field.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6%2B-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)

---

## 🌟 Key Features

- **Dual Input Modes:** 
  - **Live Camera Scanner:** Scans physical QR codes in real-time using device webcams (desktop & mobile).
  - **File Upload & Drag-and-Drop:** Accepts uploaded image files (PNG, JPG, WebP) directly.
- **EMVCo / KHQR Parsing:** Automatically extracts key financial tags:
  - **Tag 54:** Transaction Amount (Auto-fills input)
  - **Tag 53:** Currency Code (Detects `840` for **USD $** or `116` for **KHR ៛**)
  - **Tag 59:** Merchant / Payee Name
- **Client-Side Processing:** Built completely in vanilla HTML, CSS, and JavaScript. No backend server or external API required for scanning.
- **Responsive Design:** Mobile-first layout with smooth tab transitions and feedback alerts.

---

## 📂 Project Structure

```text
├── index.html   # Application layout and markup
├── style.css    # Responsive UI design and styling
├── script.js    # Camera handling, file parsing, and EMVCo decoding logic
└── README.md    # Documentation
