const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
// Since SQLite is used locally but Prisma Client might be configured, 
// we will just check env vars and file permissions mainly.
// If using SQLite, we check if db file is writable.

async function runDiagnostics() {
  console.log("🚀 Starte SublyMaster System-Check...");
  console.log("--------------------------------------------------");

  // 1. Check: Umgebungsvariablen
  const requiredEnv = ['JWT_SECRET']; // Add others as needed
  const missingEnv = requiredEnv.filter(item => !process.env[item]);
  
  if (missingEnv.length > 0) {
    console.error("❌ FEHLER: Fehlende Umgebungsvariablen:", missingEnv.join(', '));
  } else {
    console.log("✅ Umgebungsvariablen (JWT_SECRET etc.) sind geladen.");
  }

  // 2. Check: Datenbank (SQLite file presence, write permissions)
  // For SQLite, just check if we can write to the directory.
  const dbPath = path.join(__dirname, 'backend', 'sublimaster.db'); 
  // Assuming SQLite is in backend folder as per previous context?
  // Actually index.js connects to './sublimaster.db' inside backend folder.
  
  console.log("ℹ️ Skipping Prisma Check for SQLite Dev setup (Backend manages it).");
  
  // 3. Check: Schreibrechte für Druck-Templates
  const publicPath = path.join(__dirname, 'frontend', 'public');
  const tmpPath = path.join(publicPath, 'temp_print');
  
  try {
    if (!fs.existsSync(publicPath)) {
         console.warn("⚠️ Public folder not found at expected path.");
    } else {
        if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });
        const testFile = path.join(tmpPath, 'perm_test.txt');
        fs.writeFileSync(testFile, 'Permission Check');
        fs.unlinkSync(testFile);
        console.log("✅ Schreibrechte im public/temp_print Ordner sind korrekt.");
    }
  } catch (e) {
    console.error("❌ FEHLER: Keine Schreibrechte im Verzeichnis!", e.message);
  }

  console.log("--------------------------------------------------");
  console.log("🏁 Diagnose beendet.");
}

runDiagnostics();
