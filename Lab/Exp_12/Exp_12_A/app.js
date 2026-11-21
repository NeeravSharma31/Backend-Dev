const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory data store for students
let students = [
  { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', semester: 5 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Information Technology', semester: 4 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', course: 'Computer Science', semester: 6 }
];

// ==========================================
// PART A & STEP 7: BASIC RESPONSES
// ==========================================

// Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to Express Server!');
});

// Plain text response
app.get('/text', (req, res) => {
  res.send('This is plain text response');
});

// HTML response
app.get('/html', (req, res) => {
  res.send('<h1>HTML Response</h1><p>This is HTML content</p>');
});

// JSON response
app.get('/json', (req, res) => {
  res.json({
    message: 'This is JSON response',
    status: 'success',
    data: { name: 'Student', course: 'Backend Development' }
  });
});

// Status response
app.get('/status', (req, res) => {
  res.status(201).json({ message: 'Created successfully' });
});

// ==========================================
// LAB TASK 1: STUDENT DETAILS IN 3 FORMATS
// ==========================================
const myDetails = {
  name: "Neerav Kumar Sharma",
  rollNo: "590018263",
  branch: "B.Tech CSE"
};

app.get('/my-details/text', (req, res) => {
  res.send(`Name: ${myDetails.name} | Roll No: ${myDetails.rollNo} | Branch: ${myDetails.branch}`);
});

app.get('/my-details/html', (req, res) => {
  res.send(`
    <h2>Student Details</h2>
    <p><strong>Name:</strong> ${myDetails.name}</p>
    <p><strong>Roll No:</strong> ${myDetails.rollNo}</p>
    <p><strong>Branch:</strong> ${myDetails.branch}</p>
  `);
});

app.get('/my-details/json', (req, res) => {
  res.json(myDetails);
});

// ==========================================
// PART B: ROUTE & QUERY PARAMETERS
// ==========================================

// User details by route parameter
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: 'User details', userId: userId });
});

// Category and product ID route parameters
app.get('/product/:category/:id', (req, res) => {
  const { category, id } = req.params;
  res.json({ category: category, productId: id });
});

// Search query parameters
app.get('/search', (req, res) => {
  const { q, page, limit } = req.query;
  res.json({
    searchQuery: q || '',
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
});

// LAB TASK 2: CALCULATOR API (add, subtract, multiply, divide, modulus, power)
app.get('/calculate', (req, res) => {
  const { num1, num2, operation } = req.query;
  const n1 = parseFloat(num1);
  const n2 = parseFloat(num2);

  if (isNaN(n1) || isNaN(n2)) {
    return res.status(400).json({ error: 'Please provide valid numbers for num1 and num2' });
  }

  let result;
  switch (operation) {
    case 'add':
      result = n1 + n2;
      break;
    case 'subtract':
      result = n1 - n2;
      break;
    case 'multiply':
      result = n1 * n2;
      break;
    case 'divide':
      result = n2 !== 0 ? n1 / n2 : 'Error: Division by zero';
      break;
    case 'modulus':
      result = n2 !== 0 ? n1 % n2 : 'Error: Modulo by zero';
      break;
    case 'power':
      result = Math.pow(n1, n2);
      break;
    default:
      return res.status(400).json({ error: 'Invalid operation. Use add, subtract, multiply, divide, modulus, or power' });
  }

  res.json({ num1: n1, num2: n2, operation, result });
});

// ==========================================
// POST DATA HANDLING
// ==========================================

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  res.json({
    message: 'Registration successful',
    user: { username, email }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'test@example.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'sample-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// ==========================================
// LAB TASK 3: STUDENT MANAGEMENT API
// ==========================================

// GET /students - Return list of students (JSON)
app.get('/students', (req, res) => {
  res.json(students);
});

// GET /students/:id - Return specific student details
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// POST /students/add - Add new student
app.post('/students/add', (req, res) => {
  const { name, email, course, semester } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const newStudent = {
    id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
    name,
    email,
    course: course || 'CSE',
    semester: parseInt(semester) || 1
  };
  students.push(newStudent);
  res.status(201).json({ message: 'Student added successfully', student: newStudent });
});

// ==========================================
// PART C & LAB TASKS 4, 5: EJS TEMPLATES
// ==========================================

// Step 12: Home Template
app.get('/home', (req, res) => {
  res.render('home', {
    title: 'Home Page',
    heading: 'Welcome to EJS Templating',
    message: 'EJS makes it easy to generate dynamic HTML'
  });
});

// Step 12: Users List Template
app.get('/users', (req, res) => {
  const usersList = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  res.render('users', { users: usersList });
});

// Step 12: Profile Template
app.get('/profile/:id', (req, res) => {
  const user = {
    id: req.params.id,
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    city: 'New York'
  };
  res.render('profile', { user });
});

// LAB TASK 4: COURSE TIMETABLE TEMPLATE
app.get('/timetable', (req, res) => {
  const timetable = [
    { day: 'Monday', time: '09:00 - 10:00 AM', subject: 'Backend Development', faculty: 'Dr. Prateek Gautam' },
    { day: 'Monday', time: '10:00 - 11:00 AM', subject: 'Database Systems', faculty: 'Prof. Sharma' },
    { day: 'Tuesday', time: '11:00 - 01:00 PM', subject: 'Backend Dev Lab (Express & EJS)', faculty: 'Dr. Prateek Gautam' },
    { day: 'Wednesday', time: '02:00 - 03:00 PM', subject: 'Operating Systems', faculty: 'Dr. Verma' },
    { day: 'Thursday', time: '09:00 - 10:00 AM', subject: 'Computer Networks', faculty: 'Prof. Singh' },
    { day: 'Friday', time: '10:00 - 12:00 PM', subject: 'Full Stack Lab', faculty: 'Prof. Gupta' }
  ];
  res.render('timetable', { timetable });
});

// LAB TASK 5: STUDENT REGISTRATION FORM & RESULT
app.get('/register-student', (req, res) => {
  res.render('register-student');
});

app.post('/register-student', (req, res) => {
  const { name, email, course, semester } = req.body;
  const newStudent = {
    id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
    name,
    email,
    course,
    semester: parseInt(semester) || 1
  };
  students.push(newStudent);
  res.render('registration-result', { student: newStudent });
});

// Server Listen
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  / - Welcome message');
  console.log('  GET  /text - Plain text');
  console.log('  GET  /html - HTML response');
  console.log('  GET  /json - JSON response');
  console.log('  GET  /status - HTTP Status 201');
  console.log('  GET  /my-details/text | /my-details/html | /my-details/json');
  console.log('  GET  /user/:id - User by ID');
  console.log('  GET  /search?q=term - Search');
  console.log('  GET  /calculate?num1=10&num2=5&operation=add');
  console.log('  POST /register - Register user');
  console.log('  POST /login - Login user');
  console.log('  GET  /students - JSON list of students');
  console.log('  GET  /students/:id - JSON student by ID');
  console.log('  POST /students/add - Add student');
  console.log('  GET  /home - EJS home page');
  console.log('  GET  /users - EJS Users list');
  console.log('  GET  /profile/:id - EJS User profile');
  console.log('  GET  /timetable - EJS Timetable (Task 4)');
  console.log('  GET  /register-student - EJS Registration Form (Task 5)');
});