document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PRELOADER ---
    const loader = document.querySelector('.loader');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.body.classList.remove('loading');
            if(loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 800);
            }
            
            // Start popup timer after load
            initAutoPopup();
        }, 800);
    });

    // --- 2. HEADER SCROLL ---
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- 3. MOBILE MENU ---
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const links = document.querySelectorAll('.m-link');

    if(burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
    }

    links.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // --- 4. MODAL FORMS ---
    const callbackModal = document.getElementById('callbackModal');
    const policyModal = document.getElementById('policyModal');
    
    function openModal(modal) {
        if(modal) {
            modal.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    }

    function closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
        document.querySelectorAll('.lightbox-overlay').forEach(modal => modal.classList.remove('active'));
        document.body.classList.remove('no-scroll');
    }

    // Auto Popup Logic
    function initAutoPopup() {
        // Check if already shown in this session
        if (!sessionStorage.getItem('popupShown')) {
            setTimeout(() => {
                // Don't open if another modal is already open
                if (!document.querySelector('.modal-overlay.active')) {
                    openModal(callbackModal);
                    sessionStorage.setItem('popupShown', 'true');
                }
            }, 15000); // 15 seconds
        }
    }
    
    // Open Callback
    const openCallbackBtns = document.querySelectorAll('.open-modal');
    openCallbackBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(callbackModal);
        });
    });

    // Open Policy
    const openPolicyBtns = document.querySelectorAll('.open-policy');
    openPolicyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(policyModal);
        });
    });

    // Close Modals
    const closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Click Outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                closeModal();
            }
        });
    });

    // --- 5. LIGHTBOX ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    const lightboxClose = document.querySelector('.lightbox-close');

    if(lightbox) {
        lightboxTriggers.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const imgSrc = item.querySelector('img').src;
                lightboxImg.src = imgSrc;
                lightbox.classList.add('active');
                document.body.classList.add('no-scroll');
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });

        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

    // --- 6. REVEAL ANIMATIONS ---
    const revealItems = document.querySelectorAll('.reveal-up, .reveal-img');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealItems.forEach(el => observer.observe(el));

    // --- 7. FORM HANDLING ---
    const forms = document.querySelectorAll("form.lead-form");
    forms.forEach((form) => {
        if (!form.querySelector('input[name="hp"], input[name="website"], input[name="company"], input[name="hidden"]')) {
            const hpInput = document.createElement("input");
            hpInput.type = "text";
            hpInput.name = "hp";
            hpInput.tabIndex = -1;
            hpInput.autocomplete = "off";
            hpInput.setAttribute("aria-hidden", "true");
            hpInput.style.display = "none";
            form.appendChild(hpInput);
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = form.querySelector("button[type=\"submit\"], button");
            if (!btn) {
                return;
            }

            const originalText = btn.textContent || "";
            const source = form.dataset.source || "lead";
            const name = (form.querySelector("input[name=\"name\"]")?.value || "").trim();
            const phone = (form.querySelector("input[name=\"phone\"]")?.value || "").trim();
            const hp = (form.querySelector("input[name=\"hp\"], input[name=\"website\"], input[name=\"company\"], input[name=\"hidden\"]")?.value || "").trim();

            if (!phone) {
                return;
            }

            btn.disabled = true;
            btn.textContent = "Отправка...";

            try {
                if (typeof window.sendLead !== "function") {
                    throw new Error("sendLead is not available");
                }

                await window.sendLead({
                    name,
                    phone,
                    source,
                    message: `Форма: ${source}`,
                    hp,
                });

                btn.textContent = "Отправлено!";
                btn.style.backgroundColor = "#4CAF50";
                btn.style.color = "#fff";
                btn.style.borderColor = "#4CAF50";

                sessionStorage.setItem("popupShown", "true");

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = "";
                    btn.style.color = "";
                    btn.style.borderColor = "";
                    btn.disabled = false;
                    form.reset();
                    closeModal();
                }, 2000);
            } catch (error) {
                console.error("Lead submit failed:", error);
                btn.textContent = "Ошибка отправки";
                btn.style.backgroundColor = "#dc2626";
                btn.style.color = "#fff";
                btn.style.borderColor = "#dc2626";

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = "";
                    btn.style.color = "";
                    btn.style.borderColor = "";
                    btn.disabled = false;
                }, 2000);
            }
        });
    });

});
