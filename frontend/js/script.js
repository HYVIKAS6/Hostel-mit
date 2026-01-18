// --- Data Management ---
// To persist data across page loads without a backend, we use localStorage.

let students, rooms, complaints, fees, currentLoggedInUser, isAdminLoggedIn;

function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('rooms', JSON.stringify(rooms));
    localStorage.setItem('complaints', JSON.stringify(complaints));
    localStorage.setItem('fees', JSON.stringify(fees));
}

function loadData() {
    const studentsData = localStorage.getItem('students');
    const roomsData = localStorage.getItem('rooms');
    const complaintsData = localStorage.getItem('complaints');
    const feesData = localStorage.getItem('fees');
    const loggedInUserData = localStorage.getItem('currentLoggedInUser');
    const adminLoggedInData = localStorage.getItem('isAdminLoggedIn');

    if (studentsData) {
        students = JSON.parse(studentsData);
    } else {
        // Default mock data if nothing is in localStorage
        students = [
            { id: 12344, name: "Emily White", room: "101" },
            { id: 12342, name: "Michael Brown", room: "101" },
            { id: 12340, name: "Sarah Green", room: "102" },
        ];
    }

    if (roomsData) {
        rooms = JSON.parse(roomsData);
    } else {
        rooms = [
            { id: "101", capacity: 3, current: 2 },
            { id: "102", capacity: 3, current: 1 },
            { id: "205", capacity: 4, current: 1 },
        ];
    }
    
    if (complaintsData) {
        complaints = JSON.parse(complaintsData);
    } else {
        complaints = [
            { id: 1, date: "2026-08-10", studentName: "Jane Smith", room: "205", issue: "Leaky faucet in the bathroom.", status: "Pending" },
            { id: 2, date: "2026-08-09", studentName: "Peter Jones", room: "301", issue: "Wi-Fi not working on the 3rd floor.", status: "Resolved" },
            { id: 3, date: "2026-08-08", studentName: "Jane Smith", room: "205", issue: "Loud music from the adjacent room after 11 PM.", status: "Resolved" },
        ];
    }

    if (feesData) {
        fees = JSON.parse(feesData);
    } else {
        fees = [
            { studentId: 12344, amount: 15000, status: "Paid" },
            { studentId: 12342, amount: 15000, status: "Paid" },
            { studentId: 12340, amount: 15000, status: "Unpaid" },
        ];
    }

    if (loggedInUserData) {
        currentLoggedInUser = JSON.parse(loggedInUserData);
    } else {
        currentLoggedInUser = null;
    }

    isAdminLoggedIn = adminLoggedInData === 'true'; // localStorage stores strings
}


// --- Global Functions ---
document.addEventListener('DOMContentLoaded', () => {
    loadData(); // Load data from localStorage or use defaults

    const path = window.location.pathname.split("/").pop();
    const logoutButtons = document.querySelectorAll('.btn-logout');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    });

    if (path === 'admin_dashboard.html') {
        if (!isAdminLoggedIn) {
            window.location.href = 'admin_login.html';
            return;
        }
        setupAdminDashboard();
    } else if (path === 'complaint_management.html') {
        if (!isAdminLoggedIn && !currentLoggedInUser) { // Both admin and student can view complaints
            window.location.href = 'index.html'; // Redirect to main login if neither is logged in
            return;
        }
        renderComplaints();
        setupComplaintForm();
    } else if (path === 'student_management.html') {
        if (!isAdminLoggedIn) {
            window.location.href = 'admin_login.html';
            return;
        }
        renderStudents();
        setupStudentForm();
    } else if (path === 'room_allocation.html') {
        if (!isAdminLoggedIn) {
            window.location.href = 'admin_login.html';
            return;
        }
        setupRoomAllocationPage();
    } else if (path === 'student_dashboard.html') {
        if (!currentLoggedInUser) {
            window.location.href = 'student_login.html';
            return;
        }
        setupStudentDashboard();
    } else if (path === 'admin_login.html') {
        setupAdminLoginPage();
    } else if (path === 'student_login.html') {
        setupStudentLoginPage();
    } else if (path === 'student_register.html') {
        setupStudentRegisterPage();
    } else if (path === 'my_profile.html') {
        setupMyProfilePage();
    } else if (path === 'payment.html') {
        setupPaymentPage();
    }
});

