from django.test import TestCase
from django.urls import reverse
from .models import Task

class TaskModelTests(TestCase):
    def test_create_task(self):
        task = Task.objects.create(title="Test Task")
        self.assertEqual(str(task), "Test Task")
        self.assertFalse(task.completed)
        self.assertIsNotNone(task.created_at)

class TaskViewsTests(TestCase):
    def setUp(self):
        self.task1 = Task.objects.create(title="Task 1", completed=False)
        self.task2 = Task.objects.create(title="Task 2", completed=True)

    def test_task_list_view(self):
        response = self.client.get(reverse('task_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo/task_list.html')
        self.assertTemplateUsed(response, 'todo/base.html')
        self.assertTemplateUsed(response, 'todo/navbar.html')
        self.assertContains(response, "Task 1")
        self.assertContains(response, "Task 2")

    def test_add_task_get(self):
        response = self.client.get(reverse('add_task'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo/add_task.html')

    def test_add_task_post(self):
        response = self.client.post(reverse('add_task'), {'title': 'New Task'})
        self.assertRedirects(response, reverse('task_list'))
        self.assertTrue(Task.objects.filter(title='New Task').exists())

    def test_toggle_task(self):
        response = self.client.get(reverse('toggle_task', args=[self.task1.id]))
        self.assertRedirects(response, reverse('task_list'))
        self.task1.refresh_from_db()
        self.assertTrue(self.task1.completed)

        # Toggle back
        response = self.client.get(reverse('toggle_task', args=[self.task1.id]))
        self.assertRedirects(response, reverse('task_list'))
        self.task1.refresh_from_db()
        self.assertFalse(self.task1.completed)

    def test_delete_task(self):
        task_id = self.task1.id
        response = self.client.get(reverse('delete_task', args=[task_id]))
        self.assertRedirects(response, reverse('task_list'))
        self.assertFalse(Task.objects.filter(id=task_id).exists())
