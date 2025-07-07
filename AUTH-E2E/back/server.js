const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const startTime = new Date();
let requestCount = 0;

// Middleware pour compter les requêtes
app.use((req, res, next) => {
  requestCount++;
  next();
});

app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const currentTime = new Date();
  
  const healthStatus = {
    status: 'OK',
    timestamp: currentTime.toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime)
    },
    server: {
      name: 'AUTH-E2E API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    },
    metrics: {
      requestCount: requestCount,
      startTime: startTime.toISOString()
    }
  };

  res.status(200).json(healthStatus);
});


// Base de données simulée en mémoire pour les utilisateurs
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  }
];


app.get('/users', (req, res) => {
  const { limit, offset } = req.query;
  let result = users;

  if (offset) {
    result = result.slice(parseInt(offset));
  }

  if (limit) {
    result = result.slice(0, parseInt(limit));
  }

  res.json({
    users: result,
    total: users.length,
    limit: limit ? parseInt(limit) : users.length,
    offset: offset ? parseInt(offset) : 0
  });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  res.json(user);
});

app.post('/users', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Tous les champs sont requis',
      details: {
        username: !username ? 'Le nom d\'utilisateur est requis' : null,
        email: !email ? 'L\'email est requis' : null,
        password: !password ? 'Le mot de passe est requis' : null
      }
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Format d\'email invalide' 
    });
  }

  if (username.length < 3) {
    return res.status(400).json({ 
      error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' 
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ 
      error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores' 
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'Le mot de passe doit contenir au moins 8 caractères' 
    });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({ 
      error: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre' 
    });
  }

  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(409).json({ 
      error: 'Un utilisateur avec ce nom d\'utilisateur ou cet email existe déjà' 
    });
  }

  const newUser = {
    id: uuidv4(),
    username,
    email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);

  res.status(201).json(newUser);
});


// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

function formatUptime(uptime) {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  return `${hours}h ${minutes}m ${seconds}s`;
}


app.listen(PORT, () => {
  console.log(`🚀 API Express démarrée sur http://localhost:${PORT}`);
  console.log(`❤️  Route de santé: http://localhost:${PORT}/health`);
  console.log(`🔗 API Users: http://localhost:${PORT}/users`);
});

module.exports = app;
