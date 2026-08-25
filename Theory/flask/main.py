from flask import Flask

app = Flask(__name__)

data ={
    "name": "John Doe",
    "age": 30,
    "city": "New York"
}

@app.route("/data")
def home():
    return "Backend Server Running"


@app.route("/html")
def html():
    return f"""<h1>Backend Server Running</h1><p>Visit <a href='/data'>/data</a> for JSON response.</p>
        <ul>
            <li>Name: {data['name']}</li>
            <li>Age: {data['age']}</li>
            <li>City: {data['city']}</li>
        </ul>
    """


if __name__ == "__main__":
    app.run(debug=True)