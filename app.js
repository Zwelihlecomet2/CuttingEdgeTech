document.addEventListener('DOMContentLoaded', () => {
    const modelViewer = document.getElementById('modelViewer');
    const modelContainer = document.getElementById('model-container');
    const tapInstruction = document.getElementById('tap-instruction');
    const infoBtn = document.getElementById('info');
    const infoModal = document.getElementById('info-modal');
    const closeBtn = document.getElementById('close-btn');
    const scaleInput = document.getElementById('model-scale');

    let hasLoadedModel = false;

    // --- LAZY LOAD MODEL ON FIRST TAP ---
    function loadModelOnTap() {
        if (hasLoadedModel) return;

        hasLoadedModel = true;

        // Hide tap instruction
        tapInstruction.style.opacity = '0';
        setTimeout(() => {
            tapInstruction.style.display = 'none';
        }, 500);

        // Load the 3D model now
        modelViewer.src = 'office_chair.glb';

        console.log('✅ 3D model loaded on first tap!');
    }

    // Attach tap/click listeners to container (not just model viewer)
    modelContainer.addEventListener('click', loadModelOnTap, { once: true });
    modelContainer.addEventListener('touchstart', loadModelOnTap, { once: true });

    // --- SCALE CONTROL ---
    scaleInput.addEventListener('input', () => {
        const scaleValue = parseFloat(scaleInput.value);
        modelViewer.scale = scaleValue;
    });

    // --- INFO MODAL ---
    infoBtn.addEventListener('click', () => {
        infoModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });

    // --- BUTTONS ---
    document.getElementById('visit-site-btn').addEventListener('click', () => {
        alert('Visit Site clicked! (Link would open here)');
    });

    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        alert('Added to Cart! (Cart logic would go here)');
    });

    // --- OPTIONAL: AUTO-ROTATE AFTER LOAD ---
    modelViewer.addEventListener('load', () => {
        // You could enable auto-rotate here if desired:
        // modelViewer.autoRotate = true;
        // modelViewer.autoRotateSpeed = 0.5;
    });
});