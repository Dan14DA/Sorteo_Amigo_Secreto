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
    
    // Habilitar el botón de sorteo si hay al menos 4 participantes
    drawNamesBtn.disabled = participants.length < 4;
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
    
    // Deshabilitar el botón de sorteo si hay menos de 4 participantes
    drawNamesBtn.disabled = participants.length < 4;
}

// Realizar el sorteo
function drawNames() {
    if (participants.length < 4) {
        alert('Se necesitan al menos 4 participantes para realizar el sorteo.');
        return;
    }
    
    // Intentar realizar un sorteo válido (máximo 100 intentos)
    let validAssignment = false;
    let attempts = 0;
    
    while (!validAssignment && attempts < 100) {
        attempts++;
        
        // Crear una copia barajada para los receptores
        const receivers = [...participants];
        for (let i = receivers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
        }
        
        // Crear asignaciones temporales
        const tempAssignments = [];
        let isValid = true;
        
        for (let i = 0; i < participants.length; i++) {
            // Si alguien se asigna a sí mismo, marcar como inválido
            if (participants[i].id === receivers[i].id) {
                isValid = false;
                break;
            }
            
            tempAssignments.push({
                giver: participants[i],
                receiver: receivers[i]
            });
        }
        
        // Si todas las asignaciones son válidas, guardarlas
        if (isValid) {
            validAssignment = true;
            assignments = tempAssignments;
        }
    }
    
    // Si no se pudo encontrar una asignación válida después de 100 intentos,
    // usar un algoritmo determinístico (cada persona regala a la siguiente en la lista)
    if (!validAssignment) {
        assignments = [];
        for (let i = 0; i < participants.length; i++) {
            const nextIndex = (i + 1) % participants.length;
            assignments.push({
                giver: participants[i],
                receiver: participants[nextIndex]
            });
        }
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

// Añadir una nota informativa sobre el mínimo de participantes
document.addEventListener('DOMContentLoaded', function() {
    // Crear elemento para mostrar la nota
    const noteDiv = document.createElement('div');
    noteDiv.className = 'info-note';
    noteDiv.innerHTML = '<p><strong>Nota:</strong> Se requieren al menos 4 participantes para garantizar un sorteo, donde nadie se regale a sí mismo.</p>';
    
    // Insertar la nota después del título
    const title = document.querySelector('h1') || document.querySelector('header');
    if (title && title.parentNode) {
        title.parentNode.insertBefore(noteDiv, title.nextSibling);
    } else {
        // Si no hay título, insertar al principio del body
        document.body.insertBefore(noteDiv, document.body.firstChild);
    }
});
