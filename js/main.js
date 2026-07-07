// TezCare — shared front-end behaviour (mobile nav, smart-match modal,
// chat carousel, exit-intent toast). Every init guards on element presence
// so the same file can be included on every page.

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmartMatchModal();
    initExitIntentToast();
    initCursorGlow();
    initScrollRotateTitles();
});

/* ---------------------------------------------------------------- */
/* Cursor-follow ambient background glow (fine-pointer devices only) */
/* ---------------------------------------------------------------- */
function initCursorGlow() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (prefersReducedMotion || !hasFinePointer) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    (function animate() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        glow.style.transform = `translate(${currentX - 300}px, ${currentY - 300}px)`;
        requestAnimationFrame(animate);
    })();
}

/* ---------------------------------------------------------------- */
/* Hero/main title 3D scroll-rotate                                  */
/* ---------------------------------------------------------------- */
function initScrollRotateTitles() {
    const titles = document.querySelectorAll('.scroll-rotate-title');
    if (!titles.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function update() {
        const viewportOffset = window.innerHeight * 0.15;
        titles.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const progress = Math.min(
                Math.max((viewportOffset - rect.top) / (rect.height + viewportOffset), 0),
                1
            );
            el.style.transform = `perspective(1200px) rotateX(${progress * 35}deg) translateY(${progress * -30}px)`;
            el.style.opacity = String(1 - progress * 0.9);
        });
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
}

/* ---------------------------------------------------------------- */
/* Mobile nav toggle                                                 */
/* ---------------------------------------------------------------- */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
}

/* ---------------------------------------------------------------- */
/* Smart-Match modal (multi-state)                                   */
/* ---------------------------------------------------------------- */
function initSmartMatchModal() {
    const modal = document.getElementById('smart-match-modal');
    if (!modal) return;

    const openTriggers = document.querySelectorAll('#btn-request-staff');
    const closeBtn = document.getElementById('btn-close-modal');
    const closeToastBtn = document.getElementById('btn-close-toast');

    const state1 = document.getElementById('smart-state-1');
    const state2 = document.getElementById('smart-state-2');
    const state3 = document.getElementById('smart-state-3');
    const state4 = document.getElementById('smart-state-4');

    const scanningText = document.getElementById('scanning-text');
    const staffResultsContainer = document.getElementById('staff-results-container');
    const formError = document.getElementById('form-error');
    const postcodeError = document.getElementById('postcode-error');

    const btnToggleEmergency = document.getElementById('btn-toggle-emergency');
    const btnToggleNormal = document.getElementById('btn-toggle-normal');
    const matchType = document.getElementById('match-type');

    const btnTriggerScan = document.getElementById('btn-trigger-scan');
    const btnDispatch = document.getElementById('btn-dispatch-whatsapp');
    const postcodeInput = document.getElementById('match-postcode');

    const scanningMessages = [
        'Accessing Roster...',
        'Verifying DBS Clearance...',
        'Checking Local Availability...',
        'Matching Compliance Profiles...',
        'Finalising Results...'
    ];

    const staffPool = [
        { name: 'Emma Richards', role: 'Senior Healthcare Assistant', exp: '5 yrs exp.', badge: 'DBS Cleared' },
        { name: 'James Okafor', role: 'Registered General Nurse', exp: '7 yrs exp.', badge: 'DBS Cleared' },
        { name: 'Priya Nair', role: 'Support Worker', exp: '3 yrs exp.', badge: 'DBS Cleared' }
    ];

    function showState(el) {
        [state1, state2, state3, state4].forEach((s) => {
            if (!s) return;
            s.classList.toggle('hidden', s !== el);
        });
    }

    function openModal() {
        showState(state1);
        modal.showModal();
        requestAnimationFrame(() => modal.classList.add('modal-open'));
    }

    function closeModal() {
        modal.classList.remove('modal-open');
        setTimeout(() => {
            modal.close();
            showState(state1);
        }, 250);
    }

    openTriggers.forEach((btn) => btn.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeModal();
    });

    if (btnToggleEmergency && btnToggleNormal && matchType) {
        btnToggleEmergency.addEventListener('click', () => {
            matchType.value = 'Emergency';
            btnToggleEmergency.classList.add('bg-brand-red', 'text-white');
            btnToggleEmergency.classList.remove('text-slate-400');
            btnToggleNormal.classList.remove('bg-brand-red', 'text-white');
            btnToggleNormal.classList.add('text-slate-400');
        });
        btnToggleNormal.addEventListener('click', () => {
            matchType.value = 'Normal';
            btnToggleNormal.classList.add('bg-brand-red', 'text-white');
            btnToggleNormal.classList.remove('text-slate-400');
            btnToggleEmergency.classList.remove('bg-brand-red', 'text-white');
            btnToggleEmergency.classList.add('text-slate-400');
        });
    }

    if (btnTriggerScan) {
        btnTriggerScan.addEventListener('click', () => {
            const requiredIds = ['match-home-name', 'match-manager-name', 'match-email', 'match-phone'];
            const tosCheckbox = document.getElementById('match-tos');
            const allFilled = requiredIds.every((id) => {
                const field = document.getElementById(id);
                return field && field.value.trim() !== '';
            });
            const tosChecked = tosCheckbox && tosCheckbox.checked;

            const postcodePattern = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/;
            const postcodeValue = postcodeInput ? postcodeInput.value.trim() : '';
            const postcodeValid = postcodeValue === '' || postcodePattern.test(postcodeValue);

            if (postcodeError) postcodeError.classList.toggle('hidden', postcodeValid);

            if (!allFilled || !tosChecked || !postcodeValid) {
                if (formError) formError.classList.remove('hidden');
                return;
            }
            if (formError) formError.classList.add('hidden');

            showState(state2);
            let step = 0;
            if (scanningText) scanningText.textContent = scanningMessages[0];
            const interval = setInterval(() => {
                step += 1;
                if (scanningText && scanningMessages[step]) {
                    scanningText.textContent = scanningMessages[step];
                }
            }, 900);

            setTimeout(() => {
                clearInterval(interval);
                renderStaffResults();
                showState(state3);
            }, 4500);
        });
    }

    function renderStaffResults() {
        if (!staffResultsContainer) return;
        staffResultsContainer.innerHTML = staffPool.map((s) => `
            <div class="staff-result-card">
                <div class="w-12 h-12 rounded-full bg-brand-red/20 border border-brand-red/40 flex items-center justify-center text-brand-red font-bold flex-shrink-0">
                    ${s.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div class="flex-1">
                    <p class="text-white font-bold text-sm">${s.name}</p>
                    <p class="text-slate-400 text-xs">${s.role} &middot; ${s.exp}</p>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wide text-brand-red bg-brand-red/10 border border-brand-red/30 px-2.5 py-1 rounded-full whitespace-nowrap">${s.badge}</span>
            </div>
        `).join('');
    }

    if (btnDispatch) {
        btnDispatch.addEventListener('click', () => {
            showState(state4);
        });
    }
}

/* ---------------------------------------------------------------- */
/* Exit intent toast                                                 */
/* ---------------------------------------------------------------- */
function initExitIntentToast() {
    const toast = document.getElementById('exit-intent-toast');
    if (!toast) return;

    const closeBtn = document.getElementById('btn-close-toast');
    let shown = false;

    document.addEventListener('mouseleave', (e) => {
        if (shown || e.clientY > 0) return;
        shown = true;
        toast.classList.add('toast-visible');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('toast-visible');
        });
    }
}