function setupMyProfilePage() {
    if (!currentLoggedInUser) {
        window.location.href = 'student_login.html';
        return;
    }

    // Assuming currentLoggedInUser has the necessary details.
    // You may need to fetch more details from a 'students' array if not.
    const student = students.find(s => s.id === currentLoggedInUser.id);

    if (student) {
        document.getElementById('student-name').textContent = student.name;
        document.getElementById('student-email').textContent = student.username; // Assuming username is email
        document.getElementById('student-id').textContent = student.id;
        document.getElementById('student-phone').textContent = student.contact || 'Not Provided';
        
        if (student.room) {
            const room = rooms.find(r => r.id === student.room);
            document.getElementById('room-number').textContent = room ? `Room ${room.id}` : 'N/A';
        } else {
            document.getElementById('room-number').textContent = 'Not Allocated';
        }
    }
}

function setupPaymentPage() {
    if (!currentLoggedInUser) {
        window.location.href = 'student_login.html';
        return;
    }

    const fee = fees.find(f => f.studentId === currentLoggedInUser.id);
    const payNowBtn = document.getElementById('pay-now-btn');

    if (fee) {
        document.getElementById('fee-amount').textContent = fee.amount;
        const paymentStatusEl = document.getElementById('payment-status');
        paymentStatusEl.textContent = fee.status;

        if (fee.status === 'Unpaid') {
            payNowBtn.textContent = 'Pay Now';
            payNowBtn.disabled = false;
            payNowBtn.addEventListener('click', () => {
                fee.status = 'Paid';
                saveData();
                paymentStatusEl.textContent = 'Paid';
                payNowBtn.textContent = 'Paid';
                payNowBtn.disabled = true;
                alert('Payment successful!');
            });
        } else {
            payNowBtn.textContent = 'Paid';
            payNowBtn.disabled = true;
        }
    } else {
        document.getElementById('fee-amount').textContent = 'N/A';
        document.getElementById('payment-status').textContent = 'N/A';
        payNowBtn.style.display = 'none';
    }
}



// --- Complaint Management Functions ---

