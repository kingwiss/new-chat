// Global function to close the welcome popup
function closeWelcomePopup() {
    console.log('Closing welcome popup');
    const welcomeModal = document.getElementById('welcomeModal');
    if (welcomeModal) {
        welcomeModal.style.display = 'none';
        localStorage.setItem('welcomeShown', 'true');
    }
}

// Make sure the function is available globally
window.closeWelcomePopup = closeWelcomePopup;