from flask import Flask, jsonify

app = Flask(__name__)

data = {
    "name": "John Doe",
    "age": 30,
    "city": "New York"
}

@app.route("/")
def home():
    """Root endpoint returning basic server status."""
    return "Backend Server Running"

@app.route("/data")
def get_data():
    """Returns JSON serialized dictionary."""
    return jsonify(data)

@app.route("/html")
def get_html():
    """Returns server-rendered HTML."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head><title>Flask Backend</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Backend Server Running</h1>
        <p>Visit <a href='/data'>/data</a> for JSON response.</p>
        <h3>User Profile:</h3>
        <ul>
            <li><strong>Name:</strong> {data['name']}</li>
            <li><strong>Age:</strong> {data['age']}</li>
            <li><strong>City:</strong> {data['city']}</li>
        </ul>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)