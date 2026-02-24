/**
 * Service Manager - Sistema Central de Gestión de Solicitudes Escolares
 * Maneja la lógica de negocio, persistencia de datos y notificaciones simuladas.
 */
class ServiceManager {
    constructor() {
        this.STORAGE_KEY = 'pcb_school_services_data';
        this.data = this.loadData();
    }

    /**
     * Carga los datos del LocalStorage o inicializa la estructura si no existe.
     */
    loadData() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            solicitudes_documentos: [],
            matriculas: [],
            enfermeria_visitas: [],
            tickets_soporte: [],
            citas_orientacion: [],
            inventario_biblioteca: [],
            usuarios: [], // Simulados
            config: {
                schoolName: 'Escuela Superior Vocacional',
                academicYear: '2025-2026'
            },
            news: [], // Array for news/promotions
            firstGreeting: true
        };
    }

    /**
     * Guarda el estado actual en LocalStorage.
     */
    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }

    /**
     * Genera un ID único para un ticket o solicitud.
     * @param {string} prefix - Prefijo del ID (ej: 'DOC', 'MAT', 'ENF')
     */
    generateId(prefix) {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${datePart}-${randomPart}`;
    }

    /**
     * Crea una nueva solicitud de documento.
     * @param {Object} requestData - Datos del formulario
     */
    createDocumentRequest(requestData) {
        const id = this.generateId('DOC');
        const newRequest = {
            id: id,
            type: requestData.type, // 'certificacion', 'transcripcion', etc.
            studentName: requestData.studentName,
            studentId: requestData.studentId, // Número de estudiante
            grade: requestData.grade,
            email: requestData.email,
            phone: requestData.phone,
            details: requestData.details,
            status: 'pendiente', // 'pendiente', 'en_proceso', 'completado', 'rechazado'
            requestDate: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            comments: []
        };

        this.data.solicitudes_documentos.push(newRequest);
        this.saveData();
        this.simulateNotification(newRequest, 'created');
        return newRequest;
    }

    /**
     * Obtiene una solicitud por su ID.
     */
    getRequestById(id) {
        return this.data.solicitudes_documentos.find(req => req.id === id);
    }

    /**
     * Obtiene todas las solicitudes, opcionalmente filtradas por estado.
     */
    getRequests(status = null) {
        if (status) {
            return this.data.solicitudes_documentos.filter(req => req.status === status);
        }
        return this.data.solicitudes_documentos;
    }

    /**
     * Actualiza el estado de una solicitud.
     */
    updateRequestStatus(id, newStatus, adminComment = '') {
        const request = this.getRequestById(id);
        if (request) {
            request.status = newStatus;
            request.lastUpdate = new Date().toISOString();
            if (adminComment) {
                request.comments.push({
                    text: adminComment,
                    date: new Date().toISOString(),
                    author: 'Administrador'
                });
            }
            this.saveData();
            this.simulateNotification(request, 'updated');
            return true;
        }
        return false;
    }

    /**
     * Crea una nueva solicitud de matrícula.
     */
    createEnrollment(enrollmentData) {
        const id = this.generateId('MAT');
        const newEnrollment = {
            id: id,
            ...enrollmentData,
            status: 'pendiente',
            requestDate: new Date().toISOString()
        };

        this.data.matriculas.push(newEnrollment);
        this.saveData();
        this.simulateNotification(newEnrollment, 'enrollment_created');
        return newEnrollment;
    }

    /**
     * Registra una visita a enfermería.
     */
    registerNurseVisit(visitData) {
        const id = this.generateId('NUR');
        const newVisit = {
            id: id,
            ...visitData,
            date: new Date().toISOString(),
            status: 'atendido'
        };

        this.data.enfermeria_visitas.push(newVisit);
        this.saveData();
        return newVisit;
    }

    /**
     * Obtiene estadísticas anónimas de enfermería.
     */
    getNurseStats() {
        const visits = this.data.enfermeria_visitas;
        const stats = {
            total: visits.length,
            byType: {},
            lastWeek: 0
        };

        // Calcular estadísticas
        visits.forEach(v => {
            stats.byType[v.reason] = (stats.byType[v.reason] || 0) + 1;

            // Check if last week (simple check)
            const visitDate = new Date(v.date);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            if (visitDate > oneWeekAgo) {
                stats.lastWeek++;
            }
        });

        return stats;
    }

    /**
     * Crea una cita de orientación.
     */
    createCounselingAppointment(appointmentData) {
        const id = this.generateId('CIT');
        const newAppointment = {
            id: id,
            ...appointmentData,
            status: 'pendiente',
            dateCreated: new Date().toISOString()
        };

        this.data.citas_orientacion.push(newAppointment);
        this.saveData();
        this.simulateNotification(newAppointment, 'appointment_created');
        return newAppointment;
    }

    /**
     * Crea una alerta temprana (Riesgo Académico).
     */
    createEarlyAlert(alertData) {
        const id = this.generateId('ALT');
        const newAlert = {
            id: id,
            ...alertData,
            status: 'activa',
            priority: 'alta',
            dateCreated: new Date().toISOString()
        };

        // Podríamos tener una colección separada, pero por simplicidad usaremos tickets de soporte o una genérica
        // Para este MVP, lo guardamos en 'citas_orientacion' con un tipo especial o añadimos 'alertas_tempranas' al schema
        if (!this.data.alertas_tempranas) this.data.alertas_tempranas = [];

        this.data.alertas_tempranas.push(newAlert);
        this.saveData();
        return newAlert;
    }

    /**
     * Crea un ticket de soporte técnico.
     */
    createTicket(ticketData) {
        const id = this.generateId('TICK');
        const newTicket = {
            id: id,
            ...ticketData,
            status: 'abierto',
            assignedTo: null,
            dateCreated: new Date().toISOString(),
            logs: []
        };

        this.data.tickets_soporte.push(newTicket);
        this.saveData();
        this.simulateNotification(newTicket, 'ticket_created');
        return newTicket;
    }

    /**
     * Registra horas de trabajo WBL para un estudiante técnico.
     */
    logWBLHours(logData) {
        const ticket = this.data.tickets_soporte.find(t => t.id === logData.ticketId);
        if (ticket) {
            ticket.logs.push({
                studentName: logData.studentName,
                hours: logData.hours,
                description: logData.description,
                date: new Date().toISOString(),
                evidenceUrl: logData.evidenceUrl || null
            });

            // Si se marca como completado
            if (logData.markCompleted) {
                ticket.status = 'resuelto';
                ticket.dateClosed = new Date().toISOString();
            }

            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * Busca libros en el catálogo simulado.
     */
    searchBooks(query) {
        // Catálogo simulado
        const catalog = [
            { id: 'LIB001', title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes', category: 'Literatura' },
            { id: 'LIB002', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', category: 'Literatura' },
            { id: 'LIB003', title: 'Biología Celular', author: 'Albert Bruce', category: 'Ciencias' },
            { id: 'LIB004', title: 'Álgebra de Baldor', author: 'Aurelio Baldor', category: 'Matemáticas' },
            { id: 'LIB005', title: 'Historia de Puerto Rico', author: 'Fernando Picó', category: 'Historia' }
        ];

        if (!query) return catalog;
        const lowerQ = query.toLowerCase();
        return catalog.filter(book =>
            book.title.toLowerCase().includes(lowerQ) ||
            book.author.toLowerCase().includes(lowerQ)
        );
    }

    /**
     * Crea una reserva de libro.
     */
    reserveBook(reservationData) {
        const id = this.generateId('RES');
        const newReservation = {
            id: id,
            ...reservationData,
            status: 'pendiente',
            dateReserved: new Date().toISOString()
        };

        // Guardamos en una lista genérica por ahora o extendemos schema
        if (!this.data.reservas_biblioteca) this.data.reservas_biblioteca = [];
        this.data.reservas_biblioteca.push(newReservation);
        this.saveData();
        return newReservation;
    }

    /**
     * Envía un mensaje desde el portal de padres.
     */
    sendParentMessage(messageData) {
        const id = this.generateId('MSG');
        const newMessage = {
            id: id,
            ...messageData,
            status: 'enviado',
            dateSent: new Date().toISOString()
        };

        if (!this.data.mensajes_padres) this.data.mensajes_padres = [];
        this.data.mensajes_padres.push(newMessage);
        this.saveData();
        this.simulateNotification(newMessage, 'message_sent');
        return newMessage;
    }

    /**
     * Registra una visita en el módulo de seguridad.
     */
    registerVisitor(visitorData) {
        const id = this.generateId('VISIT');
        const newVisit = {
            id: id,
            ...visitorData,
            checkIn: new Date().toISOString(),
            checkOut: null,
            status: 'active'
        };

        if (!this.data.seguridad_visitas) this.data.seguridad_visitas = [];
        this.data.seguridad_visitas.push(newVisit);
        this.saveData();
        return newVisit;
    }

    /**
     * Registra la salida de un visitante.
     */
    checkoutVisitor(visitorId) {
        if (!this.data.seguridad_visitas) return false;

        const visit = this.data.seguridad_visitas.find(v => v.id === visitorId);
        if (visit && visit.status === 'active') {
            visit.checkOut = new Date().toISOString();
            visit.status = 'completed';
            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * Reporta un incidente de seguridad.
     */
    reportIncident(incidentData) {
        const id = this.generateId('INC');
        const newIncident = {
            id: id,
            ...incidentData,
            dateReported: new Date().toISOString(),
            status: 'investigating'
        };

        if (!this.data.seguridad_incidentes) this.data.seguridad_incidentes = [];
        this.data.seguridad_incidentes.push(newIncident);
        this.saveData();
        this.simulateNotification(newIncident, 'incident_reported');
        return newIncident;
    }

    /**
     * Respuesta mejorada del Asistente IA - Más amigable y lógica
     */
    getAIResponse(query) {
        const lowerQ = query.toLowerCase();
        // Mapa de meses y calendario (ubicado aquí para reutilizarse en varias comprobaciones)
        const months = {
            enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
            julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
        };

        const calendarEvents = [
            { day: 13, month: 2, title: 'Reuniones profesionales de facultad y equipo (tarde)' },
            { day: 16, month: 2, title: 'Día festivo' },
            { day: 19, month: 2, title: 'Assessment' },
            { day: 2, month: 3, title: 'Día festivo' },
            { day: 16, month: 3, title: 'Assessment' },
            { day: 20, month: 3, title: 'Reuniones profesionales (tarde)' },
            { day: 23, month: 3, title: 'Día festivo' },
            { day: 27, month: 3, title: 'Entrega del informe de progreso académico' },
            { day: 2, month: 4, title: 'Receso académico (personal docente y no docente)' },
            { day: 3, month: 4, title: 'Feriado' },
            { start: { day: 13, month: 4 }, end: { day: 7, month: 5 }, title: 'Assessment (período completo)' },
            { start: { day: 18, month: 5 }, end: { day: 22, month: 5 }, title: 'Semana de la Educación' },
            { day: 22, month: 5, title: 'Receso académico' },
            { day: 25, month: 5, title: 'Feriado' },
            { day: 26, month: 5, title: 'Evaluaciones finales' },
            { day: 27, month: 5, title: 'Evaluaciones finales' },
            { day: 29, month: 5, title: 'Entrega del informe de progreso académico' }
        ];

        // --- Detectar fechas específicas como "2 de marzo", "el 2 marzo", "02 de marzo" ---
        const dateMatch = lowerQ.match(/(?:\b|^)(?:el\s*)?(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/);
        if (dateMatch) {
            const day = parseInt(dateMatch[1], 10);
            const monthName = dateMatch[2];
            const month = months[monthName];

            const matches = [];
            calendarEvents.forEach(ev => {
                if (ev.day && ev.month) {
                    if (ev.day === day && ev.month === month) {
                        matches.push(ev.title);
                    }
                } else if (ev.start && ev.end) {
                    const s = ev.start;
                    const e = ev.end;
                    const afterStart = (month > s.month) || (month === s.month && day >= s.day);
                    const beforeEnd = (month < e.month) || (month === e.month && day <= e.day);
                    if (afterStart && beforeEnd) {
                        matches.push(ev.title + ` (del ${s.day} de ${Object.keys(months).find(m=>months[m]===s.month)} al ${e.day} de ${Object.keys(months).find(m=>months[m]===e.month)})`);
                    }
                }
            });

            if (matches.length > 0) {
                return `📅 El ${day} de ${monthName}: ${matches.join('; ')}.`;
            }
            return `📅 No hay eventos listados para el ${day} de ${monthName} en el calendario escolar. ¿Deseas ver el calendario completo?`;
        }

        // --------------------------------------------
        // Consulta por mes: si el usuario pide solo un mes
        // Devuelve únicamente los eventos que ocurren en ese mes
        // --------------------------------------------
        const monthOnlyMatch = lowerQ.match(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/);
        if (monthOnlyMatch) {
            const monthName = monthOnlyMatch[1];
            const monthNum = months[monthName];

            // Determinar si la consulta busca específicamente el mes
            const shortQuery = query.trim().length <= 12; // ej: "marzo" o "marzo?"
            const explicitKeywords = /\b(qué|que hay|qué hay|evento|eventos|actividad|actividades|en)\b/;
            if (shortQuery || explicitKeywords.test(lowerQ) || lowerQ.includes('en ' + monthName)) {
                const results = [];
                calendarEvents.forEach(ev => {
                    if (ev.day && ev.month) {
                        if (ev.month === monthNum) {
                            results.push(`• ${ev.day} de ${monthName}: ${ev.title}`);
                        }
                    } else if (ev.start && ev.end) {
                        // Si el rango cubre el mes
                        const s = ev.start;
                        const e = ev.end;
                        const covers = (monthNum > s.month && monthNum < e.month) || (monthNum === s.month) || (monthNum === e.month);
                        if (covers) {
                            // Formatear rango
                            const startName = Object.keys(months).find(m => months[m] === s.month);
                            const endName = Object.keys(months).find(m => months[m] === e.month);
                            results.push(`• ${ev.title} (del ${s.day} de ${startName} al ${e.day} de ${endName})`);
                        }
                    }
                });

                if (results.length > 0) {
                    return `📅 <strong>Eventos de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</strong>:<br><br>` + results.join('<br>');
                }
                return `📅 No se encontraron eventos listados para ${monthName}. ¿Quieres ver el calendario completo?`;
            }
        }
        
        // ============================================
        // SALUDOS - Friendly Greetings
        // ============================================
        if (lowerQ.includes('hola') || lowerQ.includes('buenos') || lowerQ.includes('buenas') || lowerQ.includes('hey') || lowerQ.includes('hi')) {
            // First greeting special response
            if (this.data.firstGreeting) {
                this.data.firstGreeting = false;
                this.saveData();
                return "¡Hola! 👋 ¡Qué gusto saludarte! 😊 Soy el Asistente PCB de la Escuela Superior Vocacional Pablo Colón Berdecia. Estoy aquí para ayudarte con cualquier duda que tengas sobre nuestros servicios, horarios o cualquier información de la escuela. ¿En qué puedo servirte hoy?";
            }
            // Subsequent greetings
            const greetings = [
                "¡Hola de nuevo! 😊 ¿En qué puedo ayudarte hoy?",
                "¡Buenos días/tardes! 🌟 ¿En qué te puedo asistir?",
                "¡Hey! 👋 ¡Me alegra verte de nuevo! ¿Qué necesitas saber?",
                "¡Hola! 😊 ¿Tienes alguna pregunta sobre la escuela?"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // ============================================
        // DESPEDIDAS - Farewells
        // ============================================
        if (lowerQ.includes('adiós') || lowerQ.includes('adios') || lowerQ.includes('bye') || lowerQ.includes('hasta luego') || lowerQ.includes('nos vemos')) {
            const farewells = [
                "¡Adiós! 👋 Fue un placer ayudarte. ¡Que tengas un excelente día!",
                "¡Hasta luego! 😊 Si necesitas algo más, aquí estaré.",
                "¡Bye! 👋 ¡Que te vaya muy bien en tu día!",
                "¡Nos vemos! 🌟 Fue un gusto asistirte."
            ];
            return farewells[Math.floor(Math.random() * farewells.length)];
        }

        // ============================================
        // AGRADECIMIENTOS - Thanks
        // ============================================
        if (lowerQ.includes('gracias') || lowerQ.includes('thank') || lowerQ.includes('te lo agradezco') || lowerQ.includes('muchas gracias')) {
            const thanks = [
                "¡De nada! 😊 ¡Para eso estoy aquí! ¿Hay algo más en lo que pueda ayudarte?",
                "¡Con mucho gusto! 😄 Si tienes más preguntas, no dudes en preguntar.",
                "¡Para eso estamos! 😊 ¿Necesitas algo más?",
                "¡De nada! 🙌 Estoy para servirte. ¿En qué más puedo ayudarte?"
            ];
            return thanks[Math.floor(Math.random() * thanks.length)];
        }

        // ============================================
        // NAVEGACIÓN A SERVICIOS - Service Navigation
        // ============================================
        if (lowerQ.includes('matrícula') || lowerQ.includes('matricula') || lowerQ.includes('inscribirme') || lowerQ.includes('inscripción')) {
            return "Para realizar tu matrícula, te llevo a la sección correspondiente 👉 <a href='matricula.html'>Matrícula Online</a>. Allí podrás completar el formulario de inscripción de forma fácil y rápida. ¿Necesitas ayuda con algo más?";
        }
        if ((lowerQ.includes('solicitud') || lowerQ.includes('solicitar')) && (lowerQ.includes('documento') || lowerQ.includes('certificación') || lowerQ.includes('transcripción') || lowerQ.includes('record'))) {
            return "Por supuesto, puedo ayudarte con eso 📄. Te llevo a la sección de solicitudes 👉 <a href='solicitudes.html'>Solicitud de Documentos</a>. Allí puedes pedir certificaciones, transcripciones y más. ¿Te gustaría saber algo más?";
        }
        if (lowerQ.includes('servicio') && lowerQ.includes('técnico') || lowerQ.includes('soporte técnico') || lowerQ.includes('mantenimiento')) {
            return "Para soporte técnico y mantenimiento de equipos, visita nuestra sección 👉 <a href='servicios-tecnicos.html'>Servicios Técnicos</a>. Nuestro equipo te ayudará con cualquier problema de tecnología. ¿Hay algo específico que necesites?";
        }
        if (lowerQ.includes('enfermería') || lowerQ.includes('enfermeria') || lowerQ.includes('enfermero') || lowerQ.includes('médico') || lowerQ.includes('medico') || lowerQ.includes('salud')) {
            return "Para atención de enfermería y servicios de salud 👉 <a href='enfermeria.html'>Enfermería</a>. Tenemos personal capacitado para atender urgencias básicas y administrar medicamentos con autorización. ¿Necesitas más información?";
        }
        if (lowerQ.includes('orientación') || lowerQ.includes('orientacion') || lowerQ.includes('consejero') || lowerQ.includes('psicólogo') || lowerQ.includes('apoyo')) {
            return "Para orientación académica y apoyo psicológico 👉 <a href='orientacion.html'>Orientación</a>. Nuestros consejeros están disponibles para ayudarte con cualquier situación académica o personal. ¿En qué puedo orientarte?";
        }
        if (lowerQ.includes('biblioteca') || lowerQ.includes('libro') || lowerQ.includes('préstamo') || lowerQ.includes('prestamo')) {
            return "Para la biblioteca y préstamos de libros 👉 <a href='biblioteca.html'>Biblioteca</a>. Nuestro catálogo tiene muchos recursos de estudio disponibles. ¿Buscas algún libro en específico?";
        }
        if (lowerQ.includes('comedor') || lowerQ.includes('almuerzo') || lowerQ.includes('comida') || lowerQ.includes('desayuno')) {
            return "Para el servicio de comedor y ver el menú 👉 <a href='comedor.html'>Comedor</a>. Sirvimos almuerzos de 11:00 AM a 1:00 PM. ¿Tienes alguna pregunta sobre la comida?";
        }
        if (lowerQ.includes('portal') && (lowerQ.includes('padres') || lowerQ.includes('familia') || lowerQ.includes('padre'))) {
            return "Para el portal de comunicación con padres 👉 <a href='padres.html'>Portal de Padres</a>. Allí puedes comunicarte directamente con los maestros y ver información de tus hijos. ¿Necesitas algo más?";
        }
        if (lowerQ.includes('seguridad') || lowerQ.includes('visita') || lowerQ.includes('visitante') || lowerQ.includes('incidente')) {
            return "Para temas de seguridad y registro de visitantes 👉 <a href='seguridad.html'>Seguridad</a>. Puedes registrar visitantes y reportar incidentes. ¿En qué puedo ayudarte?";
        }
        if ((lowerQ.includes('dashboard') || lowerQ.includes('evidencia') || lowerQ.includes('seguimiento')) && (lowerQ.includes('académico') || lowerQ.includes('academic'))) {
            return "Para ver el dashboard de evidencia y seguimiento académico 👉 <a href='evidencia.html'>Dashboard Evidencia</a>. ¿Necesitas información adicional sobre el seguimiento?";
        }
        if (lowerQ.includes('correos') && (lowerQ.includes('maestro') || lowerQ.includes('profesor') || lowerQ.includes('teacher') || lowerQ.includes('electrónico'))) {
            return "Aquí puedes ver los correos electrónicos de los maestros 👉 <a href='correos-maestros-tabla.html'>Correos Electrónicos</a>. ¿Necesitas contactar a algún profesor en específico?";
        }
        if (lowerQ.includes('microsoft') && lowerQ.includes('teams')) {
            return "Para acceder a Microsoft Teams (clases virtuales) 👉 <a href='https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=5e3ce6c0-2b1f-4285-8d4b-75ee78787346&scope=openId%20profile%20openid%20offline_access&redirect_uri=https%3A%2F%2Fteams.microsoft.com%2Fv2&client-request-id=019be6e8-5a6c-7d37-b129-894db9c8d8ef&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=3.30.0&client_info=1&code_challenge=6ZqFlWHLh3RpNojFPjlqU4h9HyciQoVF24L_a1_WF4A&code_challenge_method=S256&nonce=019be6e8-5a6d-7bdb-9075-c5ce0aa099ac&state=eyJpZCI6IjAxOWJlNmU4LTVhNmMtNzY0OS1hNGRlLWQ4YTQ0MTU4OGMxYyIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D%7Chttps%3A%2F%2Fteams.microsoft.com%2Fv2%2F%3Fculture%3Den-us%26country%3Dus%26enablemcasfort21%3Dtrue' target='_blank'>Microsoft Teams</a>. ¡Que tengas una buena clase! 📚";
        }
        if (lowerQ.includes('power') && lowerQ.includes('de')) {
            return "Para acceder a Power DE (portal de información estudiantil) 👉 <a href='https://informacionestudiantil.dde.pr/public/create_multi_student_account.html' target='_blank'>Power DE</a>. ¿Necesitas ayuda con tu cuenta?";
        }
        if (lowerQ.includes('calcular') && (lowerQ.includes('igs') || lowerQ.includes('índice') || lowerQ.includes('indice') || lowerQ.includes('promedio'))) {
            return "Para calcular tu Índice de Graduación Secundária (IGS) 👉 <a href='https://admisiones.upr.edu/calculadora-igs/' target='_blank'>Calculadora IGS</a>. ¡Éxito en tus cálculos! 📊";
        }
        if (lowerQ.includes('deporte') || lowerQ.includes('deportes') || lowerQ.includes('athlet') || lowerQ.includes('ejercicio')) {
            return "Para ver las actividades deportivas 👉 <a href='deportes.html'>Deportes</a>. Tenemos varias disciplinas disponibles. ¿Cuál te interesa?";
        }

        // ============================================
        // CAPACIDADES DEL ASISTENTE - What can you do?
        // ============================================
        if (lowerQ.includes('qué puedes hacer') || lowerQ.includes('que puedes hacer') || lowerQ.includes('  ') || lowerQ.includes('que haces') || lowerQ.includes('para qué sirve') || lowerQ.includes('para que sirve') || lowerQ.includes('cómo me ayudas') || lowerQ.includes('como me ayudas') || lowerQ.includes('qué sabes') || lowerQ.includes('que sabes') || lowerQ.includes('qué servicios') || lowerQ.includes('que servicios') || lowerQ.includes('dime qué puedes') || lowerQ.includes('dime que puedes')) {
            return "¡Excelente! 😊 Soy el <strong>Asistente PCB</strong> y puedo ayudarte con muchas cosas:<br><br>🎓 <strong>Información de la Escuela</strong>: Horarios, ubicación, contacto, información general<br><br>📝 <strong>Matrícula</strong>: Proceso de inscripción, requisitos, fechas<br><br>📄 <strong>Solicitud de Documentos</strong>: Certificaciones, transcripciones, Records académicos<br><br>🔧 <strong>Servicios Técnicos</strong>: Soporte técnico, mantenimiento de equipos<br><br>🏥 <strong>Enfermería</strong>: Atención médica, medicamentos, emergencias<br><br>💬 <strong>Orientación</strong>: Apoyo académico, psicológico, consejería<br><br>📚 <strong>Biblioteca</strong>: Préstamo de libros, catálogo, reservas<br><br>🍽️ <strong>Comedor</strong>: Menú, horarios, información de almuerzo<br><br>👨‍👩‍👧 <strong>Portal de Padres</strong>: Comunicación con maestros, información de estudiantes<br><br>🛡️ <strong>Seguridad</strong>: Registro de visitantes, reportar incidentes<br><br>📊 <strong>Evidencia Académica</strong>: Dashboard de seguimiento, reportes<br><br>📧 <strong>Correos de Maestros</strong>: Directorio de contactos<br><br>💻 <strong>Recursos Digitales</strong>: Microsoft Teams, Power DE, Calculadora IGS<br><br>🏃 <strong>Deportes</strong>: Actividades deportivas, programas<br><br>❓ <strong>Responder Preguntas</strong>: Dudas generales sobre la escuela<br><br>🔍 <strong>Guía y Orientación</strong>: Te ayudo a encontrar lo que necesitas<br><br>¡Simplemente pregúntame lo que necesites saber! 😊";
        }

        // ============================================
        // PREGUNTAS SOBRE LA ESCUELA - About the School
        // ============================================
        if (lowerQ.includes('qué es') || lowerQ.includes('qué es') || lowerQ.includes('quien eres') || lowerQ.includes('quién eres') || lowerQ.includes('qué haces') || lowerQ.includes('para qué')) {
            return "¡Excelente pregunta! 😊 Soy el <strong>Asistente Virtual PCB</strong> de la <strong>Escuela Superior Vocacional Pablo Colón Berdecia</strong>. Estoy aquí para orientarte y ayudarte a encontrar la información que necesitas sobre nuestros servicios, horarios, procesos y más. ¡Pregúntame lo que quieras!";
        }
        if (lowerQ.includes('dónde está') || lowerQ.includes('donde está') || lowerQ.includes('ubicación') || lowerQ.includes('dirección') || lowerQ.includes('direccion')) {
            return "La Escuela Superior Vocacional Pablo Colón Berdecia está ubicada en 📍 <strong>Puerto Rico</strong>. Para más detalles específicos sobre la dirección, te recomiendo contactar a la oficina principal. ¿Te gustaría que te proporcione más información de contacto?";
        }
        if (lowerQ.includes('teléfono') || lowerQ.includes('telefono') || lowerQ.includes('llamar') || lowerQ.includes('contacto') || lowerQ.includes('correo')) {
            return "Para contactar a la escuela, puedes usar el formulario en nuestra sección de 📞 <a href='index.html#contacto'>Contacto</a>. Allí encontrarás los números telefónicos y correos electrónicos disponibles. ¿Necesitas algo más específico?";
        }
        if (lowerQ.includes('horario') || lowerQ.includes('hora') || lowerQ.includes('cuando')) {
            return "El horario escolar regular es de <strong>7:30 AM a 2:30 PM</strong> para los estudiantes. 📅 La oficina administrativa suele estar abierta de 8:00 AM a 3:00 PM. ¿Tienes alguna duda sobre un horario específico?";
        }
        if (lowerQ.includes('cuándo empieza') || lowerQ.includes('cuando empieza') || lowerQ.includes('inicio') && (lowerQ.includes('clase') || lowerQ.includes('curso') || lowerQ.includes('año'))) {
            return "El año académico típicamente comienza en agosto. 📅 Te recomiendo estar atento a nuestras publicaciones y avisos para las fechas exactas de matrícula e inicio de clases. ¿Necesitas información sobre la matrícula?";
        }

        // ============================================
        // SERVICIOS ESPECÍFICOS - Specific Services
        // ============================================
        if (lowerQ.includes('servicio') && (lowerQ.includes('qué') || lowerQ.includes('cuales') || lowerQ.includes('cuáles') || lowerQ.includes('tienes') || lowerQ.includes('ofrec'))) {
            return "¡Con gusto te informo! 🎓 La Escuela Superior Vocacional Pablo Colón Berdecia ofrece estos servicios:<br><br>📚 <a href='matricula.html'>Matrícula Online</a>: Inscríbete fácilmente<br>📄 <a href='solicitudes.html'>Solicitud de Documentos</a>: Certificaciones, transcripciones<br>🔧 <a href='servicios-tecnicos.html'>Servicios Técnicos</a>: Soporte tecnológico<br>🏥 <a href='enfermeria.html'>Enfermería</a>: Atención médica básica<br>💬 <a href='orientacion.html'>Orientación</a>: Apoyo psicológico y académico<br>📖 <a href='biblioteca.html'>Biblioteca</a>: Préstamo de libros<br>🍽️ <a href='comedor.html'>Comedor</a>: Alimentación escolar<br>👨‍👩‍👧 <a href='padres.html'>Portal de Padres</a>: Comunicación familiar<br>🛡️ <a href='seguridad.html'>Seguridad</a>: Registro de visitantes<br>📊 <a href='evidencia.html'>Dashboard Evidencia</a>: Seguimiento académico<br>🏃 <a href='deportes.html'>Deportes</a>: Actividades físicas<br><br>¡Dime cuál te interesa y te ayudo! 😊";
        }

        // ============================================
        // PREGUNTAS SOBRE ESTADO DE SOLICITUDES - Request Status
        // ============================================
        if (lowerQ.includes('estado') && (lowerQ.includes('solicitud') || lowerQ.includes('ticket') || lowerQ.includes('pedido'))) {
            return "Para consultar el estado de tu solicitud, te recomiendo visitar la sección donde la creaste o contactar directamente a la oficina administrativa 📞. ellos podrán darte información actualizada sobre tu caso. ¿Tienes el número de solicitud?";
        }
        if (lowerQ.includes('cuánto') && (lowerQ.includes('tarda') || lowerQ.includes('demora') || lowerQ.includes('tiempo'))) {
            return "El tiempo de procesamiento varía según el tipo de solicitud 📋. Generalmente:<br><br>• Documentos simples: 2-3 días hábiles<br>• Certificaciones: 3-5 días hábiles<br>• Matrículas: Depende del período<br><br>Te recomiendo presentar tu solicitud con anticipación. ¿Necesitas algo más?";
        }

        // ============================================
        // AYUDA GENERAL - General Help
        // ============================================
        if (lowerQ.includes('ayuda') || lowerQ.includes('help') || lowerQ.includes('auxilio') || lowerQ.includes('socorro')) {
            return "¡Claro que sí! 😊 Estoy aquí para ayudarte. Puedo orientarte sobre:<br><br>✅ Procesos de matrícula y solicitudes<br>✅ Horarios de servicios (comedor, biblioteca, etc.)<br>✅ Información de contacto<br>✅ Navegación en el sistema<br>✅ Y cualquier otra duda sobre la escuela<br><br>¿Qué necesitas saber?";
        }
        if (lowerQ.includes('no entiendo') || lowerQ.includes('confundido') || lowerQ.includes('perdido') || lowerQ.includes('ayúdame') || lowerQ.includes('ayudame')) {
            return "¡No te preocupes! 😊 Estoy aquí para ayudarte. Trata de explicarme tu duda con tus propias palabras y con gusto te ayudo a encontrar lo que necesitas. También puedes preguntarme directamente por un servicio específico. ¿Qué necesitas?";
        }

        // ============================================
        // PREGUNTAS DE FOLLOW-UP - Follow-up Questions
        // ============================================
        if (lowerQ.includes('sí') || lowerQ.includes('si') || lowerQ.includes('también') || lowerQ.includes('tambien') || lowerQ.includes('perfecto') || lowerQ.includes('ok') || lowerQ.includes('de acuerdo')) {
            const responses = [
                "¡Perfecto! 😊 ¿Hay algo más en lo que pueda ayudarte?",
                "¡Genial! 😄 ¿Tienes alguna otra pregunta?",
                "¡Excelente! 👍 ¿En qué más puedo asistirte?",
                "¡Qué bueno! 🎉 ¿Necesitas más información?"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
        if (lowerQ.includes('no') && (lowerQ.includes('gracias') || lowerQ.includes('nada') || lowerQ.includes('otro'))) {
            const responses = [
                "¡De nada! 😊 ¡Que tengas un excelente día! Si necesitas algo más, aquí estaré.",
                "¡Para eso estoy! 🙌 ¡Que te vaya muy bien!",
                "¡Fue un placer ayudarte! 👋 ¡hasta pronto!"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        // ============================================
        // PREGUNTAS VARIAS - Miscellaneous Questions
        // ============================================
        if (lowerQ.includes('cómo estás') || lowerQ.includes('como estás') || lowerQ.includes('qué tal') || lowerQ.includes('que tal') || lowerQ.includes('como te va') || lowerQ.includes('qué onda') || lowerQ.includes('que onda') || lowerQ.includes('qué pasa') || lowerQ.includes('que pasa')) {
            const followUps = [
                "¡Estoy bien, gracias! ¿Cómo van tus clases hoy? ¿Necesitas ayuda con alguna materia?",
                "¡Todo en orden! ¿Tienes alguna duda sobre tareas, horarios o el calendario escolar?",
                "¡Listo para ayudar! ¿Hay alguna asignatura con la que quieras apoyo o información?",
                "¡Muy bien! ¿Te interesa revisar alguna tarea, evento escolar o recurso académico ahora?",
                "¡Bien, gracias! ¿Prefieres que te muestre recursos de estudio, el calendario o el menú del comedor?",
                "Me encuentro listo para asistirte. ¿Quieres ayuda con una tarea, preparar un examen o consultar una fecha importante?",
                "¡Todo tranquilo por aquí! ¿Estás buscando información sobre tus clases, el horario o alguna actividad escolar?",
                "Perfecto, gracias. ¿Te gustaría revisar las últimas novedades de la escuela o tus próximas evaluaciones?",
                "¡Listo para apoyar! ¿Necesitas consejos de estudio, material de apoyo o ayuda para contactar a un profesor?",
                "Muy bien, gracias. ¿Quieres que busque eventos en el calendario, horarios de la escuela o información de matrícula?",
                "Estoy bien, ¿prefieres un tono más formal o más informal en mis respuestas? Puedo adaptarme al estilo académico que prefieras.",
                "¡Gracias por preguntar! ¿Te gustaría que te recuerde tareas pendientes o eventos próximos del colegio?"
            ];
            return followUps[Math.floor(Math.random() * followUps.length)];
        }
        if (lowerQ.includes('tu nombre') || lowerQ.includes('cómo te llamas') || lowerQ.includes('como te llamas')) {
            return "Me llamo <strong>Asistente PCB</strong> 🤖, soy el asistente virtual de la Escuela Superior Vocacional Pablo Colón Berdecia. ¡Estoy para servirte! 😊";
        }
        if (lowerQ.includes('clima') || lowerQ.includes('tiempo') || lowerQ.includes('llover') || lowerQ.includes('sol')) {
            return "No tengo acceso a información del clima en tiempo real 🌤️, pero te recomiendo revisar una aplicación del clima para verificar las condiciones actuales. ¿Hay algo más en lo que pueda ayudarte con la escuela?";
        }

        

        // ============================================
        // CALENDARIO ESCOLAR 2025-2026 - School Calendar
        // ============================================
        if (lowerQ.includes('calendario') || lowerQ.includes('fecha') || lowerQ.includes('fechas importantes') || lowerQ.includes('dates') || lowerQ.includes('agenda')) {
            return "📅 <strong>Calendario Escolar 2025-2026 - Fechas Importantes:</strong><br><br>" +
                "<strong>FEBRERO:</strong><br>" +
                "• 13 de febrero: Reuniones profesionales de facultad y equipo para análisis de intervenciones a estudiantes (tarde)<br>" +
                "• 16 de febrero: Día festivo según calendario escolar<br>" +
                "• 19 de febrero: Assessment<br><br>" +
                "<strong>MARZO:</strong><br>" +
                "• 2 de marzo: Día festivo<br>" +
                "• 16 de marzo: Assessment<br>" +
                "• 20 de marzo: Reuniones profesionales (tarde)<br>" +
                "• 23 de marzo: Día festivo<br>" +
                "• 27 de marzo: Entrega del informe de progreso académico<br><br>" +
                "<strong>ABRIL:</strong><br>" +
                "• 2 de abril: Receso académico (personal docente y no docente)<br>" +
                "• 3 de abril: Feriado<br>" +
                "• Del 13 de abril al 7 de mayo: Assessment<br><br>" +
                "<strong>MAYO:</strong><br>" +
                "• Del 18 al 22 de mayo: Semana de la Educación<br>" +
                "• 22 de mayo: Receso académico<br>" +
                "• 25 de mayo: Feriado<br>" +
                "• 26 y 27 de mayo: Evaluaciones finales<br>" +
                "• 29 de mayo: Entrega del informe de progreso académico<br><br>" +
                "¿Necesitas información más específica sobre alguna fecha? 😊";
        }

        // Assessment
        if (lowerQ.includes('assessment') || lowerQ.includes('evaluación') || lowerQ.includes('evaluacion') || lowerQ.includes('examen')) {
            return "📝 <strong>Información sobre Assessments:</strong><br><br>" +
                "<strong>FEBRERO:</strong><br>" +
                "• 19 de febrero: Assessment<br><br>" +
                "<strong>MARZO:</strong><br>" +
                "• 16 de marzo: Assessment<br><br>" +
                "<strong>ABRIL - MAYO:</strong><br>" +
                "• Del 13 de abril al 7 de mayo: Assessment (período completo)<br><br>" +
                "Los assessments son evaluaciones importantes para medir el progreso académico. ¿Tienes alguna pregunta específica sobre los horarios o preparación? 😊";
        }

        // Días festivos y feriados
        if (lowerQ.includes('feriado') || lowerQ.includes('día festivo') || lowerQ.includes('dia festivo') || lowerQ.includes('festivo') || lowerQ.includes('libre')) {
            return "🎉 <strong>Días Festivos y Feriados 2025-2026:</strong><br><br>" +
                "<strong>FEBRERO:</strong><br>" +
                "• 16 de febrero: Día festivo<br><br>" +
                "<strong>MARZO:</strong><br>" +
                "• 2 de marzo: Día festivo<br>" +
                "• 23 de marzo: Día festivo<br><br>" +
                "<strong>ABRIL:</strong><br>" +
                "• 3 de abril: Feriado<br><br>" +
                "<strong>MAYO:</strong><br>" +
                "• 25 de mayo: Feriado<br><br>" +
                "¡Estos son los días donde no hay clases! ¿Necesitas más información? 😊";
        }

        // Receso académico
        if (lowerQ.includes('receso') || lowerQ.includes('descanso') || lowerQ.includes('vacaciones')) {
            return "🌴 <strong>Recesos Académicos 2025-2026:</strong><br><br>" +
                "<strong>ABRIL:</strong><br>" +
                "• 2 de abril: Receso académico (personal docente y no docente)<br>" +
                "• 3 de abril: Feriado<br><br>" +
                "<strong>MAYO:</strong><br>" +
                "• 22 de mayo: Receso académico (personal docente y no docente)<br><br>" +
                "¿Necesitas información sobre otros períodos o eventos escolares? 😊";
        }

        // Entrega de informes de progreso
        if (lowerQ.includes('informe') || lowerQ.includes('reporte') || lowerQ.includes('progreso') || lowerQ.includes('boleta') || lowerQ.includes('notas')) {
            return "📊 <strong>Entrega de Informes de Progreso Académico:</strong><br><br>" +
                "• <strong>27 de marzo:</strong> Entrega del informe de progreso académico en la escuela<br>" +
                "• <strong>29 de mayo:</strong> Entrega del informe de progreso académico en la escuela<br><br>" +
                "Estos informes muestran el progreso académico de los estudiantes. ¿Tienes alguna pregunta sobre cómo acceder a ellos o sobre el sistema de evaluación? 😊";
        }

        // Semana de la Educación
        if (lowerQ.includes('semana de la educación') || lowerQ.includes('semana educativa') || lowerQ.includes('educación')) {
            return "🎓 <strong>Semana de la Educación:</strong><br><br>" +
                "• <strong>Del 18 al 22 de mayo:</strong> Semana de la Educación<br>" +
                "• <strong>22 de mayo:</strong> Receso académico (docente y no docente)<br><br>" +
                "Es una semana especial dedicada a actividades educativas y celebraciones. ¿Te gustaría saber más sobre las actividades planificadas? 😊";
        }

        // Evaluaciones finales
        if (lowerQ.includes('evaluación final') || lowerQ.includes('evaluaciones finales') || lowerQ.includes('examen final') || lowerQ.includes('finales')) {
            return "📚 <strong>Evaluaciones Finales 2025-2026:</strong><br><br>" +
                "• <strong>26 y 27 de mayo:</strong> Evaluaciones finales<br><br>" +
                "Las evaluaciones finales son exámenes que se realizan al final del año académico para evaluar el aprendizaje. ¿Necesitas información sobre el contenido o cómo prepararte? 😊";
        }

        // Preguntas específicas por mes
        if (lowerQ.includes('febrero') && (lowerQ.includes('qué hay') || lowerQ.includes('que hay') || lowerQ.includes('evento') || lowerQ.includes('actividad'))) {
            return "📅 <strong>Eventos de Febrero 2026:</strong><br><br>" +
                "• 13 de febrero: Reuniones profesionales de facultad y equipo (tarde)<br>" +
                "• 16 de febrero: Día festivo<br>" +
                "• 19 de febrero: Assessment<br><br>" +
                "¿Necesitas más información sobre alguno de estos eventos? 😊";
        }

        if (lowerQ.includes('marzo') && (lowerQ.includes('qué hay') || lowerQ.includes('que hay') || lowerQ.includes('evento') || lowerQ.includes('actividad'))) {
            return "📅 <strong>Eventos de Marzo 2026:</strong><br><br>" +
                "• 2 de marzo: Día festivo<br>" +
                "• 16 de marzo: Assessment<br>" +
                "• 20 de marzo: Reuniones profesionales (tarde)<br>" +
                "• 23 de marzo: Día festivo<br>" +
                "• 27 de marzo: Entrega del informe de progreso académico<br><br>" +
                "¿Necesitas más información sobre alguno de estos eventos? 😊";
        }

        if (lowerQ.includes('abril') && (lowerQ.includes('qué hay') || lowerQ.includes('que hay') || lowerQ.includes('evento') || lowerQ.includes('actividad'))) {
            return "📅 <strong>Eventos de Abril 2026:</strong><br><br>" +
                "• 2 de abril: Receso académico<br>" +
                "• 3 de abril: Feriado<br>" +
                "• Del 13 de abril al 7 de mayo: Assessment<br><br>" +
                "¿Necesitas más información sobre alguno de estos eventos? 😊";
        }

        if (lowerQ.includes('mayo') && (lowerQ.includes('qué hay') || lowerQ.includes('que hay') || lowerQ.includes('evento') || lowerQ.includes('actividad'))) {
            return "📅 <strong>Eventos de Mayo 2026:</strong><br><br>" +
                "• Del 13 de abril al 7 de mayo: Assessment (continúa)<br>" +
                "• Del 18 al 22 de mayo: Semana de la Educación<br>" +
                "• 22 de mayo: Receso académico<br>" +
                "• 25 de mayo: Feriado<br>" +
                "• 26 y 27 de mayo: Evaluaciones finales<br>" +
                "• 29 de mayo: Entrega del informe de progreso académico<br><br>" +
                "¿Necesitas más información sobre alguno de estos eventos? 😊";
        }

        // ============================================
        // RESPUESTA POR DEFECTO MEJORADA - Improved Default Response
        // ============================================
        
        // Si no entendemos la pregunta, dar una respuesta amigable y opciones
        // Respuesta por defecto personalizada solicitada: respuesta breve y humilde
        return "Lo siento to tengo una contestacion a eso, todavia soy una ia en desarrollo.";
    }

    /**
     * Agrega una nueva noticia/promoción.
     */
    addNews(newsData) {
        const id = this.generateId('NEWS');
        const newNews = {
            id: id,
            ...newsData,
            date: new Date().toISOString(),
            active: true
        };

        if (!this.data.news) this.data.news = [];
        this.data.news.push(newNews);
        this.saveData();
        return newNews;
    }

    /**
     * Elimina una noticia por ID.
     */
    deleteNews(id) {
        if (!this.data.news) return false;
        this.data.news = this.data.news.filter(n => n.id !== id);
        this.saveData();
        return true;
    }

    /**
     * Obtiene la última noticia activa.
     */
    getLatestNews() {
        if (!this.data.news || this.data.news.length === 0) return null;
        // Sort by date desc
        const sorted = [...this.data.news].sort((a, b) => new Date(b.date) - new Date(a.date));
        return sorted[0];
    }

    /**
     * Obtiene todas las noticias.
     */
    getAllNews() {
        return this.data.news || [];
    }

    /**
     * Simula el envío de notificaciones (Email/WhatsApp).
     */
    simulateNotification(request, event) {
        console.log(`🔔 NOTIFICATION [${event}]:`, request);

        let message = '';
        if (event === 'created') {
            message = `Su solicitud ${request.id} ha sido recibida. Le notificaremos cuando esté lista.`;
        } else if (event === 'updated') {
            message = `Actualización de solicitud ${request.id}: Su estado ahora es ${request.status.toUpperCase()}.`;
        }

        // En un entorno real, aquí se llamaría a una API de envío.
        // Aquí solo mostramos un log o podríamos usar Notification API del navegador si fuera necesario.
        // alert(`Simulación de envio de correo a ${request.email}:\n\n${message}`);
    }

    /**
     * Add a new support ticket
     */
    addTicket(ticket) {
        if (!this.data.tickets_soporte) {
            this.data.tickets_soporte = [];
        }
        this.data.tickets_soporte.push(ticket);
        this.saveData();
        return ticket;
    }

    /**
     * Get all support tickets
     */
    getAllTickets() {
        if (!this.data.tickets_soporte) {
            this.data.tickets_soporte = [];
        }
        return this.data.tickets_soporte;
    }

    /**
     * Update a ticket
     */
    updateTicket(updatedTicket) {
        const index = this.data.tickets_soporte.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
            this.data.tickets_soporte[index] = updatedTicket;
            this.saveData();
        }
        return updatedTicket;
    }

    /**
     * Resolve a ticket
     */
    resolveTicket(ticketId, techName) {
        const ticket = this.data.tickets_soporte.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = 'resuelto';
            ticket.resolvedBy = techName;
            ticket.resolvedDate = new Date().toISOString();
            this.saveData();
        }
        return ticket;
    }

    /**
     * Save technician score
     */
    saveTechScore(techName, score) {
        if (!this.data.techScores) {
            this.data.techScores = {};
        }
        this.data.techScores[techName] = score;
        this.saveData();
    }

    /**
     * Get technician score
     */
    getTechScore(techName) {
        if (!this.data.techScores) {
            this.data.techScores = {};
        }
        return this.data.techScores[techName] || 0;
    }

    /**
     * Muestra el popup de novedades en la esquina inferior derecha
     */
    showNewsPopup() {
        const latestNews = this.getLatestNews();
        if (!latestNews) return; // No hay noticias para mostrar

        // Crear el contenedor del popup si no existe
        let newsPopup = document.getElementById('news-popup');
        if (!newsPopup) {
            newsPopup = document.createElement('div');
            newsPopup.id = 'news-popup';
            document.body.appendChild(newsPopup);

            // Agregar estilos inline si no existen
            if (!document.getElementById('news-popup-styles')) {
                const style = document.createElement('style');
                style.id = 'news-popup-styles';
                style.textContent = `
                    #news-popup {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        width: 350px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                        border-left: 4px solid #e67e22;
                        z-index: 9998;
                        animation: slideInRight 0.5s ease-out;
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    }

                    @keyframes slideInRight {
                        from {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    #news-popup.closing {
                        animation: slideOutRight 0.5s ease-out forwards;
                    }

                    @keyframes slideOutRight {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                    }

                    #news-popup-header {
                        padding: 16px;
                        background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
                        color: white;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    #news-popup-title {
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                    }

                    #news-popup-close {
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 20px;
                        padding: 0;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: transform 0.2s ease;
                    }

                    #news-popup-close:hover {
                        transform: scale(1.2);
                    }

                    #news-popup-content {
                        padding: 16px;
                    }

                    #news-popup-image {
                        width: 100%;
                        height: 200px;
                        object-fit: cover;
                        border-radius: 4px;
                        margin-bottom: 12px;
                        display: none;
                    }

                    #news-popup-image.visible {
                        display: block;
                    }

                    #news-popup-message {
                        margin: 0 0 16px 0;
                        font-size: 14px;
                        color: #555;
                        line-height: 1.5;
                    }

                    #news-popup-button {
                        width: 100%;
                        padding: 10px 16px;
                        background: #e67e22;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 14px;
                        transition: background 0.3s ease;
                    }

                    #news-popup-button:hover {
                        background: #d35400;
                    }

                    /* Dark mode support */
                    body.dark-mode #news-popup {
                        background: #1f2937;
                        color: #e5e7eb;
                    }

                    body.dark-mode #news-popup-message {
                        color: #d1d5db;
                    }

                    @media (max-width: 480px) {
                        #news-popup {
                            width: calc(100% - 40px);
                            bottom: 10px;
                            right: 20px;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Limpiar el contenido anterior
        newsPopup.innerHTML = '';

        // Crear estructura del popup
        const header = document.createElement('div');
        header.id = 'news-popup-header';
        
        const title = document.createElement('h3');
        title.id = 'news-popup-title';
        title.textContent = latestNews.title || 'Noticia Nueva';
        
        const closeBtn = document.createElement('button');
        closeBtn.id = 'news-popup-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            newsPopup.classList.add('closing');
            setTimeout(() => {
                newsPopup.style.display = 'none';
            }, 500);
        };

        header.appendChild(title);
        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.id = 'news-popup-content';

        // Agregar imagen si existe
        if (latestNews.imageUrl) {
            const img = document.createElement('img');
            img.id = 'news-popup-image';
            img.src = latestNews.imageUrl;
            img.alt = latestNews.title;
            img.classList.add('visible');
            img.onerror = function() {
                this.style.display = 'none';
            };
            content.appendChild(img);
        }

        // Agregar mensaje
        const message = document.createElement('p');
        message.id = 'news-popup-message';
        message.textContent = latestNews.message || 'Tenemos una novedad importante para ti.';
        content.appendChild(message);

        // Agregar botón de acción
        const button = document.createElement('button');
        button.id = 'news-popup-button';
        button.textContent = 'Ver Promociones';
        button.onclick = () => {
            window.location.href = 'promociones.html';
        };
        content.appendChild(button);

        // Armar el popup
        newsPopup.appendChild(header);
        newsPopup.appendChild(content);
        newsPopup.style.display = 'block';
        newsPopup.classList.remove('closing');

        // Auto-cerrar después de 10 segundos (solo visual, el usuario puede cerrarlo manualmente)
        setTimeout(() => {
            if (newsPopup && newsPopup.parentNode) {
                newsPopup.classList.add('closing');
                setTimeout(() => {
                    if (newsPopup) newsPopup.style.display = 'none';
                }, 500);
            }
        }, 10000);
    }
}

// Exportar instancia global
window.serviceManager = new ServiceManager();
