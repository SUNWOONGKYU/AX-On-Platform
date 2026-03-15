// AX-On Platform — Shared Configuration
const AXON_CONFIG = {
  SUPABASE_URL: 'https://gifxpfdnnfwufzdncmor.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZnhwZmRubmZ3dWZ6ZG5jbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTE0NjIsImV4cCI6MjA4ODA4NzQ2Mn0.OzhTlF_kroJVd6uxJO5YPT-OGU7gHBE2kvY'
};

// Shared utility functions
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function isSafeUrl(url) {
  try { return /^https?:\/\//i.test(new URL(url).href); } catch { return false; }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateKoreanPhone(phone) {
  return /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone);
}
