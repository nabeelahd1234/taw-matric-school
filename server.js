const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'shakespeare-school-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '.')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
// Ensure upload directories exist
const uploadDir = path.join(__dirname, './public/uploads');
const galleryDir = path.join(uploadDir, 'gallery');
const teacherDir = path.join(uploadDir, 'teachers');
const studentDir = path.join(uploadDir, 'students');
const imageDir = path.join(__dirname, './public/images');

[uploadDir, galleryDir, teacherDir, studentDir, imageDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = uploadDir;
    if (req.body.type === 'gallery') dest = galleryDir;
    else if (req.body.type === 'teacher') dest = teacherDir;
    else if (req.body.type === 'student') dest = studentDir;
    else if (req.body.type === 'principal') dest = imageDir;
    else if (req.body.type === 'hero') dest = uploadDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Database helper
const DB_PATH = path.join(__dirname, './data/db.json');

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return {};
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Auth middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// Auth routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'shakespeare@123') {
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/admin/verify', verifyToken, (req, res) => {
  res.json({ valid: true });
});

// Generic CRUD endpoints
app.get('/api/data/:section', (req, res) => {
  const db = readDB();
  const { section } = req.params;
  res.json(db[section] || {});
});

app.put('/api/data/:section', verifyToken, (req, res) => {
  const db = readDB();
  const { section } = req.params;
  db[section] = req.body;
  writeDB(db);
  res.json({ success: true });
});

// Class Management endpoints
app.get('/api/classes', (req, res) => {
  const db = readDB();
  res.json(db.classes || []);
});

app.post('/api/classes', verifyToken, (req, res) => {
  const db = readDB();
  const newClass = { id: Date.now(), ...req.body };
  if (!db.classes) db.classes = [];
  db.classes.push(newClass);
  writeDB(db);
  res.json(newClass);
});

app.put('/api/classes/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.classes.findIndex(c => c.id === id);
  if (index !== -1) {
    db.classes[index] = { ...db.classes[index], ...req.body };
    writeDB(db);
    res.json(db.classes[index]);
  } else {
    res.status(404).json({ error: 'Class not found' });
  }
});