function renderComplaints() {
    const complaintTableBody = document.querySelector('.data-table tbody');
    if (!complaintTableBody || !window.location.pathname.includes('complaint_management.html')) return;

    complaintTableBody.innerHTML = ''; 
    complaints.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.date}</td>
            <td>${c.studentName}</td>
            <td>${c.room}</td>
            <td>${c.issue}</td>
            <td><span class="status status-${c.status.toLowerCase()}">${c.status}</span></td>
            <td>
                ${c.status === 'Pending' ? `<a href="#" class="resolve-btn" data-id="${c.id}">Mark as Resolved</a>` : 'No Action'}
            </td>
        `;
        complaintTableBody.appendChild(row);
    });

    document.querySelectorAll('.resolve-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isAdminLoggedIn) {
                alert('Only administrators can resolve complaints.');
                return;
            }
            const complaintId = parseInt(e.target.dataset.id);
            resolveComplaint(complaintId);
        });
    });
}

function resolveComplaint(id) {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = 'Resolved';
        saveData();
        renderComplaints(); 
    }
}

function setupComplaintForm() {
    const complaintForm = document.querySelector('.form-container form');
    if(!complaintForm || !window.location.pathname.includes('complaint_management.html')) return;

    complaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const issue = document.getElementById('description').value;
        const type = document.getElementById('complaint-type').value;

        if (!issue || !type) {
            alert('Please fill out all fields.');
            return;
        }

        const newComplaint = {
            id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
            date: new Date().toISOString().split('T')[0],
            studentName: currentLoggedInUser ? currentLoggedInUser.name : 'Guest',
            room: currentLoggedInUser && currentLoggedInUser.room ? currentLoggedInUser.room : 'N/A',
            issue: `(${type}) ${issue}`,
            status: 'Pending'
        };

        complaints.push(newComplaint);
        saveData();
        renderComplaints();
        complaintForm.reset();
        alert('Complaint submitted successfully!');
    });
}

// --- Student Management Functions ---

function renderStudents() {
    const studentTableBody = document.querySelector('.data-table tbody');
    if (!studentTableBody || !window.location.pathname.includes('student_management.html')) return;

    studentTableBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.room || 'Not Assigned'}</td>
            <td>
                <a href="#" class="edit-btn" data-id="${student.id}">Edit</a> |
                <a href="#" class="delete-btn" data-id="${student.id}">Delete</a>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
    
    const totalStudentsSpan = document.getElementById('total-students');
    const unassignedStudentsSpan = document.getElementById('unassigned-students');
    if(totalStudentsSpan) totalStudentsSpan.textContent = students.length;
    if(unassignedStudentsSpan) unassignedStudentsSpan.textContent = students.filter(s => !s.room).length;

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const studentId = parseInt(e.target.getAttribute('data-id'));
            deleteStudent(studentId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const studentId = parseInt(e.target.getAttribute('data-id'));
            editStudent(studentId);
        });
    });
}

function setupStudentForm() {
    const studentForm = document.getElementById('add-student-form');
    if (!studentForm) return;

    studentForm.addEventListener('submit', e => {
        e.preventDefault();
        const studentName = document.getElementById('student-name').value;
        const studentId = parseInt(document.getElementById('student-id').value);

        if (!studentName || !studentId) {
            alert('Please provide all student details.');
            return;
        }

        if (students.some(s => s.id === studentId)) {
            alert('A student with this ID already exists.');
            return;
        }

        const newStudent = {
            id: studentId,
            name: studentName,
            room: null 
        };

        students.push(newStudent);
        saveData();
        renderStudents();
        studentForm.reset();
        alert('Student added successfully!');
    });
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) {
        alert('Student not found!');
        return;
    }

    const newName = prompt(`Enter new name for ${student.name} (ID: ${student.id}):`, student.name);

    if (newName && newName.trim() !== '') {
        student.name = newName.trim();
        saveData();
        renderStudents();
        alert('Student name updated successfully!');
    } else {
        alert('Update cancelled or invalid name provided.');
    }
}

function deleteStudent(id) {
    // Also deallocate the student from any room
    const student = students.find(s => s.id === id);
    if (student && student.room) {
        const room = rooms.find(r => r.id === student.room);
        if (room) {
            room.current--;
        }
    }
    students = students.filter(s => s.id !== id);
    saveData();
    renderStudents();
}


// --- Admin Dashboard Functions ---

function setupAdminDashboard() {
    const addRoomBtn = document.getElementById('add-room-btn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', e => {
            e.preventDefault();
            addRoom();
        });
    }

    const generateReportBtn = document.getElementById('generate-report-btn');
    if(generateReportBtn) {
        generateReportBtn.addEventListener('click', e => {
            e.preventDefault();
            generateReport();
        });
    }
}

function addRoom() {
    const roomId = prompt("Enter new room number (e.g., 103):");
    if (!roomId) return;

    if (rooms.some(r => r.id === roomId)) {
        alert('A room with this number already exists.');
        return;
    }

    const capacity = parseInt(prompt("Enter room capacity (e.g., 3):"));
    if (!capacity || isNaN(capacity)) {
        alert('Invalid capacity.');
        return;
    }

    const newRoom = {
        id: roomId,
        capacity: capacity,
        current: 0
    };

    rooms.push(newRoom);
    saveData();
    alert(`Room ${roomId} with capacity ${capacity} added successfully!`);
}

function generateReport() {
    const totalStudents = students.length;
    const totalRooms = rooms.length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
    const allocatedStudents = students.filter(s => s.room).length;

    const report = `
        --- HOSTEL STATUS REPORT ---
        
        Total Students: ${totalStudents}
        - Allocated: ${allocatedStudents}
        - Unallocated: ${totalStudents - allocatedStudents}

        Total Rooms: ${totalRooms}
        - Occupancy: ${rooms.map(r => `Room ${r.id}: ${r.current}/${r.capacity}`).join(', ')}

        Pending Complaints: ${pendingComplaints}
    `;

    alert(report);
}

// --- Room Allocation Functions ---

function setupRoomAllocationPage() {
    if (!isAdminLoggedIn) {
        window.location.href = 'admin_login.html';
        return;
    }
    renderAllocationForm();
    renderAllocationTable();

    const allocationForm = document.querySelector('.form-container form');
    if (allocationForm) {
        allocationForm.addEventListener('submit', handleAllocationSubmit);
    }
}

function renderAllocationForm() {
    const studentSelect = document.getElementById('student');
    const roomSelect = document.getElementById('room');

    if (!studentSelect || !roomSelect) return;

    // Populate students who are not yet assigned a room
    studentSelect.innerHTML = '<option value="">-- Choose a student --</option>';
    const unassignedStudents = students.filter(s => !s.room);
    unassignedStudents.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = `${s.name} (ID: ${s.id})`;
        studentSelect.appendChild(option);
    });

    // Populate rooms that have available capacity
    roomSelect.innerHTML = '<option value="">-- Choose an available room --</option>';
    const availableRooms = rooms.filter(r => r.current < r.capacity);
    availableRooms.forEach(r => {
        const option = document.createElement('option');
        option.value = r.id;
        option.textContent = `Room ${r.id} (Capacity: ${r.current}/${r.capacity})`;
        roomSelect.appendChild(option);
    });
}

function renderAllocationTable() {
    const allocationTableBody = document.querySelector('.data-table tbody');
    if (!allocationTableBody) return;

    allocationTableBody.innerHTML = '';
    const allocatedStudents = students.filter(s => s.room);
    
    allocatedStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.id}</td>
            <td>${student.room}</td>
            <td>${new Date().toLocaleDateString()}</td> <!-- Placeholder Date -->
            <td><a href="#" class="deallocate-btn" data-id="${student.id}">Deallocate</a></td>
        `;
        allocationTableBody.appendChild(row);
    });

    document.querySelectorAll('.deallocate-btn').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            const studentId = parseInt(e.target.getAttribute('data-id'));
            deallocateStudent(studentId);
        });
    });
}

