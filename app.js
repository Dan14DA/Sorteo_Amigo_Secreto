// Variables globales
let participants = [];
let assignments = [];

// Elementos DOM
const participantNameInput = document.getElementById('participantName');
const participantEmailInput = document.getElementById('participantEmail');
const addParticipantBtn = document.getElementById('addParticipant');
const participantsContainer = document.getElementById('participantsContainer');
const drawNamesBtn = document.getElementById('drawNames');
const setupPhaseDiv = document.getElementById('setupPhase');
const resultPhaseDiv = document.getElementById('resultPhase');
const showAssignmentsBtn = document.getElementById('showAssignments');
const assignmentsDiv = document.getElementById('assignments');
const resetBtn = document.getElementById('resetBtn');

// Eventos
addParticipantBtn.addEventListener('click', addParticipant);
drawNamesBtn.addEventListener('click', drawNames);
showAssignmentsBtn.addEventListener('click', toggleAssignments);
resetBtn.addEventListener('click', resetApp);

// Añadir un participante
function addParticipant() {
    const name = participantNameInput.value.trim();
    const contact = participantEmailInput.value.trim();
    
    if (name === '') {
        alert('Por favor, introduce un nombre.');
        return;
    }
    
    // Verificar que no exista un participante con el mismo nombre
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Ya existe un participante con ese nombre.');
        return;
    }
    
    const participant = {
        id: Date.now(),
        name: name,
        contact: contact
    };
    
    participants.push(participant);
    renderParticipantsList();
    
    // Limpiar campos
    participantNameInput.value = '';
    participantEmailInput.value = '';
    
    // Habilitar el botón de sorteo si hay al menos 3 participantes
    drawNamesBtn.disabled = participants.length < 3;
}

// Renderizar la lista de participantes
function renderParticipantsList() {
    participantsContainer.innerHTML = '';
    
    participants.forEach(participant => {
        const div = document.createElement('div');
        div.className = 'participant';
        
        div.innerHTML = `
            <span>${participant.name}${participant.contact ? ` (${participant.contact})` : ''}</span>
            <button data-id="${participant.id}">Eliminar</button>
        `;
        
        const deleteBtn = div.querySelector('button');
        deleteBtn.addEventListener('click', () => removeParticipant(participant.id));
        
        participantsContainer.appendChild(div);
    });
}

// Eliminar un participante
function removeParticipant(id) {
    participants = participants.filter(p => p.id !== id);
    renderParticipantsList();
    
    // Deshabilitar el botón de sorteo si hay menos de 3 participantes
    drawNamesBtn.disabled = participants.length < 3;
}

// Realizar el sorteo
function drawNames() {
    if (participants.length < 3) {
        alert('Se necesitan al menos 3 participantes para realizar el sorteo.');
        return;
    }
    
    // Algoritmo de Fisher-Yates para mezclar el array
    const shuffled = [...participants];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Asignar amigos secretos
    assignments = [];
    for (let i = 0; i < participants.length; i++) {
        const giver = participants[i];
        const receiver = (i === participants.length - 1) ? shuffled[0] : shuffled[i + 1];
        
        // Evitar que una persona se seleccione a sí misma
        if (giver.id === receiver.id) {
            // Si ocurre, intercambiar con el siguiente
            const nextIdx = (i + 1) % participants.length;
            [shuffled[i + 1], shuffled[nextIdx]] = [shuffled[nextIdx], shuffled[i + 1]];
        }
        
        assignments.push({
            giver: giver,
            receiver: (i === participants.length - 1) ? shuffled[0] : shuffled[i + 1]
        });
    }
    
    // Mostrar resultados
    setupPhaseDiv.style.display = 'none';
    resultPhaseDiv.style.display = 'block';
}

// Mostrar/ocultar asignaciones
function toggleAssignments() {
    if (assignmentsDiv.style.display === 'none') {
        assignmentsDiv.style.display = 'block';
        showAssignmentsBtn.textContent = 'Ocultar Asignaciones';
        
        // Renderizar asignaciones
        assignmentsDiv.innerHTML = '';
        assignments.forEach(assignment => {
            const div = document.createElement('div');
            div.className = 'assignment';
            div.innerHTML = `
                <strong>${assignment.giver.name}</strong> le dará un regalo a 
                <strong>${assignment.receiver.name}</strong> 🎁
            `;
            assignmentsDiv.appendChild(div);
        });
    } else {
        assignmentsDiv.style.display = 'none';
        showAssignmentsBtn.textContent = 'Mostrar Asignaciones';
    }
}

// Reiniciar la aplicación
function resetApp() {
    participants = [];
    assignments = [];
    renderParticipantsList();
    
    // Restaurar la interfaz
    setupPhaseDiv.style.display = 'block';
    resultPhaseDiv.style.display = 'none';
    assignmentsDiv.style.display = 'none';
    showAssignmentsBtn.textContent = 'Mostrar Asignaciones';
    
    // Deshabilitar el botón de sorteo
    drawNamesBtn.disabled = true;
}
