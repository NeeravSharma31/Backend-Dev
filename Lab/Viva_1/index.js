const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Configuration
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'simple_cms';
let db;
let postsCollection;

// Helper to format date nicely
app.locals.formatDate = function(date) {
    if (!date) return '';
    const d = new Date(date);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Route 1: Display All Posts (Home page)
// Retrieves all posts, showing title (clickable), author, creation date (without full content)
app.get(['/', '/posts'], async (req, res) => {
    try {
        const posts = await postsCollection
            .find({}, { projection: { title: 1, author: 1, createdAt: 1 } })
            .sort({ createdAt: -1 })
            .toArray();

        res.render('posts', { posts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Server Error fetching posts');
    }
});

// Route 2: Display Create Post Form
app.get('/posts/new', (req, res) => {
    res.render('create', { error: null, title: '', author: '', content: '' });
});

// Route 3: Handle Post Creation
// Validates fields, automatically generates creation date on backend, inserts into MongoDB, redirects to /posts
app.post('/posts', async (req, res) => {
    try {
        const { title, content, author } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.render('create', {
                error: 'Title cannot be empty.',
                title: title || '',
                author: author || '',
                content: content || ''
            });
        }
        if (!content || !content.trim()) {
            return res.render('create', {
                error: 'Content cannot be empty.',
                title: title || '',
                author: author || '',
                content: content || ''
            });
        }
        if (!author || !author.trim()) {
            return res.render('create', {
                error: 'Author cannot be empty.',
                title: title || '',
                author: author || '',
                content: content || ''
            });
        }

        // Automatic backend date generation (ISO Date / timestamp)
        const newPost = {
            title: title.trim(),
            content: content.trim(),
            author: author.trim(),
            createdAt: new Date() // generated automatically by backend
        };

        await postsCollection.insertOne(newPost);
        res.redirect('/posts');
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).render('create', {
            error: 'Failed to create post. Please try again.',
            title: req.body.title || '',
            author: req.body.author || '',
            content: req.body.content || ''
        });
    }
});

// Route 4: View Individual Post
// Retrieves the post by unique MongoDB ObjectId and displays the complete post
app.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid Post ID format');
        }

        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('post', { post });
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).send('Server Error fetching post details');
    }
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        postsCollection = db.collection('posts');
        console.log(`Connected successfully to MongoDB database: ${DB_NAME}`);

        app.listen(PORT, () => {
            console.log(`Simple CMS server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

startServer();