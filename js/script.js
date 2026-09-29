/* ============================================ */
/* CONFIGURAÇÕES GERAIS                         */
/* [TROCAR] Ajuste estas variáveis              */
/* ============================================ */

// [TROCAR] Número do WhatsApp (com código do país, sem + ou espaços)
// Exemplo: 5547999999999 (55 = Brasil, 47 = DDD, resto = número)
const WHATSAPP_NUMBER = '[SEU_NUMERO_AQUI]';

// [TROCAR] Preços das diárias
const PRECO_SEMANA = 450;        // Segunda a Quinta
const PRECO_FIM_DE_SEMANA = 650; // Sexta a Domingo

/* ============================================ */
/* VARIÁVEIS DO CALENDÁRIO                      */
/* ============================================ */
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const today = new Date();
let displayMonth = today.getMonth();
let displayYear = today.getFullYear();
const reservedDates = new Set();

/* ============================================ */
/* DATAS RESERVADAS DE EXEMPLO                  */
/* [TROCAR/REMOVER] Para produção, use banco    */
/* ============================================ */
function generateReservedDates() {
    const year = today.getFullYear();
    const month = today.getMonth();

    // [TROCAR] Adicione aqui as datas realmente reservadas
    // Formato: 'YYYY-MM-DD'
    const reserved = [
        `${year}-${String(month + 1).padStart(2, '0')}-05`,
        `${year}-${String(month + 1).padStart(2, '0')}-06`,
        `${year}-${String(month + 1).padStart(2, '0')}-12`,
        `${year}-${String(month + 1).padStart(2, '0')}-13`,
    ];

    reserved.forEach(d => reservedDates.add(d));
}

/* ============================================ */
/* PREÇO POR DIA DA SEMANA                      */
/* ============================================ */
function getWeekdayPrice(dayOfWeek) {
    // 0 = Domingo, 6 = Sábado
    if (dayOfWeek === 0 || dayOfWeek === 6) return PRECO_FIM_DE_SEMANA;
    return PRECO_SEMANA;
}

/* ============================================ */
/* RENDERIZAR CALENDÁRIO                        */
/* ============================================ */
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYearEl = document.getElementById('monthYear');

    monthYearEl.textContent = `${monthNames[displayMonth]} ${displayYear}`;
    grid.innerHTML = '';

    dayNames.forEach(day => {
        const el = document.createElement('div');
        el.className = 'calendar-day-name';
        el.textContent = day;
        grid.appendChild(el);
    });

    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        grid.appendChild(el);
    }

    let availableCount = 0;
    let reservedCount = 0;
    let nextAvail = null;

    for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement('div');
        const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(displayYear, displayMonth, day).getDay();
        const isToday = (day === today.getDate() && displayMonth === today.getMonth() && displayYear === today.getFullYear());
        const isPast = new Date(displayYear, displayMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isReserved = reservedDates.has(dateStr);

        el.className = 'calendar-day';
        el.textContent = day;

        if (isToday) el.classList.add('today');

        if (isPast) {
            el.classList.add('reserved');
            el.style.opacity = '0.3';
            reservedCount++;
        } else if (isReserved) {
            el.classList.add('reserved');
            reservedCount++;
        } else {
            el.classList.add('available');
            availableCount++;
            if (!nextAvail) nextAvail = `${day} ${monthNames[displayMonth]}`;

            const priceTag = document.createElement('span');
            priceTag.className = 'price-tag';
            priceTag.textContent = `R$${getWeekdayPrice(dayOfWeek)}`;
            el.appendChild(priceTag);
        }

        el.addEventListener('click', () => showDayModal(day, isReserved, isPast, dateStr));
        grid.appendChild(el);
    }

    document.getElementById('availableDays').textContent = availableCount;
    document.getElementById('reservedDays').textContent = reservedCount;
    document.getElementById('nextAvailable').textContent = nextAvail || '—';
}

/* ============================================ */
/* NAVEGAR ENTRE MESES                          */
/* ============================================ */
function changeMonth(delta) {
    displayMonth += delta;
    if (displayMonth > 11) {
        displayMonth = 0;
        displayYear++;
    }
    if (displayMonth < 0) {
        displayMonth = 11;
        displayYear--;
    }
    renderCalendar();
}

/* ============================================ */
/* MODAL AO CLICAR NO DIA                       */
/* ============================================ */
function showDayModal(day, isReserved, isPast, dateStr) {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const text = document.getElementById('modalText');
    const btn = document.getElementById('modalBtn');

    const formattedDate = `${day} de ${monthNames[displayMonth]} de ${displayYear}`;

    if (isPast) {
        title.textContent = 'Data Passada';
        text.textContent = `O dia ${formattedDate} já passou.`;
        btn.style.display = 'none';
    } else if (isReserved) {
        title.textContent = 'Data Reservada';
        text.textContent = `O dia ${formattedDate} já está reservado. Escolha outra data disponível.`;
        btn.textContent = 'Ver Datas Disponíveis';
        btn.href = '#disponibilidade';
        btn.style.display = 'inline-block';
        btn.onclick = closeModal;
    } else {
        const dayOfWeek = new Date(displayYear, displayMonth, day).getDay();
        const price = getWeekdayPrice(dayOfWeek);
        title.textContent = 'Data Disponível!';
        text.textContent = `${formattedDate} está disponível. Diária: R$ ${price}. Reserve pelo WhatsApp!`;
        btn.textContent = 'Reservar pelo WhatsApp';
        btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Gostaria de reservar o dia ${day}/${String(displayMonth + 1).padStart(2, '0')}/${displayYear}.`;
        btn.target = '_blank';
        btn.style.display = 'inline-block';
        btn.onclick = null;
    }

    modal.classList.add('active');
}

/* ============================================ */
/* FECHAR MODAL                                 */
/* ============================================ */
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

/* ============================================ */
/* MENU MOBILE                                  */
/* ============================================ */
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('mobile-open');
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('mobile-open');
    });
});

/* ============================================ */
/* NAVBAR AO ROLAR                              */
/* ============================================ */
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ============================================ */
/* ANIMAÇÃO AO ROLAR                            */
/* ============================================ */
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            el.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

/* ============================================ */
/* INICIALIZAÇÃO                                */
/* ============================================ */
window.addEventListener('load', () => {
    generateReservedDates();
    renderCalendar();
    revealOnScroll();
});
