# *Dev API - Projet Fil Rouge*

Cette application est une API REST développée en **Node.js**, **Express**, **TypeScript**, **Prisma ORM**, avec gestion complète de l’authentification via **JWT (access + refresh tokens)**, un système de **bannissement**, et une **documentation Swagger**.

---

# 📦 **Installation**

- Cloner le repository
```bash
  git clone https://github.com/erwnn20/api-fil-rouge.git
  cd api-fil-rouge
```

- Installer les dependances
```bash
  npm install
```

- Copier le fichier `.env.example` en `.env` :
```bash
  cp .env.example .env
```
> Y definir les valeurs manquantes

- Generer la base de donnée
```bash
  npx prisma generate
  npx prisma migrate dev
```

---

# ▶️ **Lancement du projet**

### Mode développement
```bash
  npm run dev
```

### Mode production
```bash
  npm run build
  npm start
```

## 📚 Swagger

Disponible sur : http://localhost:3000/docs

---

# 🧪 **Tests**
Tests réalisé avec Jest.

- Tests de base
```bash
  npm test
```

- Tests avec détails
```bash
  npm run test:watch
```

- Couverture des tests
```bash
  npm run test:coverage
```

---

# 🔐 Fonctionnalités principales

- Authentification avec JWT access/refresh
- Système de role utilisateur et de bannissement
- CRUD sur les utilisateurs
- Documentation Swagger
- Tests Jest
