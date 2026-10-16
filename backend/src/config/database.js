const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./env');

// Ensure data directory exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open or create SQLite database file
const db = new DatabaseSync(config.dbPath);

// Enable WAL mode & foreign keys for high performance and durability
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Initialize database schema and tables
 */
function initializeDatabase() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Inquiries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL COLLATE NOCASE,
      project_type TEXT NOT NULL,
      budget INTEGER DEFAULT 0,
      timeline TEXT DEFAULT '',
      project_brief TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      notes TEXT DEFAULT '',
      ip_address TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
  `);

  // Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      client TEXT NOT NULL,
      timeline TEXT NOT NULL,
      tools TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      image TEXT NOT NULL,
      challenge TEXT NOT NULL,
      solution TEXT NOT NULL,
      featured INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured, sort_order ASC);
  `);

  // Analytics / Telemetry Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);
  `);

  // Run initial seed checks
  seedInitialData();
}

/**
 * Seed initial admin user and default showcase projects if empty
 */
function seedInitialData() {
  // 1. Seed Superadmin if not exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(config.admin.email);
  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(config.admin.password, salt);
    const insertAdmin = db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, 'admin')
    `);
    insertAdmin.run(config.admin.name, config.admin.email, hash);
    console.log(`[Database] Seeded default superadmin: ${config.admin.email}`);
  }

  // 2. Seed Initial Portfolio Projects if empty
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectCount.count === 0) {
    const initialProjects = [
      {
        id: 'mustang-srt',
        title: 'Mustang SRT',
        category: 'Autodesk Maya',
        client: 'NeoWear Footwear',
        timeline: '3 Weeks',
        tools: 'Blender 4.2, Octane Render, Substance Painter, After Effects',
        deliverables: '30s 4K Commercial Spot, 9:16 Vertical Cuts, 5 Hero Stills',
        image: 'assets/images/car 3d model.jpg',
        challenge: 'Client required a photorealistic zero-gravity breakdown revealing the internal holographic cushioning mechanism without feeling clinical.',
        solution: 'Crafted intricate multi-layer procedural mesh materials in Blender, matched with micro-lighting reflections and dynamic particle turbulence in After Effects.',
        featured: 1,
        sort_order: 1
      },
      {
        id: 'tanker-3d-model',
        title: 'Tanker 3D Model',
        category: 'Autodesk Maya',
        client: 'Electric Arena Events',
        timeline: '2 Weeks',
        tools: 'Autodesk Maya, Arnold Render Engine, Adobe Photoshop',
        deliverables: '10 Stage Visual Loops, Main Promo Teaser, Kinetic Title Pack',
        image: 'assets/images/tanker 3d.jpg',
        challenge: 'Creating aggressive, audio-reactive 140BPM sync visuals that scale seamlessly to massive LED stadium stage walls.',
        solution: 'Developed custom frequency-driven parametric waveforms and kinetic typography displacement rigs synced frame-by-frame with the headliner track.',
        featured: 1,
        sort_order: 2
      },
      {
        id: 'boat-3d',
        title: 'Boat 3D',
        category: 'Autodesk Maya',
        client: 'Maison Noir Parfums',
        timeline: '2 Weeks',
        tools: 'Autodesk Maya, Substance 3D Painter, Adobe Photoshop',
        deliverables: '45s Brand Film, High-Res Print Stills, Social Teasers',
        image: 'assets/images/boat 3d.jpg',
        challenge: 'Simulating hyper-accurate caustics, liquid ripples, and micro-smoke refraction across an angular obsidian bottle design.',
        solution: 'Utilized spectral dispersion rendering with fluid dynamic simulations and customized film grain grading in DaVinci Resolve for a cinematic luxury feel.',
        featured: 1,
        sort_order: 3
      },
      {
        id: 'hypercar-c4d',
        title: 'Velocis Aerodynamic EV Supercar Reveal',
        category: '3D CGI & Product',
        client: 'Velocis Motors',
        timeline: '3.5 Weeks',
        tools: 'Cinema 4D, Unreal Engine 5.4, Substance 3D, Premiere Pro',
        deliverables: '60s Teaser Film, 360 Interactive Spin Assets, Billboard Stills',
        image: 'assets/images/project-hypercar.jpg',
        challenge: 'Highlighting aerodynamic airflow streaks and carbon fiber weaves under dynamic studio light sweeps.',
        solution: 'Constructed custom neon light curves and anisotropic carbon shaders, creating intense volumetric bounce off wet asphalt studio flooring.',
        featured: 1,
        sort_order: 4
      },
      {
        id: 'android-cgi',
        title: 'Kore-01 Cybernetic Persona Showcase',
        category: '3D Art & CGI',
        client: 'Aether Dynamics (Personal Spec)',
        timeline: '2 Weeks',
        tools: 'ZBrush, Blender, Octane, Photoshop',
        deliverables: '4K Cinematic Stills, Holographic Turnaround Loop',
        image: 'assets/images/project-android.jpg',
        challenge: 'Balancing organic human warmth with intricate internal micro-circuitry and iridescent ceramic armor plating.',
        solution: 'Hand-sculpted facial micro-pores in ZBrush, layered with thin-film optical interference shaders and internal fiber optic emission nodes.',
        featured: 1,
        sort_order: 5
      },
      {
        id: 'showreel-master',
        title: 'Tejashwini 2025/2026 Master Motion Showreel',
        category: 'Showreel / Master',
        client: 'Self / Global Clients',
        timeline: 'Ongoing',
        tools: 'Full Suite: Blender, C4D, Unreal Engine, Premiere, After Effects',
        deliverables: '90s 4K High-Energy Showreel with Bespoke Sound Design',
        image: 'assets/images/showreel-cover.jpg',
        challenge: 'Curating 50+ commercial spots into a unified, high-octane 90-second visual rhythm that proves versatile artistic range.',
        solution: 'Carefully paced beat-matching with seamless match-cuts, bespoke SFX risers, and curated color passes across all project reels.',
        featured: 1,
        sort_order: 6
      }
    ];

    const insertProject = db.prepare(`
      INSERT INTO projects (id, title, category, client, timeline, tools, deliverables, image, challenge, solution, featured, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of initialProjects) {
      insertProject.run(
        p.id,
        p.title,
        p.category,
        p.client,
        p.timeline,
        p.tools,
        p.deliverables,
        p.image,
        p.challenge,
        p.solution,
        p.featured,
        p.sort_order
      );
    }
    console.log(`[Database] Seeded ${initialProjects.length} initial portfolio projects.`);
  }
}

// Initialize tables immediately
initializeDatabase();

module.exports = db;
