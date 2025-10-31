// --- Quick Services ---
const servicesQuick = [
    { title: "Service One", description: "Fast and reliable service." },
    { title: "Service Two", description: "Affordable and simple." },
    { title: "Service Three", description: "24/7 support available." },
    { title: "Service Four", description: "High-quality solutions." }
];

const servicesGrid = document.getElementById("servicesGrid");
servicesQuick.forEach(s => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.innerHTML = `<h3>${s.title}</h3><p>${s.description}</p>`;
    servicesGrid.appendChild(card);
});

// --- Testimonials ---
const testimonials = [
    { name: "Alice", message: "This app changed my life!" },
    { name: "Bob", message: "Super fast and easy to use." },
    { name: "Charlie", message: "I recommend it to everyone!" }
];
const testimonialGrid = document.getElementById("testimonialGrid");
testimonials.forEach(t => {
    const card = document.createElement("div");
    card.className = "testimonial-card";
    card.innerHTML = `<h4>${t.name}</h4><p>${t.message}</p>`;
    testimonialGrid.appendChild(card);
});

// --- WINA BWANGU DASHBOARD LOGIC ---
const BOOTHS = [
    { id: 'Wina1', name: 'Wina1 - Lusaka CPD', location: 'Lusaka CPD' },
    { id: 'Wina2', name: 'Wina2 - Libala', location: 'Libala' },
    { id: 'Wina3', name: 'Wina3 - Kabwata', location: 'Kabwata' },
    { id: 'Wina4', name: 'Wina4 - Mandevu', location: 'Mandevu' },
    { id: 'Wina5', name: 'Wina5 - Woodlands', location: 'Woodlands' },
    { id: 'Wina6', name: 'Wina6 - Matero East', location: 'Matero East' },
];
const ALL_SERVICES = [
    { id: 'Airtel Money', name: 'Airtel Money', month_limit: 350000, revenue_per_kwacha: 0.05 },
    { id: 'MTN Money', name: 'MTN Money', month_limit: 160000, revenue_per_kwacha: 0.06 },
    { id: 'Zamtel Money', name: 'Zamtel Money', month_limit: 70000, revenue_per_kwacha: 0.045 },
    { id: 'Zanaco', name: 'Zanaco', month_limit: 80000, revenue_per_kwacha: 0.035 },
    { id: 'FNB', name: 'FNB', month_limit: 80000, revenue_per_kwacha: 0.04 },
];
const BOOTH_SERVICES_MAP = {
    Wina1: ['Airtel Money', 'MTN Money', 'Zamtel Money', 'Zanaco', 'FNB'],
    Wina2: ['Airtel Money', 'MTN Money', 'Zamtel Money', 'FNB'],
    Wina3: ['Airtel Money', 'MTN Money', 'Zamtel Money', 'Zanaco', 'FNB'],
    Wina4: ['Airtel Money', 'MTN Money', 'Zamtel Money'],
    Wina5: ['Airtel Money', 'MTN Money', 'Zanaco', 'FNB'],
    Wina6: ['Airtel Money', 'MTN Money', 'Zamtel Money'],
};

const TAX_RATE = 0.0875;
let transactions = [];
let nextTransactionId = 1;
let currentMonthUsage = new Map(ALL_SERVICES.map(s => [s.id, { used_amount: 0, revenue_before_tax: 0 }]));
let myPie;

// --- Dashboard Functions ---
function loadBooths() {
    const sel = document.getElementById("boothSel");
    sel.innerHTML = '<option value="">Select a Booth</option>';
    BOOTHS.forEach(b => {
        const o = document.createElement("option");
        o.value = b.id;
        o.text = b.name;
        sel.add(o);
    });
    updateBoothInfo();
}

function updateBoothInfo() {
    const boothId = document.getElementById("boothSel").value;
    const booth = BOOTHS.find(b => b.id === boothId);
    document.getElementById("boothLocation").textContent = booth ? booth.location : "N/A";
    const sSel = document.getElementById("serviceSel");
    sSel.innerHTML = '<option value="">Select a Service</option>';
    const serviceIds = BOOTH_SERVICES_MAP[boothId] || [];
    ALL_SERVICES.filter(s => serviceIds.includes(s.id)).forEach(s => {
        const o = document.createElement("option");
        o.value = s.id;
        o.text = s.name;
        o.dataset.rev = s.revenue_per_kwacha;
        sSel.add(o);
    });
    updateServiceInfo();
}

