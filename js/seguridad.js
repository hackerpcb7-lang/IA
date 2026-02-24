/**
 * Seguridad.js - Control de acceso e incidentes
 */

document.addEventListener('DOMContentLoaded', () => {
    loadActiveVisits();

    // Visitor Check-In
    const visitorForm = document.getElementById('visitorForm');
    if (visitorForm) {
        visitorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                window.serviceManager.registerVisitor(data);
                alert('✅ Entrada registrada correctamente.');
                e.target.reset();
                loadActiveVisits();
            } catch (err) {
                console.error(err);
                alert('Error al registrar visita');
            }
        });
    }

    // Incident Report
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        incidentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                window.serviceManager.reportIncident(data);
                alert('⚠️ Incidente reportado. Se ha notificado a la administración.');
                e.target.reset();
            } catch (err) {
                console.error(err);
                alert('Error al reportar incidente');
            }
        });
    }
});

function loadActiveVisits() {
    const list = document.getElementById('activeLog');
    const logs = window.serviceManager.data.seguridad_visitas || [];
    const active = logs.filter(v => v.status === 'active');

    if (active.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay visitas activas en el plantel.</p>';
        return;
    }

    list.innerHTML = active.map(v => `
        <div class="visit-item">
            <div>
                <strong>${v.name}</strong>
                <div style="font-size: 0.8rem; color: #666;">${v.reason} • ID: **${v.idNumber.slice(-4)}</div>
                <div style="font-size: 0.8rem; color: #3498db;">Entrada: ${new Date(v.checkIn).toLocaleTimeString()}</div>
            </div>
            <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="checkout('${v.id}')">
                Salida
            </button>
        </div>
    `).join('');
}

window.checkout = (id) => {
    if (confirm('¿Confirmar salida del visitante?')) {
        window.serviceManager.checkoutVisitor(id);
        loadActiveVisits();
    }
};
