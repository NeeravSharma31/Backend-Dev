from django.test import TestCase
from django.urls import reverse

class StudentRoutingAndMiddlewareTests(TestCase):
    def test_health_check_endpoint(self):
        response = self.client.get(reverse('health-check'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'ok')
        self.assertEqual(response['X-Course'], 'Django-Lecture-27')

    def test_student_list_endpoint(self):
        response = self.client.get(reverse('student-list'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('students', data)
        self.assertGreater(len(data['students']), 0)

    def test_student_detail_found(self):
        response = self.client.get(reverse('student-detail', kwargs={'student_id': 1}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['student']['name'], 'Neerav Kumar Sharma')

    def test_student_detail_not_found(self):
        response = self.client.get(reverse('student-detail', kwargs={'student_id': 999}))
        self.assertEqual(response.status_code, 404)
