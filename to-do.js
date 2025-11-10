// Get elements
        const taskInput = document.getElementById('taskInput');
        const addButton = document.getElementById('addButton');
        const taskList = document.getElementById('taskList');
        const totalTasksEl = document.getElementById('totalTasks');
        const activeTasksEl = document.getElementById('activeTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clearCompleted');

        // Tasks array
        let tasks = [];
        let currentFilter = 'all';

        // Load tasks from localStorage
        function loadTasks() {
            const savedTasks = localStorage.getItem('tasks');
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
            }
            renderTasks();
        }

        // Save tasks to localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Add task
        function addTask() {
            const taskText = taskInput.value.trim();
            
            if (taskText === '') {
                taskInput.focus();
                return;
            }

            const task = {
                id: Date.now(),
                text: taskText,
                completed: false
            };

            tasks.push(task);
            taskInput.value = '';
            saveTasks();
            renderTasks();
            taskInput.focus();
        }

        // Toggle task completion
        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            }
        }

        // Delete task
        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }

        // Clear completed tasks
        function clearCompleted() {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        }

        // Update statistics
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const active = total - completed;

            totalTasksEl.textContent = total;
            activeTasksEl.textContent = active;
            completedTasksEl.textContent = completed;

            clearCompletedBtn.disabled = completed === 0;
        }

        // Render tasks
        function renderTasks() {
            let filteredTasks = tasks;

            if (currentFilter === 'active') {
                filteredTasks = tasks.filter(t => !t.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(t => t.completed);
            }

            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <div class="empty-state-text">
                            ${currentFilter === 'completed' ? 'No completed tasks yet!' : 
                              currentFilter === 'active' ? 'No active tasks!' : 
                              'No tasks yet. Add one above!'}
                        </div>
                    </div>
                `;
            } else {
                taskList.innerHTML = filteredTasks.map(task => `
                    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                        <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
                        <span class="task-text">${escapeHtml(task.text)}</span>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                    </li>
                `).join('');
            }

            updateStats();
        }

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Event listeners
        addButton.addEventListener('click', addTask);

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTasks();
            });
        });

        clearCompletedBtn.addEventListener('click', clearCompleted);

        // Initial load
        loadTasks()