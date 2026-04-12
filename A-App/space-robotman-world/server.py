import os
import json
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='.')

# Allow simple CORS if needed, but since it's same origin, it's fine.

DATA_FILE = 'data.json'
ASSET_DIRS = {
    'ART': 'assets/new_image',
    'CHAR': 'assets/characters/REALISTIC MODEL VERSION',
    'MOTION': 'assets/motion'
}

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"units": [], "artSet": [], "motSet": []}
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write('window.SRW_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/update_data', methods=['POST'])
def update_data():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    save_data(data)
    return jsonify({'success': True})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    category = request.form.get('category')
    if category not in ASSET_DIRS:
        return jsonify({'error': 'Invalid category'}), 400
        
    custom_name = request.form.get('filename')
    
    # Process filename
    ext = os.path.splitext(file.filename)[1]
    if custom_name:
        filename = custom_name + ext
    else:
        filename = secure_filename(file.filename)
        
    save_path = os.path.join(ASSET_DIRS[category], filename)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    file.save(save_path)
    
    # We return the relative path that the frontend expects
    if category == 'ART':
        rel_path = filename
    elif category == 'MOTION':
        rel_path = filename
    else: # CHAR
        rel_path = f"assets/characters/REALISTIC MODEL VERSION/{filename}"
        
    return jsonify({'success': True, 'filename': rel_path, 'basename': filename})

if __name__ == '__main__':
    # Initialize data.js immediately on boot for local CORS bypass
    d = load_data()
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write('window.SRW_DATA = ' + json.dumps(d, ensure_ascii=False, indent=2) + ';')
        
    print("========================================")
    print(" SPACE ROBOTMAN WORLD - MANAGEMENT SERVER")
    print("========================================")
    print("Server running at: http://localhost:5000")
    print("Press CTRL+C to stop.")
    app.run(host='127.0.0.1', port=5000, debug=True)