app.delete('/api/classes/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.classes = (db.classes || []).filter(c => c.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Syllabus endpoints
app.get('/api/syllabus', (req, res) => {
  const db = readDB();
  res.json(db.syllabus || []);
});

app.post('/api/syllabus', verifyToken, (req, res) => {
  const db = readDB();
  const newItem = { ...req.body, id: Date.now() };
  db.syllabus.push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.put('/api/syllabus/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.syllabus.findIndex(i => i.id === id);
  if (index !== -1) {
    db.syllabus[index] = { ...db.syllabus[index], ...req.body };
    writeDB(db);
    res.json(db.syllabus[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/syllabus/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.syllabus = db.syllabus.filter(i => i.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Gallery endpoints
app.get('/api/gallery', (req, res) => {
  const db = readDB();
  res.json(db.gallery || []);
});

app.post('/api/gallery', verifyToken, upload.single('image'), (req, res) => {
  const db = readDB();
  const filename = req.file ? `/uploads/gallery/${req.file.filename}` : req.body.filename;
  const newItem = {
    id: Date.now(),
    title: req.body.title,
    filename: filename,
    cat: req.body.cat
  };
  db.gallery.push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.put('/api/gallery/:id', verifyToken, upload.single('image'), (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.gallery.findIndex(i => i.id === id);
  if (index !== -1) {
    if (req.file) {
      const oldPath = path.join(__dirname, './public', db.gallery[index].filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      db.gallery[index].filename = `/uploads/gallery/${req.file.filename}`;
    }
    db.gallery[index].title = req.body.title;
    db.gallery[index].cat = req.body.cat;
    writeDB(db);
    res.json(db.gallery[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/gallery/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const item = db.gallery.find(i => i.id === id);
  if (item && item.filename && !item.filename.includes('default')) {
    const filePath = path.join(__dirname, './public', item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.gallery = db.gallery.filter(i => i.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Fees endpoints
app.get('/api/fees', (req, res) => {
  const db = readDB();
  res.json(db.fees || []);
});

app.post('/api/fees', verifyToken, (req, res) => {
  const db = readDB();
  const newItem = { ...req.body, id: Date.now() };
  db.fees.push(newItem);
  writeDB(db);
  res.json(newItem);
});

app.put('/api/fees/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.fees.findIndex(i => i.id === id);
  if (index !== -1) {
    db.fees[index] = { ...db.fees[index], ...req.body };
    writeDB(db);
    res.json(db.fees[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/fees/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.fees = db.fees.filter(i => i.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Announcements endpoints
app.get('/api/announcements', (req, res) => {
  const db = readDB();
  res.json(db.announcements || []);
});

app.post('/api/announcements', verifyToken, (req, res) => {
  const db = readDB();
  db.announcements.push(req.body.text);
  writeDB(db);
  res.json({ success: true });
});

app.put('/api/announcements/:index', verifyToken, (req, res) => {
  const db = readDB();
  const index = parseInt(req.params.index);
  if (db.announcements[index] !== undefined) {
    db.announcements[index] = req.body.text;
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/announcements/:index', verifyToken, (req, res) => {
  const db = readDB();
  const index = parseInt(req.params.index);
  db.announcements.splice(index, 1);
  writeDB(db);
  res.json({ success: true });
});

// Students endpoints
app.get('/api/students', (req, res) => {
  const db = readDB();
  res.json(db.students || []);
});

app.post('/api/students', verifyToken, upload.single('photo'), (req, res) => {
  const db = readDB();
  const student = {
    id: Date.now(),
    name: req.body.name,
    class: req.body.class,
    rollNo: req.body.rollNo,
    parentContact: req.body.parentContact,
    photo: req.file ? `/uploads/students/${req.file.filename}` : null
  };
  db.students.push(student);
  writeDB(db);
  res.json(student);
});

app.put('/api/students/:id', verifyToken, upload.single('photo'), (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.students.findIndex(s => s.id === id);
  if (index !== -1) {
    if (req.file) {
      const oldPath = path.join(__dirname, './public', db.students[index].photo || '');
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      db.students[index].photo = `/uploads/students/${req.file.filename}`;
    }
    db.students[index].name = req.body.name;
    db.students[index].class = req.body.class;
    db.students[index].rollNo = req.body.rollNo;
    db.students[index].parentContact = req.body.parentContact;
    writeDB(db);
    res.json(db.students[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/students/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const student = db.students.find(s => s.id === id);
  if (student && student.photo) {
    const filePath = path.join(__dirname, './public', student.photo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.students = db.students.filter(s => s.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Teachers endpoints
app.get('/api/teachers', (req, res) => {
  const db = readDB();
  res.json(db.teachers || []);
});

app.post('/api/teachers', verifyToken, upload.single('photo'), (req, res) => {
  const db = readDB();
  const teacher = {
    id: Date.now(),
    name: req.body.name,
    subject: req.body.subject,
    qualification: req.body.qualification,
    experience: req.body.experience,
    photo: req.file ? `/uploads/teachers/${req.file.filename}` : null
  };
  db.teachers.push(teacher);
  writeDB(db);
  res.json(teacher);
});

app.put('/api/teachers/:id', verifyToken, upload.single('photo'), (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const index = db.teachers.findIndex(t => t.id === id);
  if (index !== -1) {
    if (req.file) {
      const oldPath = path.join(__dirname, './public', db.teachers[index].photo || '');
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      db.teachers[index].photo = `/uploads/teachers/${req.file.filename}`;
    }
    db.teachers[index].name = req.body.name;
    db.teachers[index].subject = req.body.subject;
    db.teachers[index].qualification = req.body.qualification;
    db.teachers[index].experience = req.body.experience;
    writeDB(db);
    res.json(db.teachers[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/teachers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const teacher = db.teachers.find(t => t.id === id);
  if (teacher && teacher.photo) {
    const filePath = path.join(__dirname, './public', teacher.photo);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.teachers = db.teachers.filter(t => t.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// ── Timetable endpoints ──────────────────────────────────────────────────────

// FIX: Added missing base route — returns class list + all saved timetable keys.
// The old code only had /api/timetable/:classId, so fetching /api/timetable
// fell through to the page-router and returned an HTML 404, causing the
// "Unexpected token '<'" JSON parse error in timetable.html.
app.get('/api/timetable', (req, res) => {
  const db = readDB();
  res.json({
    classes: db.classes || [],
    timetable: db.timetable || {}
  });
});

// Get timetable for a specific class
app.get('/api/timetable/:classId', (req, res) => {
  const db = readDB();
  const classId = req.params.classId;
  const classTimetable = db.timetable?.[classId] || {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    periods: [],
    schedule: {}
  };
  res.json(classTimetable);
});

// Update timetable for a specific class
app.put('/api/timetable/:classId', verifyToken, (req, res) => {
  const db = readDB();
  const classId = req.params.classId;
  if (!db.timetable) db.timetable = {};
  db.timetable[classId] = req.body;
  writeDB(db);
  res.json({ success: true });
});

// ── Other endpoints ──────────────────────────────────────────────────────────
// Upload hero slide image
app.post('/api/upload/hero', verifyToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`
  });
});
// Upload principal photo
app.post('/api/upload/principal', verifyToken, upload.single('photo'), (req, res) => {
  const db = readDB();
  if (req.file) {
    db.principal.photo = `/images/${req.file.filename}`;
    writeDB(db);
    res.json({ photo: db.principal.photo });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({ success: true, message: 'Message received. We will contact you soon.' });
});

// ── Page routes ──────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/admin/admin', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/admin.html'));
});
app.get('/admin-academic.html', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/admin-academic.html'));
});
app.get('/admin-people.html', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/admin-people.html'));
});
app.get('/admin/students.html', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/students.html'));
});
app.get('/admin/teachers.html', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/teachers.html'));
});
app.get('/admin/gallery.html', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/gallery.html'));
});
// ── Website Pages admin routes (split from admin-pages.html) ──────────────────
const pagesDir = path.join(__dirname, './admin/');
const adminPageFiles = ['admin-home', 'admin-about', 'admin-principal', 'admin-vision', 'admin-achievements', 'admin-admissions', 'admin-rules'];
adminPageFiles.forEach(name => {
  app.get(`/admin/${name}.html`, (req, res) => {
    res.sendFile(path.join(pagesDir, `${name}.html`));
  });
});
// Legacy redirect — keep old bookmarks working
app.get('/admin-pages.html', (req, res) => {
  res.redirect(301, '/admin/admin-home.html');
});
app.get('/admin/admin-shared.js', (req, res) => {
  res.sendFile(path.join(__dirname, './admin/admin-shared.js'));
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  const validPages = ['index', 'about', 'principal', 'vision', 'achievements', 'rules-regulations', 'classes', 'teachers', 'syllabus', 'timetable', 'gallery', 'admissions', 'fees', 'contact', 'login'];
  if (validPages.includes(page) || validPages.includes(page.replace('.html', ''))) {
    const fileName = page.replace('.html', '') + '.html';
    res.sendFile(path.join(__dirname, './public', fileName));
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});