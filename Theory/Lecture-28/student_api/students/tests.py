from unittest.mock import Mock, patch
from django.test import SimpleTestCase
from django.urls import reverse
import requests
from .utils import get_external_data

class ExternalDataTests(SimpleTestCase):
    """
    Lecture 28: Unit tests with mock objects (unittest.mock).
    Tests external integration deterministically without live internet calls.
    """
    @patch("students.utils.requests.get")
    def test_external_data_success(self, mock_get):
        mock_response = Mock()
        mock_response.json.return_value = {
            "id": 1,
            "title": "Backend Architecture Notes",
            "body": "Integrating third-party APIs via service utility layers."
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        result = get_external_data(1)
        self.assertIsNone(result["error"])
        self.assertEqual(result["data"]["id"], 1)
        self.assertEqual(result["data"]["title"], "Backend Architecture Notes")
        mock_get.assert_called_once_with(
            "https://jsonplaceholder.typicode.com/posts/1",
            timeout=2
        )

    @patch("students.utils.requests.get")
    def test_timeout_returns_safe_error(self, mock_get):
        mock_get.side_effect = requests.Timeout

        result = get_external_data(1)
        self.assertIsNone(result["data"])
        self.assertEqual(result["error"], "External service timed out")

    @patch("students.utils.requests.get")
    def test_service_unavailable_returns_safe_error(self, mock_get):
        mock_get.side_effect = requests.ConnectionError

        result = get_external_data(1)
        self.assertIsNone(result["data"])
        self.assertEqual(result["error"], "External service is unavailable")

    @patch("students.views.get_external_data")
    def test_external_view_success_endpoint(self, mock_service):
        mock_service.return_value = {
            "data": {"id": 42, "title": "Student Resource Post"},
            "error": None
        }
        response = self.client.get(reverse('external-data', kwargs={'post_id': 42}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], 42)

    @patch("students.views.get_external_data")
    def test_external_view_503_on_failure(self, mock_service):
        mock_service.return_value = {
            "data": None,
            "error": "External service timed out"
        }
        response = self.client.get(reverse('external-data', kwargs={'post_id': 42}))
        self.assertEqual(response.status_code, 503)
        self.assertIn("error", response.json())
