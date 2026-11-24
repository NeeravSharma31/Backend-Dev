import asyncio
import json
import unittest
from main import app

class ASGIClient:
    """Zero-dependency asynchronous test client for ASGI / FastAPI apps."""
    def __init__(self, app):
        self.app = app

    async def request(self, method: str, path: str, headers: dict = None, body: bytes = b""):
        headers_list = [(k.lower().encode("latin1"), v.encode("latin1")) for k, v in (headers or {}).items()]
        scope = {
            "type": "http",
            "http_version": "1.1",
            "method": method.upper(),
            "path": path,
            "raw_path": path.encode("ascii"),
            "query_string": b"",
            "headers": headers_list,
            "client": ("127.0.0.1", 50000),
            "server": ("127.0.0.1", 8000),
        }
        res_status = None
        res_headers = {}
        res_body = b""

        async def send(message):
            nonlocal res_status, res_headers, res_body
            if message["type"] == "http.response.start":
                res_status = message["status"]
                res_headers = {k.decode("latin1"): v.decode("latin1") for k, v in message.get("headers", [])}
            elif message["type"] == "http.response.body":
                res_body += message.get("body", b"")

        async def receive():
            return {"type": "http.request", "body": body, "more_body": False}

        await self.app(scope, receive, send)

        class Response:
            def __init__(self, status_code, headers, content):
                self.status_code = status_code
                self.headers = headers
                self.content = content
            def json(self):
                return json.loads(self.content.decode("utf-8"))

        return Response(res_status, res_headers, res_body)

    def get(self, path: str, headers: dict = None):
        return asyncio.run(self.request("GET", path, headers=headers))

class TestFastAPIStudentService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = ASGIClient(app)

    def test_01_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("application"), "Student API")
        self.assertEqual(data.get("framework"), "FastAPI")
        self.assertEqual(data.get("status"), "running")
        self.assertEqual(data.get("sapid"), "590018263")
        self.assertEqual(data.get("author"), "Neerav Kumar Sharma")
        self.assertIn("x-process-time-ms", response.headers)

    def test_02_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data, {"status": "healthy"})

    def test_03_students_list(self):
        response = self.client.get("/students")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)
        self.assertEqual(data[0]["name"], "Aarav")
        self.assertEqual(data[2]["name"], "Neerav Kumar Sharma")

    def test_04_structured_logging_header(self):
        response = self.client.get("/health")
        header_val = response.headers.get("x-process-time-ms")
        self.assertIsNotNone(header_val)
        latency = float(header_val)
        self.assertGreaterEqual(latency, 0.0)

if __name__ == "__main__":
    unittest.main()
