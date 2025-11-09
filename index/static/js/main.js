// Global variables
let tokenId = "";
let endurl = "";

// Parse URL parameters
const urlParams = {};
const queryString = window.location.search;
const urlSearchParams = new URLSearchParams(queryString);
for (const [key, value] of urlSearchParams.entries()) {
    urlParams[key] = value;
}

// Helper function to access URL parameters
function getUrlParam(name) {
    return urlParams[name] || "";
}

// Custom conversion tracking function
function trackConversion(eventName) {
    if (typeof gtag === 'function') {
        gtag('event', eventName);
    }
}

// Function to remove loading overlay
function removeLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Function to fetch token ID
async function fetchTokenId() {
    try {
        const response = await fetch(`/api/tokenId?${new URLSearchParams(urlParams).toString()}`);
        const data = await response.json();

        if (response.status === 200 && data.code === 200) {
            tokenId = data.clickId;
            removeLoadingOverlay();
        }
    } catch (error) {
        console.error("Error fetching token ID:", error);
        setTimeout(removeLoadingOverlay, 2000);
    }
}

// Function to handle WhatsApp button click
async function handleWhatsAppClick() {
    try {
        const response = await fetch(`/api/endurl?tokenId=${tokenId}`);
        const data = await response.json();

        if (response.status === 200 && data.code === 200) {
            endurl = data.data.redirectUrl;
            trackConversion('Bdd');

            if (typeof gtag_report_conversion === 'function') {
                gtag_report_conversion(`/contact/open.html?endurl=${endurl}`);
            } else {
                window.location.href = `/contact/open.html?endurl=${endurl}`;
            }
        }
    } catch (error) {
        console.error("Error handling WhatsApp click:", error);
    }
}

// Function to simulate progress
function simulateProgress() {
    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4')
    ];

    progressModal.classList.remove('hidden');

    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;

        if (progress >= 20) {
            steps[0].classList.add('active');
        }
        if (progress >= 45) {
            steps[1].classList.add('active');
        }
        if (progress >= 70) {
            steps[2].classList.add('active');
        }
        if (progress >= 90) {
            steps[3].classList.add('active');
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressModal.classList.add('hidden');
                document.getElementById('whatsappModal').classList.remove('hidden');
            }, 500);
        }
    }, 30);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchTokenId();

    document.getElementById('analyzeBtn').addEventListener('click', () => {
        simulateProgress();
    });

    document.getElementById('whatsappBtn').addEventListener('click', handleWhatsAppClick);
});
