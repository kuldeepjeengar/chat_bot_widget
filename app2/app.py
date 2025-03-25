from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import traceback
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/greet', methods=['POST'])
def greet():
    data = request.json
    name = data.get('name', 'Guest')
    return jsonify({'message': f'Hello, {name}!'})

@app.route('/api/todos', methods=['GET'])
def get_todos():
    # Sample data
    todos = [
        {'id': 1, 'title': 'Learn Flask', 'completed': True},
        {'id': 2, 'title': 'Build a web app', 'completed': False},
        {'id': 3, 'title': 'Deploy to production', 'completed': False}
    ]
    return jsonify(todos)

@app.route('/test')
def test():
    return "Flask is working!"

if __name__ == '__main__':
    print("Starting Flask application...")
    print(f"Python version: {sys.version}")
    
    try:
        app.run(debug=True, port=5000)
    except Exception as e:
        print(f"Error starting Flask app: {str(e)}")
        traceback.print_exc()