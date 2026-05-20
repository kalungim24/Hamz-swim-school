window.onload = function() {
    console.log("Checking jQuery status:", typeof $);
    console.log("Checking Ripples status:", typeof $.fn.ripples);

    try {
        if (typeof $.fn.ripples === 'function') {
            $('body').ripples({
                resolution: 1024,
                dropRadius: 24,
                perturbance: 0.5,
                interactive: true
            });
            console.log("🚀 Success! Move your mouse across the image to see ripples.");
        } else {
            console.error("❌ The ripples script did not attach to jQuery.");
        }
    } catch (e) {
        console.error("❌ Initialization error:", e);
    }
};
