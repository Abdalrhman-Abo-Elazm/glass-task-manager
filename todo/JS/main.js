// Main class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentCard = 'add-task';
        this.currentCategory = 'all';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showCard('add-task');
        this.renderTasks();
        this.updateAchievements();
        this.updateScore();
        this.applyTheme();
    }

    setupEventListeners() {
        // Navigation cards
        document.getElementById('navAddTask').addEventListener('click', () => this.showCard('add-task'));
        document.getElementById('navTasks').addEventListener('click', () => this.showCard('tasks'));
        document.getElementById('navAchievements').addEventListener('click', () => this.showCard('achievements'));
        document.getElementById('navScore').addEventListener('click', () => this.showCard('score'));
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Card controls
        this.setupCardControls();

        // Add task functionality
        document.getElementById('showAddTaskModal').addEventListener('click', () => this.showAddTaskModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeAddTaskModal());
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('input', () => this.validateTaskForm());

        // Category filtering
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.category));
        });

        // Achievement navigation
        document.getElementById('prevAchievement').addEventListener('click', () => this.navigateAchievements('prev'));
        document.getElementById('nextAchievement').addEventListener('click', () => this.navigateAchievements('next'));

        // Score navigation
        document.getElementById('prevScore').addEventListener('click', () => this.navigateScores('prev'));
        document.getElementById('nextScore').addEventListener('click', () => this.navigateScores('next'));

        // More details
        document.getElementById('toggleMoreDetails').addEventListener('click', () => this.toggleMoreDetails());

        // Modal overlay click to close
        document.getElementById('addTaskModal').addEventListener('click', (e) => {
            if (e.target.id === 'addTaskModal') {
                this.closeAddTaskModal();
            }
        });

        // Task details modal overlay click to close
        document.getElementById('taskDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskDetailsModal') {
                this.closeTaskDetails();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddTaskModal();
                this.closeTaskDetails();
            }
        });

        // Radio button change validation
        document.querySelectorAll('input[name="taskCategory"]').forEach(radio => {
            radio.addEventListener('change', () => this.validateTaskForm());
        });
    }

    setupCardControls() {
        // Expand buttons
        document.getElementById('expandAddTask').addEventListener('click', () => this.expandCard('addTaskCard'));
        document.getElementById('expandTasks').addEventListener('click', () => this.expandCard('tasksCard'));
        document.getElementById('expandAchievements').addEventListener('click', () => this.expandCard('achievementsCard'));
        document.getElementById('expandScore').addEventListener('click', () => this.expandCard('scoreCard'));

        // Minimize buttons
        document.getElementById('minimizeAddTask').addEventListener('click', () => this.minimizeCard('addTaskCard'));
        document.getElementById('minimizeTasks').addEventListener('click', () => this.minimizeCard('tasksCard'));
        document.getElementById('minimizeAchievements').addEventListener('click', () => this.minimizeCard('achievementsCard'));
        document.getElementById('minimizeScore').addEventListener('click', () => this.minimizeCard('scoreCard'));

        // Close buttons
        document.getElementById('closeAddTask').addEventListener('click', () => this.closeCard('addTaskCard'));
        document.getElementById('closeTasks').addEventListener('click', () => this.closeCard('tasksCard'));
        document.getElementById('closeAchievements').addEventListener('click', () => this.closeCard('achievementsCard'));
        document.getElementById('closeScore').addEventListener('click', () => this.closeCard('scoreCard'));
    }

    showCard(cardType) {
        // Hide all cards
        document.querySelectorAll('.main-card').forEach(card => {
            card.classList.remove('active');
        });

        // Remove active class from all nav cards
        document.querySelectorAll('.nav-card').forEach(card => {
            card.classList.remove('active');
        });

        // Show selected card
        const cardMap = {
            'add-task': 'addTaskCard',
            'tasks': 'tasksCard',
            'achievements': 'achievementsCard',
            'score': 'scoreCard'
        };

        const navMap = {
            'add-task': 'navAddTask',
            'tasks': 'navTasks',
            'achievements': 'navAchievements',
            'score': 'navScore'
        };

        if (cardMap[cardType]) {
            document.getElementById(cardMap[cardType]).classList.add('active');
            document.getElementById(navMap[cardType]).classList.add('active');
            this.currentCard = cardType;
        }
    }

    expandCard(cardId) {
        const card = document.getElementById(cardId);
        card.classList.add('expanded');
        card.classList.remove('minimized');
    }

    minimizeCard(cardId) {
        const card = document.getElementById(cardId);
        card.classList.add('minimized');
        card.classList.remove('expanded');
    }

    closeCard(cardId) {
        const card = document.getElementById(cardId);
        card.classList.remove('active', 'expanded', 'minimized');
        
        // Remove active from nav cards
        document.querySelectorAll('.nav-card').forEach(card => {
            card.classList.remove('active');
        });
    }

    showAddTaskModal() {
        document.getElementById('addTaskModal').classList.add('active');
        document.getElementById('taskInput').focus();
    }

    closeAddTaskModal() {
        document.getElementById('addTaskModal').classList.remove('active');
        document.getElementById('taskInput').value = '';
        document.getElementById('taskStartTime').value = '';
        document.getElementById('taskDeadline').value = '';
        document.getElementById('taskDescription').value = '';
        document.querySelectorAll('input[name="taskCategory"]')[0].checked = true;
        this.hideMoreDetails();
        this.validateTaskForm();
    }

    validateTaskForm() {
        const taskInput = document.getElementById('taskInput').value.trim();
        const categorySelected = document.querySelector('input[name="taskCategory"]:checked');
        const addBtn = document.getElementById('addTaskBtn');

        if (taskInput.length > 0 && categorySelected) {
            addBtn.disabled = false;
        } else {
            addBtn.disabled = true;
        }
    }

    addTask() {
        const taskInput = document.getElementById('taskInput').value.trim();
        const category = document.querySelector('input[name="taskCategory"]:checked').value;
        const startTime = document.getElementById('taskStartTime').value;
        const deadline = document.getElementById('taskDeadline').value;
        const description = document.getElementById('taskDescription').value.trim();

        if (taskInput && category) {
            const task = {
                id: Date.now(),
                title: taskInput,
                category: category,
                startTime: startTime || null,
                deadline: deadline || null,
                description: description || null,
                completed: false,
                progress: 0,
                createdAt: new Date().toISOString()
            };

            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
            this.updateAchievements();
            this.updateScore();
            this.closeAddTaskModal();
            this.showSuccessMessage('Task added successfully!');
        }
    }

   deleteTask(taskId) {
    const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
    
    if (card) {
        // أضف كلاس انيميشن الحذف
        card.classList.add('removed');
        
        // استنى 200ms قبل الحذف
        setTimeout(() => {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateAchievements();
            this.updateScore();
            this.showSuccessMessage('Task deleted successfully!');
        }, 200);
    }
}


    completeTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateAchievements();
            this.updateScore();
            this.showSuccessMessage(task.completed ? 'Task completed!' : 'Task uncompleted!');
        }
    }

    filterTasks(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.renderTasks();
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        let filteredTasks = this.tasks;

        if (this.currentCategory !== 'all') {
            filteredTasks = this.tasks.filter(task => task.category === this.currentCategory);
        }

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: white; padding: 40px;">
                    <i class="fas fa-tasks" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <p style="font-size: 1.2rem; opacity: 0.8;">No tasks found</p>
                    <p style="opacity: 0.6;">Add a new task to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTasks.map(task => {
            const deadlineText = task.deadline ? 
                `<div class="task-deadline"><i class="fas fa-calendar-alt"></i> ${new Date(task.deadline).toLocaleDateString()}</div>` : '';
            
            const progressWidth = task.completed ? 100 : (task.progress || 0);
            
            return `
                <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
                    <div class="task-header">
                        <span class="task-category">${this.formatCategory(task.category)}</span>
                        <div class="task-actions">
                            <button class="task-action delete-btn" onclick="taskManager.deleteTask(${task.id})">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="task-action complete-btn" onclick="taskManager.completeTask(${task.id})">
                                <i class="fas fa-check"></i>
                            </button>
                        </div>
                    </div>
                    <div class="task-title">${task.title}</div>
                    ${deadlineText}
                    <div class="task-progress-container">
                        <div class="task-progress" onclick="taskManager.setProgressByClick(${task.id}, event)" style="cursor: pointer;">
                            <div class="task-progress-fill" style="width: ${progressWidth}%"></div>
                        </div>
                        <div class="progress-controls">
                            <button class="progress-btn minus-btn" onclick="taskManager.updateProgress(${task.id}, -10)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="progress-text">${progressWidth}%</span>
                            <button class="progress-btn plus-btn" onclick="taskManager.updateProgress(${task.id}, 10)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatCategory(category) {
        const categoryMap = {
            'work': 'Work',
            'personal': 'Personal',
            'urgent': 'Urgent',
            'not-important': 'Not Important'
        };
        return categoryMap[category] || category;
    }

    updateAchievements() {
        const container = document.getElementById('achievementsContainer');
        const completedTasks = this.tasks.filter(task => task.completed);
        
        // Create achievement cards for completed tasks
        const maxCards = 10;
        const achievements = [];
        
        for (let i = 0; i < maxCards; i++) {
            const task = completedTasks[i];
            const isCompleted = task !== undefined;
            
            achievements.push(`
                <div class="achievement-card ${isCompleted ? 'completed' : ''}" 
                     title="${isCompleted ? task.title : 'Not achieved yet'}"
                     ${isCompleted ? `onclick="taskManager.showTaskDetails(${task.id})"` : ''}>
                    <i class="fas ${isCompleted ? 'fa-trophy' : 'fa-lock'} achievement-icon"></i>
                </div>
            `);
        }
        
        container.innerHTML = achievements.join('');
    }

    updateScore() {
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const totalTasks = this.tasks.length;
        const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        document.getElementById('totalProgress').textContent = `${completedTasks}/${totalTasks}`;
        
        // Update progress circle
        const progressCircle = document.querySelector('.progress-circle');
        const degree = (percentage / 100) * 360;
        progressCircle.style.background = `conic-gradient(#28a745 ${degree}deg, rgba(255, 255, 255, 0.2) ${degree}deg)`;
        
        // Update individual task scores
        this.updateTaskScores();
    }

    updateTaskScores() {
        const taskScoresContainer = document.getElementById('taskScoresContainer');
        if (!taskScoresContainer) return;

        const tasksByCategory = {
            work: this.tasks.filter(task => task.category === 'work'),
            personal: this.tasks.filter(task => task.category === 'personal'),
            urgent: this.tasks.filter(task => task.category === 'urgent'),
            'not-important': this.tasks.filter(task => task.category === 'not-important')
        };

        const scoreHTML = Object.entries(tasksByCategory).map(([category, tasks]) => {
            const completed = tasks.filter(task => task.completed).length;
            const total = tasks.length;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            
            return `
                <div class="category-score">
                    <h4>${this.formatCategory(category)}</h4>
                    <div class="score-circle-small">
                        <div class="score-text">${completed}/${total}</div>
                    </div>
                    <div class="score-percentage">${Math.round(percentage)}%</div>
                </div>
            `;
        }).join('');

        taskScoresContainer.innerHTML = scoreHTML;
    }

    updateProgress(taskId, change) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task && !task.completed) {
            task.progress = Math.max(0, Math.min(100, (task.progress || 0) + change));
            this.saveTasks();
            this.renderTasks();
            this.updateScore();
        }
    }

    setProgressByClick(taskId, event) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task && !task.completed) {
            const progressBar = event.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const width = rect.width;
            const percentage = Math.round((clickX / width) * 100);
            
            task.progress = Math.max(0, Math.min(100, percentage));
            this.saveTasks();
            this.renderTasks();
            this.updateScore();
        }
    }

    showTaskDetails(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const modal = document.getElementById('taskDetailsModal');
            document.getElementById('detailTitle').textContent = task.title;
            document.getElementById('detailCategory').textContent = this.formatCategory(task.category);
            document.getElementById('detailCreated').textContent = new Date(task.createdAt).toLocaleDateString();
            document.getElementById('detailStartTime').textContent = task.startTime ? 
                new Date(task.startTime).toLocaleString() : 'Not set';
            document.getElementById('detailDeadline').textContent = task.deadline ? 
                new Date(task.deadline).toLocaleString() : 'No deadline';
            document.getElementById('detailProgress').textContent = `${task.progress || 0}%`;
            document.getElementById('detailStatus').textContent = task.completed ? 'Completed' : 'In Progress';
            
            // Show description if exists
            const descContainer = document.getElementById('detailDescriptionContainer');
            if (task.description) {
                document.getElementById('detailDescription').textContent = task.description;
                descContainer.classList.remove('hidden');
            } else {
                descContainer.classList.add('hidden');
            }
            
            modal.classList.add('active');
        }
    }

    closeTaskDetails() {
        document.getElementById('taskDetailsModal').classList.remove('active');
    }

    navigateAchievements(direction) {
        // Simple animation for demonstration
        const container = document.getElementById('achievementsContainer');
        container.style.transform = direction === 'prev' ? 'translateX(-10px)' : 'translateX(10px)';
        
        setTimeout(() => {
            container.style.transform = 'translateX(0)';
        }, 200);
    }

    navigateScores(direction) {
        const container = document.getElementById('taskScoresContainer');
        const scrollAmount = 220; // Width of score card + gap
        
        if (direction === 'prev') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    toggleMoreDetails() {
        const btn = document.getElementById('toggleMoreDetails');
        const container = document.getElementById('moreDetailsContainer');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        if (container.style.display === 'none') {
            container.classList.remove('hidden');
            btn.classList.add('active');
            icon.className = 'fas fa-minus';
            text.textContent = 'Less Details';
        } else {
            container.classList.add('hidden');
            btn.classList.remove('active');
            icon.className = 'fas fa-plus';
            text.textContent = 'More Details';
        }
    }

    hideMoreDetails() {
        const btn = document.getElementById('toggleMoreDetails');
        const container = document.getElementById('moreDetailsContainer');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        container.style.display = 'none';
        btn.classList.remove('active');
        icon.className = 'fas fa-plus';
        text.textContent = 'More Details';
    }

    // dark mode and light mode.
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    showSuccessMessage(message) {
        const successMsg = document.getElementById('successMessage');
        successMsg.querySelector('span').textContent = message;
        successMsg.classList.add('active');
        
        setTimeout(() => {
            successMsg.classList.remove('active');
        }, 3000);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    reorderTasks(newOrder) {
        this.tasks = newOrder.map(id => this.tasks.find(task => task.id === id));
        this.saveTasks();
        this.renderTasks();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();

    // Drag & Drop for tasks
    const tasksContainer = document.getElementById('tasksContainer');
    let draggedTaskId = null;

    tasksContainer.addEventListener('dragstart', function(e) {
        const card = e.target.closest('.task-card');
        if (!card) return;
        draggedTaskId = card.dataset.taskId;
        card.classList.add('dragging');
    });

    tasksContainer.addEventListener('dragend', function(e) {
        const card = e.target.closest('.task-card');
        if (!card) return;
        card.classList.remove('dragging');
        draggedTaskId = null;
    });

    tasksContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(tasksContainer, e.clientY);
        const draggedCard = tasksContainer.querySelector('.task-card.dragging');
        if (!draggedCard) return;
        if (afterElement == null) {
            tasksContainer.appendChild(draggedCard);
        } else {
            tasksContainer.insertBefore(draggedCard, afterElement);
        }
    });

    tasksContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        // localStorage
        const newOrder = Array.from(tasksContainer.querySelectorAll('.task-card')).map(card => Number(card.dataset.taskId));
        window.taskManager.reorderTasks(newOrder);
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: -Infinity }).element;
    }

    // Mouse drag to scroll (scoreCard)
    const scoresContainer = document.getElementById('taskScoresContainer');
    let isDown = false;
    let startX;
    let scrollLeft;

    if (scoresContainer) {
        scoresContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            scoresContainer.classList.add('active');
            startX = e.pageX - scoresContainer.offsetLeft;
            scrollLeft = scoresContainer.scrollLeft;
        });
        scoresContainer.addEventListener('mouseleave', () => {
            isDown = false;
            scoresContainer.classList.remove('active');
        });
        scoresContainer.addEventListener('mouseup', () => {
            isDown = false;
            scoresContainer.classList.remove('active');
        });
        scoresContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scoresContainer.offsetLeft;
            const walk = (x - startX) * 2; // سرعة السحب
            scoresContainer.scrollLeft = scrollLeft - walk;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // DetailsBtn
    const toggleBtn = document.getElementById('toggleMoreDetails');
    const detailsContainer = document.getElementById('moreDetailsContainer');
    const icon = toggleBtn.querySelector('i');
    const text = toggleBtn.querySelector('span');

    // Hide
    detailsContainer.style.display = 'none';

    toggleBtn.addEventListener('click', () => {
        if (detailsContainer.style.display === 'none') {
            detailsContainer.style.display = 'block';
            toggleBtn.classList.add('active');
            icon.className = 'fas fa-minus';
            text.textContent = 'Less Details';
        } else {
            detailsContainer.style.display = 'none';
            toggleBtn.classList.remove('active');
            icon.className = 'fas fa-plus';
            text.textContent = 'More Details';
        }
    });
});
