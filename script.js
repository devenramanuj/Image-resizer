// DOM Elements
const uploadBox = document.querySelector(".upload-box");
const uploadInput = document.getElementById("upload");
const previewArea = document.querySelector(".preview-area");
const previewImage = document.getElementById("previewImage");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const aspectRatio = document.getElementById("aspectRatio");
const formatSelect = document.getElementById("format");
const qualitySlider = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const qualityRow = document.querySelector(".quality-row");
const downloadBtn = document.getElementById("download");

let originalImageRatio;
let originalFileName = "resized-image";
let originalFileType = "image/jpeg";
let imageLoaded = false;

// Trigger file input click
uploadBox.addEventListener("click", () => uploadInput.click());

// Handle file selection
uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    loadAndPreviewImage(file);
});

// Handle drag and drop
uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.background = "#f0f8ff";
});
uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.background = "transparent";
});
uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.background = "transparent";
    const file = e.dataTransfer.files[0];
    if (file) {
        uploadInput.files = e.dataTransfer.files;
        loadAndPreviewImage(file);
    }
});

function loadAndPreviewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.onload = () => {
            // Store original details
            originalFileName = file.name.split('.').slice(0, -1).join('.');
            originalFileType = file.type;
            
            // Set format dropdown to match original
            if (['image/jpeg', 'image/png', 'image/webp'].includes(originalFileType)) {
                formatSelect.value = originalFileType;
            } else {
                formatSelect.value = 'image/jpeg'; // Default to JPEG if format is unsupported
            }
            toggleQualitySlider();

            // Set initial dimensions
            widthInput.value = previewImage.naturalWidth;
            heightInput.value = previewImage.naturalHeight;
            originalImageRatio = previewImage.naturalWidth / previewImage.naturalHeight;
            
            // Show preview, hide upload box
            uploadBox.hidden = true;
            previewArea.hidden = false;
            downloadBtn.disabled = false;
            imageLoaded = true;
        };
    };
    reader.readAsDataURL(file);
}

// Update height when width changes
widthInput.addEventListener("input", () => {
    if (aspectRatio.checked && imageLoaded) {
        heightInput.value = Math.round(widthInput.value / originalImageRatio);
    }
});

// Update width when height changes
heightInput.addEventListener("input", () => {
    if (aspectRatio.checked && imageLoaded) {
        widthInput.value = Math.round(heightInput.value * originalImageRatio);
    }
});

// Show/Hide quality slider based on format
formatSelect.addEventListener("change", toggleQualitySlider);

function toggleQualitySlider() {
    const selectedFormat = formatSelect.value;
    if (selectedFormat === "image/jpeg" || selectedFormat === "image/webp") {
        qualityRow.style.display = "flex";
    } else {
        qualityRow.style.display = "none";
    }
}

// Update quality value display
qualitySlider.addEventListener("input", () => {
    qualityValue.textContent = parseFloat(qualitySlider.value).toFixed(1);
});

// Handle download button click
downloadBtn.addEventListener("click", () => {
    if (!imageLoaded) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const newWidth = parseInt(widthInput.value) || previewImage.naturalWidth;
    const newHeight = parseInt(heightInput.value) || previewImage.naturalHeight;
    const format = formatSelect.value;
    const quality = parseFloat(qualitySlider.value);
    
    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw image onto canvas
    ctx.drawImage(previewImage, 0, 0, newWidth, newHeight);

    // Get image data URL
    const dataUrl = canvas.toDataURL(format, (format !== "image/png") ? quality : undefined);

    // Create download link
    const link = document.createElement("a");
    const fileExtension = format.split('/')[1];
    link.href = dataUrl;
    link.download = `${originalFileName}-resized.${fileExtension}`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- નવો સુધારો અહીં છે (PRESET BUTTONS) ---
const presetButtons = document.querySelectorAll(".preset-btn");

presetButtons.forEach(button => {
    button.addEventListener("click", () => {
        // જો ઈમેજ લોડ ન થઈ હોય તો કંઈ ન કરો
        if (!imageLoaded) return; 

        // બટનમાંથી ડેટા-વિડ્થ અને ડેટા-હાઇટ મેળવો
        const width = button.dataset.width;
        const height = button.dataset.height;

        // તે વેલ્યુને ઇનપુટ બોક્સમાં સેટ કરો
        widthInput.value = width;
        heightInput.value = height;

        // 'Lock aspect ratio' ને અનચેક કરો જેથી બંને વેલ્યુ બરાબર સેટ થાય
        aspectRatio.checked = false;
    });
});