function handleAllocationSubmit(e) {
    e.preventDefault();
    const studentId = parseInt(document.getElementById('student').value);
    const roomId = document.getElementById('room').value;

    if (!studentId || !roomId) {
        alert('Please select both a student and a room.');
        return;
    }

    const student = students.find(s => s.id === studentId);
    const room = rooms.find(r => r.id === roomId);

    if (student && room) {
        student.room = roomId;
        room.current++;
        saveData();
        setupRoomAllocationPage(); // Re-render the whole page
        alert(`Successfully allocated ${student.name} to Room ${room.id}.`);
    } else {
        alert('Allocation failed. Student or room not found.');
    }
}

function deallocateStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.room) return;

    const room = rooms.find(r => r.id === student.room);
    if (room) {
        room.current--;
    }

    student.room = null;
    saveData();
    setupRoomAllocationPage(); // Re-render the page
    alert(`${student.name} has been deallocated.`);
}

// --- Authentication Functions ---

function setupAdminLoginPage() {
    const adminLoginForm = document.getElementById('admin-login-form');
    if (!adminLoginForm) return;

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;

        // Simple mock authentication for admin
        if (username === 'admin' && password === 'admin123') {
            isAdminLoggedIn = true;
            localStorage.setItem('isAdminLoggedIn', 'true');
            currentLoggedInUser = { id: 'admin', name: 'Admin User' }; // Store a mock admin user
            saveData();
            window.location.href = 'admin_dashboard.html';
        } else {
            alert('Invalid admin credentials.');
        }
    });
}

function setupStudentLoginPage() {
    const studentLoginForm = document.getElementById('student-login-form');
    if (!studentLoginForm) return;

    studentLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('student-username').value;
        const password = document.getElementById('student-password').value;

        const student = students.find(s => s.username === username && s.password === password);

        if (student) {
            currentLoggedInUser = student;
            localStorage.setItem('currentLoggedInUser', JSON.stringify(student));
            isAdminLoggedIn = false;
            localStorage.setItem('isAdminLoggedIn', 'false');
            saveData();
            window.location.href = 'student_dashboard.html';
        } else {
            alert('Invalid student credentials.');
        }
    });
}

function setupStudentRegisterPage() {
    const studentRegisterForm = document.getElementById('student-register-form');
    if (!studentRegisterForm) return;

    studentRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const contact = document.getElementById('register-contact').value;

        if (!name || !username || !password || !contact) {
            alert('Please fill in all fields.');
            return;
        }

        if (students.some(s => s.username === username)) {
            alert('Username already exists. Please choose a different one.');
            return;
        }

        const newStudent = {
            id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
            name,
            username,
            password,
            contact,
            room: null
        };

        students.push(newStudent);
        saveData();
        alert('Registration successful! You can now log in.');
        window.location.href = 'student_login.html';
    });
}

function logoutUser() {
    currentLoggedInUser = null;
    isAdminLoggedIn = false;
    localStorage.removeItem('currentLoggedInUser');
    localStorage.removeItem('isAdminLoggedIn');
    saveData();
    window.location.href = 'index.html';
}

// --- Student Dashboard Specific Functions ---
function setupStudentDashboard() {
    if (!currentLoggedInUser) {
        window.location.href = 'student_login.html';
        return;
    }

    const allocatedRoomDetails = document.getElementById('allocated-room-details');
    if (allocatedRoomDetails) {
        if (currentLoggedInUser.room) {
            const room = rooms.find(r => r.id === currentLoggedInUser.room);
            if (room) {
                allocatedRoomDetails.innerHTML = `You are allocated to Room ${room.id}. Capacity: ${room.current}/${room.capacity}.`;
            } else {
                allocatedRoomDetails.textContent = 'Your allocated room details could not be found.';
            }
        } else {
            allocatedRoomDetails.textContent = 'You are currently not allocated to any room.';
        }
    }
}
