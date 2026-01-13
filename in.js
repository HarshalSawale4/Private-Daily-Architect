
        // --- CONFIG & STATE ---
        const MASTER_PASS = "1234"; // Your Private Pin
        let currentView = 'today';
        let tasks = JSON.parse(localStorage.getItem('flow_tasks_2026')) || [];

        // --- AUTH LOGIC ---
        function unlockApp() {
            const input = document.getElementById('pass-input');
            if (input.value === MASTER_PASS) {
                document.body.classList.add('app-unlocked');
                sessionStorage.setItem('session_active', 'true');
            } else {
                input.style.borderColor = '#ff4444';
                input.value = '';
                alert("Incorrect Pin");
            }
        }

        // Auto-unlock if session active
        if (sessionStorage.getItem('session_active') === 'true') {
            document.body.classList.add('app-unlocked');
        }

        // --- DATE LOGIC ---
        function getISO(offset = 0) {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            return d.toISOString().split('T')[0];
        }

        function switchView(view) {
            currentView = view;
            document.getElementById('tab-today').classList.toggle('active', view === 'today');
            document.getElementById('tab-tomorrow').classList.toggle('active', view === 'tomorrow');
            document.getElementById('view-title').innerText = view === 'today' ? "Today's Focus" : "Tomorrow's Plan";
            render();
        }

        // --- CORE FUNCTIONALITY ---
        function addTask() {
            const input = document.getElementById('task-input');
            if (!input.value.trim()) return;

            const targetDate = currentView === 'today' ? getISO(0) : getISO(1);
            const newTask = {
                id: Date.now(),
                text: input.value,
                completed: false,
                date: targetDate
            };

            tasks.unshift(newTask);
            input.value = '';
            saveAndRender();
        }

        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) task.completed = !task.completed;
            saveAndRender();
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            saveAndRender();
        }

        function saveAndRender() {
            localStorage.setItem('flow_tasks_2026', JSON.stringify(tasks));
            render();
        }

        function render() {
            const list = document.getElementById('task-list');
            list.innerHTML = '';
            
            const targetDate = currentView === 'today' ? getISO(0) : getISO(1);
            const filtered = tasks.filter(t => t.date === targetDate);

            filtered.forEach(task => {
                const item = document.createElement('div');
                item.className = `task-item ${task.completed ? 'completed' : ''}`;
                item.innerHTML = `
                    <div class="checkbox" onclick="toggleTask(${task.id})">${task.completed ? '✓' : ''}</div>
                    <div class="task-text">${task.text}</div>
                    <button class="del-btn" onclick="deleteTask(${task.id})">✕</button>
                `;
                list.appendChild(item);
            });

            // Update Progress
            const done = filtered.filter(t => t.completed).length;
            const pct = filtered.length ? Math.round((done / filtered.length) * 100) : 0;
            document.getElementById('progress-fill').style.width = pct + '%';
            document.getElementById('progress-text').innerText = pct + '%';
        }

        // Listen for Enter Key
        document.getElementById('task-input').addEventListener('keypress', e => { if(e.key === 'Enter') addTask() });
        document.getElementById('pass-input').addEventListener('keypress', e => { if(e.key === 'Enter') unlockApp() });

        // Initial Run
        render();
        document.getElementById('header-date-label').innerText = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
   