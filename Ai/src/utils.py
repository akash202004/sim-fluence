import os
import json
import datetime

def ensure_dir(path: str):
    """Creates directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)

def save_json(data, path: str):
    """Save any Python dictionary or object as a JSON file."""
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def log(message: str, prefix: str = "📝"):
    """Standardized logger with timestamp."""
    print(f"{prefix} [{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]: {message}")
