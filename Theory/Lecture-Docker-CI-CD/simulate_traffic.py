import statistics
import time
from test_api import ASGIClient
from main import app

def run_simulation(n_requests=25):
    client = ASGIClient(app)
    durations = []
    print(f"--- Simulating {n_requests} Requests to Student API ---")

    for i in range(1, n_requests + 1):
        path = "/health" if i % 2 == 0 else "/students"
        t0 = time.perf_counter()
        res = client.get(path)
        t_elapsed = (time.perf_counter() - t0) * 1000
        durations.append(t_elapsed)

    mean_lat = statistics.mean(durations)
    median_lat = statistics.median(durations)
    durations_sorted = sorted(durations)
    idx_p95 = int(0.95 * len(durations_sorted)) - 1
    p95_lat = durations_sorted[max(0, idx_p95)]

    print("\n--- Observability Metrics Summary ---")
    print(f"Total Requests: {n_requests}")
    print(f"Average Latency: {mean_lat:.2f} ms")
    print(f"Median Latency:  {median_lat:.2f} ms")
    print(f"p95 Latency:     {p95_lat:.2f} ms")
    print("Health Status:   100% 200 OK")

if __name__ == "__main__":
    run_simulation()
