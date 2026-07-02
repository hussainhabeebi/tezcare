// TezCare — shared front-end behaviour (mobile nav, smart-match modal,
// chat carousel, exit-intent toast). Every init guards on element presence
// so the same file can be included on every page.

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmartMatchModal();
    initChatCarousel();
    initExitIntentToast();
});

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
            btnToggleEmergency.classList.add('bg-teal-brand', 'text-white');
            btnToggleEmergency.classList.remove('text-slate-400');
            btnToggleNormal.classList.remove('bg-teal-brand', 'text-white');
            btnToggleNormal.classList.add('text-slate-400');
        });
        btnToggleNormal.addEventListener('click', () => {
            matchType.value = 'Normal';
            btnToggleNormal.classList.add('bg-teal-brand', 'text-white');
            btnToggleNormal.classList.remove('text-slate-400');
            btnToggleEmergency.classList.remove('bg-teal-brand', 'text-white');
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
                <div class="w-12 h-12 rounded-full bg-teal-brand/20 border border-teal-brand/40 flex items-center justify-center text-teal-brand font-bold flex-shrink-0">
                    ${s.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div class="flex-1">
                    <p class="text-white font-bold text-sm">${s.name}</p>
                    <p class="text-slate-400 text-xs">${s.role} &middot; ${s.exp}</p>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wide text-teal-brand bg-teal-brand/10 border border-teal-brand/30 px-2.5 py-1 rounded-full whitespace-nowrap">${s.badge}</span>
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
/* Chat card carousel ("Real Response Time" section)                 */
/* ---------------------------------------------------------------- */
function initChatCarousel() {
    const convoArea = document.getElementById('chat-convo-area');
    const dotsWrap = document.getElementById('chat-dots');
    const prevBtn = document.getElementById('chat-prev-btn');
    const nextBtn = document.getElementById('chat-next-btn');
    const headline = document.getElementById('chat-headline');
    const subtext = document.getElementById('chat-subtext');
    if (!convoArea) return;

    const scenarios = [
        {
            headline: 'When Every Minute Counts, We Answer.',
            subtext: "Care home managers across the UK trust TezCare because when a shift falls through at 10pm, we don't send an email — we send staff.",
            messages: [
                { from: 'in', text: "Hi, we've just had a night HCA call in sick for tonight's 8pm shift. Can you help?" },
                { from: 'out', text: "On it. Checking DBS-cleared staff within your postcode now." },
                { from: 'out', text: "Found 3 available HCAs. Sending profiles to your WhatsApp." },
                { from: 'in', text: 'That was fast — thank you!' }
            ]
        },
        {
            headline: 'Block Bookings, Handled in One Message.',
            subtext: 'Need recurring cover for the month? One conversation sets up a rolling roster your coordinator manages end to end.',
            messages: [
                { from: 'in', text: 'We need weekend RGN cover for the next 6 weeks.' },
                { from: 'out', text: 'Understood. Setting up a recurring booking for Sat/Sun days.' },
                { from: 'out', text: 'Compliance packs will land in your inbox before each shift.' },
                { from: 'in', text: 'Perfect, exactly what we needed.' }
            ]
        },
        {
            headline: 'Real Humans. Real Compliance. Every Time.',
            subtext: "No chatbots, no call queues — just a coordinator who knows your facility and answers with a fully vetted match.",
            messages: [
                { from: 'in', text: 'Can you confirm the DBS status for tomorrow’s cover?' },
                { from: 'out', text: 'Confirmed — Enhanced DBS, training certs and references all verified.' },
                { from: 'out', text: 'Digital compliance pack attached.' },
                { from: 'in', text: 'Great, that saves us a call to head office.' }
            ]
        }
    ];

    let current = 0;
    let typingTimeout;

    function renderDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = scenarios.map((_, i) =>
            `<span class="chat-dot ${i === current ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');
        dotsWrap.querySelectorAll('.chat-dot').forEach((dot) => {
            dot.addEventListener('click', () => {
                current = parseInt(dot.dataset.index, 10);
                render();
            });
        });
    }

    function render() {
        clearTimeout(typingTimeout);
        const scenario = scenarios[current];
        if (headline) {
            headline.classList.remove('chat-narrative-text');
            void headline.offsetWidth;
            headline.textContent = scenario.headline;
            headline.classList.add('chat-narrative-text');
        }
        if (subtext) {
            subtext.classList.remove('chat-narrative-text');
            void subtext.offsetWidth;
            subtext.textContent = scenario.subtext;
            subtext.classList.add('chat-narrative-text');
        }
        convoArea.innerHTML = '';
        scenario.messages.forEach((msg, i) => {
            typingTimeout = setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${msg.from === 'in' ? 'incoming' : 'outgoing'}`;
                bubble.textContent = msg.text;
                bubble.style.opacity = '0';
                convoArea.appendChild(bubble);
                requestAnimationFrame(() => {
                    bubble.style.transition = 'opacity 0.3s ease';
                    bubble.style.opacity = '1';
                });
            }, i * 350);
        });
        renderDots();
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            current = (current - 1 + scenarios.length) % scenarios.length;
            render();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            current = (current + 1) % scenarios.length;
            render();
        });
    }

    render();
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
