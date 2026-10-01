document.addEventListener("DOMContentLoaded", () => {
    // ==============================
    // PRESENTATION SETUP
    // ==============================

    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const slideCounter = document.getElementById("slideCounter");
    const progressBar = document.getElementById("progressBar");

    let currentSlide = 0;

    // ==============================
    // SHOW SLIDE
    // ==============================

    function showSlide(index) {
        if (index < 0) {
            index = 0;
        }

        if (index >= slides.length) {
            index = slides.length - 1;
        }

        // Remove active class from all slides
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });

        // Set current slide
        currentSlide = index;

        const activeSlide = slides[currentSlide];
        activeSlide.classList.add("active");

        // Update navigation
        updateNavigation();

        // Restart slide animations
        restartAnimations(activeSlide);

        // Hide all tooltips when changing slide
        hideTooltips();
    }

    // ==============================
    // UPDATE NAVIGATION
    // ==============================

    function updateNavigation() {
        const totalSlides = slides.length;

        // Slide counter
        if (slideCounter) {
            slideCounter.textContent =
                `${currentSlide + 1} / ${totalSlides}`;
        }

        // Progress bar
        if (progressBar) {
            const progress =
                ((currentSlide + 1) / totalSlides) * 100;

            progressBar.style.width = `${progress}%`;
        }

        // Disable buttons at beginning/end
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = currentSlide === totalSlides - 1;
        }
    }

    // ==============================
    // NEXT BUTTON
    // ==============================

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            showSlide(currentSlide + 1);
        });
    }

    // ==============================
    // PREVIOUS BUTTON
    // ==============================

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            showSlide(currentSlide - 1);
        });
    }

    // ==============================
    // KEYBOARD CONTROLS
    // ==============================

    document.addEventListener("keydown", (event) => {
        // Don't control slides while typing in an input
        const target = event.target;

        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT"
        ) {
            return;
        }

        switch (event.key) {
            case "ArrowRight":
            case "PageDown":
            case " ":
                event.preventDefault();
                showSlide(currentSlide + 1);
                break;

            case "ArrowLeft":
            case "PageUp":
                event.preventDefault();
                showSlide(currentSlide - 1);
                break;

            case "Home":
                event.preventDefault();
                showSlide(0);
                break;

            case "End":
                event.preventDefault();
                showSlide(slides.length - 1);
                break;
        }
    });

    // ==============================
    // RESTART ANIMATIONS
    // ==============================

    function restartAnimations(slide) {
        const animatedElements =
            slide.querySelectorAll(".animate-in");

        animatedElements.forEach((element) => {
            element.style.animation = "none";
        });

        // Force browser reflow
        void slide.offsetWidth;

        requestAnimationFrame(() => {
            animatedElements.forEach((element) => {
                element.style.animation = "";
            });
        });
    }

    // ==============================
    // SVG NODE POSITION
    // ==============================

    function getNodePosition(node) {
        const transform =
            node.getAttribute("transform") || "";

        const match = transform.match(
            /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/
        );

        if (match) {
            return {
                x: parseFloat(match[1]),
                y: parseFloat(match[2])
            };
        }

        return {
            x: 0,
            y: 0
        };
    }

    // ==============================
    // BUS TOPOLOGY
    // ==============================

    const busSvg = document.getElementById("busSvg");
    const busTooltip = document.getElementById("busTooltip");
    const busTooltipText =
        document.getElementById("busTooltipText");

    const busNodes =
        document.querySelectorAll(".bus-node");

    function showBusTooltip(node) {
        if (!busTooltip || !busTooltipText) {
            return;
        }

        const label =
            node.getAttribute("data-label") ||
            "Network Device";

        const position = getNodePosition(node);

        busTooltipText.textContent = label;

        // Position tooltip above node
        const tooltipX = position.x - 50;
        const tooltipY = position.y - 45;

        busTooltip.setAttribute(
            "transform",
            `translate(${tooltipX}, ${tooltipY})`
        );

        busTooltip.style.display = "block";

        // Highlight node
        const rect = node.querySelector("rect");

        if (rect) {
            rect.dataset.originalStroke =
                rect.getAttribute("stroke") || "";

            rect.dataset.originalStrokeWidth =
                rect.getAttribute("stroke-width") || "";

            rect.setAttribute("stroke", "#ffffff");
            rect.setAttribute("stroke-width", "3");
        }
    }

    function hideBusTooltip() {
        if (busTooltip) {
            busTooltip.style.display = "none";
        }

        busNodes.forEach((node) => {
            const rect = node.querySelector("rect");

            if (rect) {
                rect.setAttribute(
                    "stroke",
                    rect.dataset.originalStroke || ""
                );

                rect.setAttribute(
                    "stroke-width",
                    rect.dataset.originalStrokeWidth || ""
                );
            }
        });
    }

    busNodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
            showBusTooltip(node);
        });

        node.addEventListener("mouseleave", () => {
            hideBusTooltip();
        });

        // Mobile/touch support
        node.addEventListener("click", (event) => {
            event.stopPropagation();
            showBusTooltip(node);
        });
    });

    if (busSvg) {
        busSvg.addEventListener("click", () => {
            hideBusTooltip();
        });
    }

    // ==============================
    // STAR TOPOLOGY
    // ==============================

    const starSvg = document.getElementById("starSvg");
    const starTooltip =
        document.getElementById("starTooltip");

    const starTooltipText =
        document.getElementById("starTooltipText");

    const starNodes =
        document.querySelectorAll(".star-node");

    const starLines =
        document.querySelectorAll(".star-line");

    function showStarTooltip(node) {
        if (!starTooltip || !starTooltipText) {
            return;
        }

        const label =
            node.getAttribute("data-label") ||
            "Network Device";

        const position = getNodePosition(node);

        starTooltipText.textContent = label;

        const tooltipX = position.x - 50;
        const tooltipY = position.y - 45;

        starTooltip.setAttribute(
            "transform",
            `translate(${tooltipX}, ${tooltipY})`
        );

        starTooltip.style.display = "block";

        // Highlight related connection
        const lineNumber =
            node.getAttribute("data-line");

        if (lineNumber) {
            const line =
                document.getElementById(`sline-${lineNumber}`);

            if (line) {
                line.dataset.originalStroke =
                    line.getAttribute("stroke") || "";

                line.dataset.originalStrokeWidth =
                    line.getAttribute("stroke-width") || "";

                line.setAttribute(
                    "stroke",
                    "#6ee7b7"
                );

                line.setAttribute(
                    "stroke-width",
                    "4"
                );
            }
        }
    }

    function hideStarTooltip() {
        if (starTooltip) {
            starTooltip.style.display = "none";
        }

        starLines.forEach((line) => {
            line.setAttribute(
                "stroke",
                line.dataset.originalStroke || "#10b981"
            );

            line.setAttribute(
                "stroke-width",
                line.dataset.originalStrokeWidth || "2"
            );
        });
    }

    starNodes.forEach((node) => {
        node.addEventListener("mouseenter", () => {
            showStarTooltip(node);
        });

        node.addEventListener("mouseleave", () => {
            hideStarTooltip();
        });

        // Mobile/touch support
        node.addEventListener("click", (event) => {
            event.stopPropagation();
            showStarTooltip(node);
        });
    });

    if (starSvg) {
        starSvg.addEventListener("click", () => {
            hideStarTooltip();
        });
    }

    // ==============================
    // HIDE ALL TOOLTIPS
    // ==============================

    function hideTooltips() {
        hideBusTooltip();
        hideStarTooltip();
    }

    // ==============================
    // TOUCH SWIPE SUPPORT
    // ==============================

    let touchStartX = 0;
    let touchEndX = 0;

    const presentation =
        document.getElementById("presentation");

    if (presentation) {
        presentation.addEventListener(
            "touchstart",
            (event) => {
                touchStartX =
                    event.changedTouches[0].screenX;
            },
            { passive: true }
        );

        presentation.addEventListener(
            "touchend",
            (event) => {
                touchEndX =
                    event.changedTouches[0].screenX;

                handleSwipe();
            },
            { passive: true }
        );
    }

    function handleSwipe() {
        const swipeDistance =
            touchEndX - touchStartX;

        // Swipe left = next slide
        if (swipeDistance < -50) {
            showSlide(currentSlide + 1);
        }

        // Swipe right = previous slide
        if (swipeDistance > 50) {
            showSlide(currentSlide - 1);
        }
    }

    // ==============================
    // INITIALIZE PRESENTATION
    // ==============================

    showSlide(0);
});