function updateServiceInfo() {
    const opt = document.getElementById("serviceSel").selectedOptions[0];
    document.getElementById("revPerKwacha").textContent = opt && opt.value ? opt.dataset.rev : "-";
}
document.getElementById("boothSel").addEventListener("change", updateBoothInfo);
document.getElementById("serviceSel").addEventListener("change", updateServiceInfo);

// Submit Transaction
document.getElementById("submitBtn").addEventListener("click", () => {
    const boothId = document.getElementById("boothSel").value;
    const serviceId = document.getElementById("serviceSel").value;
    const amount = Number(document.getElementById("amount").value);
    if (!boothId || !serviceId || amount <= 0 || isNaN(amount)) {
        document.getElementById("transactionResult").innerHTML = '<p style="color:red;">Error: Please select a booth/service and enter a valid amount greater than zero.</p>';
        return;
    }
    const service = ALL_SERVICES.find(s => s.id === serviceId);
    const revenueBeforeTax = amount * service.revenue_per_kwacha;
    const taxAmount = revenueBeforeTax * TAX_RATE;
    const revenueAfterTax = revenueBeforeTax - taxAmount;
    const transaction_id = `WB${String(nextTransactionId++).padStart(7, '0')}`;
    const usageData = currentMonthUsage.get(serviceId);
    let warning = '';
    if (usageData.used_amount + amount > service.month_limit) warning = `<p style="color:red;">WARNING: Transaction exceeds monthly limit of ${service.month_limit} K.</p>`;
    currentMonthUsage.set(serviceId, { used_amount: usageData.used_amount + amount, revenue_before_tax: usageData.revenue_before_tax + revenueBeforeTax });
    transactions.push({ transaction_id, boothId, serviceId, revenue_before_tax: revenueBeforeTax, tax_amount: taxAmount, timestamp: new Date() });
    document.getElementById("transactionResult").innerHTML = `
        ${warning}
        <p><b>Transaction ID:</b> ${transaction_id}</p>
        <p>Revenue Before Tax: ${revenueBeforeTax.toFixed(2)} K</p>
        <p>Tax (8.75%): ${taxAmount.toFixed(2)} K</p>
        <p>Net Revenue: ${revenueAfterTax.toFixed(2)} K</p>
    `;
    document.getElementById("amount").value = '';
    loadDashboard();
});

// Load Dashboard
function loadDashboard() {
    let totalRevenue = 0,
        totalCapitalRequired = 0;
    const byServiceData = ALL_SERVICES.map(service => {
        const usageData = currentMonthUsage.get(service.id);
        totalRevenue += usageData.revenue_before_tax;
        totalCapitalRequired += service.month_limit;
        return { name: service.name, used_amount: usageData.used_amount, month_limit: service.month_limit, revenue_before_tax: usageData.revenue_before_tax };
    });

    const cards = document.getElementById("cards");
    cards.innerHTML = `
        <div class="card"><h4>Total Revenue</h4><p>K ${totalRevenue.toFixed(2)}</p><p>${transactions.length} Transactions</p></div>
        <div class="card"><h4>Total Capital Limit</h4><p>K ${totalCapitalRequired.toFixed(2)}</p></div>
    `;
    byServiceData.forEach(s => {
        const percent = Math.min(100, (s.used_amount / s.month_limit) * 100);
        cards.innerHTML += `<div class="card"><h4>${s.name}</h4><p>Revenue: K ${s.revenue_before_tax.toFixed(2)}</p><p>Used: K ${s.used_amount.toFixed(2)} / Limit: K ${s.month_limit.toFixed(2)}</p><div class="progress-bar"><div class="progress-bar-inner" style="width:${percent}%">${percent.toFixed(1)}%</div></div></div>`;
    });

    // Pie Chart
    const labels = byServiceData.map(s => s.name);
    const values = byServiceData.map(s => s.revenue_before_tax);
    if (myPie) myPie.destroy();
    const ctx = document.getElementById("pieChart").getContext("2d");
    myPie = new Chart(ctx, { type: 'pie', data: { labels, datasets: [{ data: values, backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"] }] }, options: { responsive: true, plugins: { title: { display: true, text: 'Revenue Mix by Service' } } } });
}

// Initialize
loadBooths();
loadDashboard();
document.querySelector('.mobile-menu-toggle').addEventListener('click', () => {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('active');
});