#!/usr/bin/env python3
"""
automationTesting.py
--------------------
Automated Test Suite for PBL Student Management Portal API.
Executes complete end-to-end route testing across CRUD operations,
data validation, health probes, analytics, and response timing headers.

Can be run:
  1. Standalone via direct in-process ASGI engine (ideal for CI/CD test stages).
  2. Against a live server URL: python automationTesting.py --url http://localhost:8000
"""

import sys
import json
import time
import asyncio
from typing import Dict, Any, Tuple

# Try importing live requests/urllib fallback
import urllib.request
import urllib.error

# Import application for in-process ASGI testing
from main import app, db

class ASGITestClient:
    def __init__(self, asgi_app):
        self.app = asgi_app

    async def _raw_request(self, method: str, path: str, json_data: dict = None, headers: dict = None) -> Tuple[int, dict, dict]:
        body_bytes = json.dumps(json_data).encode("utf-8") if json_data is not None else b""
        req_headers = [(b"host", b"testserver")]
        if json_data is not None:
            req_headers.append((b"content-type", b"application/json"))
            req_headers.append((b"content-length", str(len(body_bytes)).encode("ascii")))
        if headers:
            for k, v in headers.items():
                req_headers.append((k.lower().encode("latin1"), v.encode("latin1")))

        scope = {
            "type": "http",
            "http_version": "1.1",
            "method": method.upper(),
            "path": path,
            "raw_path": path.encode("ascii"),
            "query_string": b"",
            "headers": req_headers,
            "client": ("127.0.0.1", 54321),
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
            return {"type": "http.request", "body": body_bytes, "more_body": False}

        await self.app(scope, receive, send)

        parsed_json = {}
        if res_body:
            try:
                parsed_json = json.loads(res_body.decode("utf-8"))
            except Exception:
                parsed_json = {"raw": res_body.decode("utf-8", errors="replace")}

        return res_status, parsed_json, res_headers

    def request(self, method: str, path: str, json_data: dict = None) -> Tuple[int, dict, dict]:
        return asyncio.run(self._raw_request(method, path, json_data))

def run_tests() -> bool:
    print("======================================================================")
    print("  PBL AUTOMATION TESTING: STUDENT MANAGEMENT PORTAL API")
    print("  Author: Neerav Kumar Sharma | SAP ID: 590018263 | UPES Dehradun")
    print("======================================================================\n")

    client = ASGITestClient(app)
    tests_run = 0
    tests_passed = 0
    t0_all = time.perf_counter()

    test_cases = []

    # 1. Test Root Route
    tests_run += 1
    status, data, headers = client.request("GET", "/")
    if (
        status == 200
        and data.get("status") == "online"
        and data.get("author") == "Neerav Kumar Sharma"
        and data.get("sap_id") == "590018263"
    ):
        tests_passed += 1
        print("  [PASS] 01. GET / - Root endpoint & metadata verification")
    else:
        print(f"  [FAIL] 01. GET / - Expected 200 with author metadata, got {status}: {data}")

    # 2. Test Health Probe
    tests_run += 1
    status, data, headers = client.request("GET", "/health")
    if status == 200 and data.get("status") == "healthy" and "x-response-time-ms" in headers:
        tests_passed += 1
        print(f"  [PASS] 02. GET /health - Liveness probe healthy (latency: {headers.get('x-response-time-ms')} ms)")
    else:
        print(f"  [FAIL] 02. GET /health - Expected 200 healthy, got {status}: {data}")

    # 3. Test List Students
    tests_run += 1
    status, data, headers = client.request("GET", "/api/v1/students")
    if status == 200 and isinstance(data, list) and len(data) >= 3:
        tests_passed += 1
        print(f"  [PASS] 03. GET /api/v1/students - Retrieved {len(data)} student records")
    else:
        print(f"  [FAIL] 03. GET /api/v1/students - Expected list, got {status}: {data}")

    # 4. Test Create Student (POST)
    tests_run += 1
    new_student = {
        "name": "Kavya Verma",
        "sap_id": "590099999",
        "branch": "Cloud Computing",
        "email": "kavya@example.com",
    }
    status, data, headers = client.request("POST", "/api/v1/students", json_data=new_student)
    created_id = data.get("id") if status == 201 else None
    if status == 201 and created_id is not None and data.get("name") == "Kavya Verma":
        tests_passed += 1
        print(f"  [PASS] 04. POST /api/v1/students - Successfully created student (ID: {created_id})")
    else:
        print(f"  [FAIL] 04. POST /api/v1/students - Expected 201 Created, got {status}: {data}")

    # 5. Test Get Student by ID
    tests_run += 1
    if created_id:
        status, data, headers = client.request("GET", f"/api/v1/students/{created_id}")
        if status == 200 and data.get("sap_id") == "590099999":
            tests_passed += 1
            print(f"  [PASS] 05. GET /api/v1/students/{created_id} - Retrieved newly created record")
        else:
            print(f"  [FAIL] 05. GET /api/v1/students/{created_id} - Expected 200, got {status}: {data}")
    else:
        print("  [SKIP] 05. GET /api/v1/students/{id} - Skipped due to creation failure")

    # 6. Test Update Student (PUT)
    tests_run += 1
    if created_id:
        updates = {"email": "kavya.verma.updated@upes.ac.in", "branch": "DevOps & Cloud"}
        status, data, headers = client.request("PUT", f"/api/v1/students/{created_id}", json_data=updates)
        if status == 200 and data.get("email") == "kavya.verma.updated@upes.ac.in" and data.get("branch") == "DevOps & Cloud":
            tests_passed += 1
            print(f"  [PASS] 06. PUT /api/v1/students/{created_id} - Record updated successfully")
        else:
            print(f"  [FAIL] 06. PUT /api/v1/students/{created_id} - Expected 200 updated, got {status}: {data}")
    else:
        print("  [SKIP] 06. PUT /api/v1/students/{id} - Skipped")

    # 7. Test Delete Student (DELETE)
    tests_run += 1
    if created_id:
        status, data, headers = client.request("DELETE", f"/api/v1/students/{created_id}")
        if status == 200 and "successfully deleted" in data.get("message", ""):
            tests_passed += 1
            print(f"  [PASS] 07. DELETE /api/v1/students/{created_id} - Record deleted successfully")
        else:
            print(f"  [FAIL] 07. DELETE /api/v1/students/{created_id} - Expected 200, got {status}: {data}")
    else:
        print("  [SKIP] 07. DELETE /api/v1/students/{id} - Skipped")

    # 8. Test 404 Error on Deleted Student
    tests_run += 1
    if created_id:
        status, data, headers = client.request("GET", f"/api/v1/students/{created_id}")
        if status == 404:
            tests_passed += 1
            print(f"  [PASS] 08. GET /api/v1/students/{created_id} - Verified 404 Not Found handling")
        else:
            print(f"  [FAIL] 08. GET /api/v1/students/{created_id} - Expected 404, got {status}: {data}")
    else:
        print("  [SKIP] 08. 404 check - Skipped")

    # 9. Test Statistics Endpoint
    tests_run += 1
    status, data, headers = client.request("GET", "/api/v1/stats")
    if status == 200 and "total_students" in data and "branch_distribution" in data:
        tests_passed += 1
        print(f"  [PASS] 09. GET /api/v1/stats - Analytics aggregated: {data.get('total_students')} active students")
    else:
        print(f"  [FAIL] 09. GET /api/v1/stats - Expected 200 with stats, got {status}: {data}")

    # 10. Performance Timing Header Check
    tests_run += 1
    status, data, headers = client.request("GET", "/")
    if "x-response-time-ms" in headers:
        tests_passed += 1
        print(f"  [PASS] 10. Middleware - Header X-Response-Time-Ms emitted ({headers['x-response-time-ms']} ms)")
    else:
        print("  [FAIL] 10. Middleware - Missing timing header")

    elapsed = (time.perf_counter() - t0_all) * 1000
    print("\n----------------------------------------------------------------------")
    print(f"  Test Execution Summary: {tests_passed}/{tests_run} Passed in {elapsed:.2f} ms")
    print("----------------------------------------------------------------------")

    if tests_passed == tests_run:
        print("  >>> ALL AUTOMATION TESTS PASSED (Status Code: 0) <<<")
        return True
    else:
        print("  >>> TEST FAILURES DETECTED (Status Code: 1) <<<")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
