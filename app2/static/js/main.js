document.addEventListener('DOMContentLoaded', function() {
    // Greeting functionality
    const nameInput = document.getElementById('nameInput');
    const greetButton = document.getElementById('greetButton');
    const greetingResult = document.getElementById('greetingResult');

    greetButton.addEventListener('click', function() {
        const name = nameInput.value.trim() || 'Guest';
        
        fetch('/api/greet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
        })
        .then(response => response.json())
        .then(data => {
            greetingResult.textContent = data.message;
            greetingResult.style.color = '#2ecc71';
        })
        .catch(error => {
            console.error('Error:', error);
            greetingResult.textContent = 'Error: Could not connect to the server.';
            greetingResult.style.color = '#e74c3c';
        });
    });

    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            greetButton.click();
        }
    });

    // Todo list functionality
    const loadTodosButton = document.getElementById('loadTodosButton');
    const todoList = document.getElementById('todoList');

    loadTodosButton.addEventListener('click', function() {
        fetch('/api/todos')
        .then(response => response.json())
        .then(todos => {
            todoList.innerHTML = '';
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.className = todo.completed ? 'completed' : '';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.completed;
                
                const span = document.createElement('span');
                span.textContent = todo.title;
                
                li.appendChild(checkbox);
                li.appendChild(span);
                todoList.appendChild(li);
                
                checkbox.addEventListener('change', function() {
                    li.className = this.checked ? 'completed' : '';
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            todoList.innerHTML = '<li style="color: #e74c3c;">Error loading todos</li>';
        });
    });
}); 