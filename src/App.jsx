import { useState, useEffect } from "react";
import { supabase } from './supabase.js';
import piexif from 'piexifjs';

/* ─── STYLES ─── */
const makeStyles = (dark) => `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inconsolata:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${dark ? "#0d1117" : "#f4f6f9"};
    --surface: ${dark ? "#161d27" : "#ffffff"};
    --surface2: ${dark ? "#1a2332" : "#eef1f5"};
    --border: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"};
    --orange: #00C27C; --orange-soft: rgba(0,194,124,0.1);
    --green: ${dark ? "#00e676" : "#00a152"}; --green-soft: rgba(0,230,118,0.1);
    --yellow: ${dark ? "#ffd600" : "#f9a825"}; --yellow-soft: rgba(255,214,0,0.1);
    --red: #ff1744; --red-soft: rgba(255,23,68,0.1);
    --blue: #448aff; --blue-soft: rgba(68,138,255,0.1);
    --gold: #ffab00; --gold-soft: rgba(255,171,0,0.1);
    --text: ${dark ? "#f0f0f0" : "#1a1a1a"};
    --text-muted: ${dark ? "rgba(240,240,240,0.4)" : "rgba(0,0,0,0.4)"};
    --nav-bg: ${dark ? "rgba(10,10,10,0.95)" : "rgba(244,242,238,0.95)"};
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; min-height: 100vh; transition: background 0.3s, color 0.3s; }

  /* LOGIN */
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: radial-gradient(ellipse at 60% 20%, rgba(0,194,124,0.06) 0%, transparent 60%); }
  .login-box { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 40px 36px; width: 100%; max-width: 420px; }
  .login-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
  .login-icon { width: 40px; height: 40px; background: var(--orange); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .login-brand { font-size: 22px; font-weight: 800; }
  .login-brand span { color: var(--orange); }
  .login-title { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
  .login-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 32px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .field input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 13px 16px; color: var(--text); font-family: 'Syne', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
  .field input:focus { border-color: var(--orange); }
  .field input::placeholder { color: var(--text-muted); }
  .login-btn { width: 100%; padding: 15px; background: var(--orange); border: none; border-radius: 12px; color: #fff; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .login-btn:hover { background: #ff8c00; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,194,124,0.3); }
  .login-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .login-error { background: var(--red-soft); border: 1px solid rgba(255,23,68,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: var(--red); margin-bottom: 16px; }

  /* NAV */
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--nav-bg); backdrop-filter: blur(12px); z-index: 100; gap: 10px; flex-wrap: wrap; }
  .nav-left { display: flex; align-items: center; gap: 10px; }
  .nav-brand { display: flex; align-items: center; gap: 8px; }
  .brand-icon { width: 30px; height: 30px; background: var(--orange); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .brand-name { font-size: 17px; font-weight: 800; }
  .brand-name span { color: var(--orange); }
  .resto-name-badge { font-size: 13px; color: var(--text-muted); padding: 4px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; }
  .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .role-superadmin { background: var(--gold-soft); color: var(--gold); border: 1px solid rgba(255,171,0,0.3); }
  .role-manager { background: var(--blue-soft); color: var(--blue); border: 1px solid rgba(68,138,255,0.2); }
  .role-employee { background: var(--green-soft); color: var(--green); border: 1px solid rgba(0,230,118,0.2); }
  .nav-right { display: flex; align-items: center; gap: 8px; }
  .user-name { font-size: 13px; color: var(--text-muted); }
  .theme-btn { width: 34px; height: 34px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .logout-btn { padding: 7px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-family: 'Syne', sans-serif; font-size: 12px; cursor: pointer; }
  .logout-btn:hover { border-color: var(--red); color: var(--red); }
  .nav-tabs { display: flex; background: var(--surface2); border-radius: 10px; padding: 3px; gap: 3px; border: 1px solid var(--border); flex-wrap: wrap; }
  .tab { padding: 6px 13px; border-radius: 7px; border: none; background: transparent; color: var(--text-muted); font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; position: relative; }
  .tab.active { background: var(--orange); color: #fff; }
  .tab-notif { position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; background: var(--red); border-radius: 50%; }

  /* MAIN */
  .main { flex: 1; padding: 32px 24px; max-width: 720px; margin: 0 auto; width: 100%; }
  .section-title { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--orange); font-weight: 600; margin-bottom: 20px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* SUPER ADMIN */
  .sa-hero { background: linear-gradient(135deg, rgba(255,171,0,0.08), rgba(0,194,124,0.08)); border: 1px solid rgba(255,171,0,0.2); border-radius: 20px; padding: 28px; margin-bottom: 28px; display: flex; align-items: center; gap: 16px; }
  .sa-hero-icon { font-size: 40px; }
  .sa-hero-title { font-size: 20px; font-weight: 800; color: var(--gold); margin-bottom: 4px; }
  .sa-hero-sub { font-size: 13px; color: var(--text-muted); }
  .sa-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 28px; }
  .sa-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; text-align: center; }
  .sa-stat-num { font-size: 28px; font-weight: 800; color: var(--orange); }
  .sa-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .resto-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .resto-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; transition: border-color 0.2s; }
  .resto-card:hover { border-color: var(--orange); }
  .resto-avatar { width: 46px; height: 46px; border-radius: 12px; background: var(--orange-soft); border: 1px solid rgba(0,194,124,0.2); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
  .resto-info { flex: 1; min-width: 0; }
  .resto-card-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .resto-card-meta { display: flex; gap: 8px; flex-wrap: wrap; }
  .resto-tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
  .tag-active { background: var(--green-soft); color: var(--green); }
  .tag-inactive { background: var(--red-soft); color: var(--red); }
  .tag-users { background: var(--blue-soft); color: var(--blue); }
  .tag-proofs { background: var(--orange-soft); color: var(--orange); }
  .resto-actions { display: flex; gap: 8px; }
  .btn-sm { padding: 7px 14px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid; transition: all 0.2s; }
  .btn-orange { background: var(--orange-soft); border-color: rgba(0,194,124,0.3); color: var(--orange); }
  .btn-orange:hover { background: var(--orange); color: #fff; }
  .btn-red { background: var(--red-soft); border-color: rgba(255,23,68,0.2); color: var(--red); }
  .btn-red:hover { background: rgba(255,23,68,0.2); }
  .btn-green { background: var(--green-soft); border-color: rgba(0,230,118,0.2); color: var(--green); }
  .add-resto-form { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-input { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-family: 'Syne', sans-serif; font-size: 13px; outline: none; width: 100%; transition: border-color 0.2s; }
  .form-input:focus { border-color: var(--orange); }
  .form-input::placeholder { color: var(--text-muted); }
  .add-btn { width: 100%; padding: 13px; background: var(--orange); border: none; border-radius: 10px; color: #fff; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 4px; }
  .add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* UPLOAD */
  .upload-zone { border: 2px dashed var(--border); border-radius: 16px; padding: 40px 24px; text-align: center; cursor: pointer; transition: all 0.25s; background: var(--surface); margin-bottom: 20px; position: relative; overflow: hidden; }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--orange); background: var(--orange-soft); }
  .upload-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
  .upload-sub { font-size: 13px; color: var(--text-muted); }
  .preview-wrap { position: relative; border-radius: 16px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); margin-bottom: 20px; }
  .preview-img { width: 100%; max-height: 300px; object-fit: contain; display: block; }
  .preview-change { position: absolute; bottom: 12px; right: 12px; padding: 8px 14px; background: rgba(0,0,0,0.7); border: 1px solid var(--border); border-radius: 8px; color: #fff; font-family: 'Syne', sans-serif; font-size: 12px; cursor: pointer; }
  .send-btn { width: 100%; padding: 16px; background: var(--orange); border: none; border-radius: 12px; color: #fff; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-bottom: 24px; }
  .send-btn:hover:not(:disabled) { background: #ff8c00; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,194,124,0.3); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .loading-bar { width: 100%; height: 3px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-bottom: 12px; }
  .loading-bar-inner { height: 100%; background: var(--orange); border-radius: 3px; animation: loadbar 1.5s ease-in-out infinite; }
  @keyframes loadbar { 0%{width:0%;margin-left:0} 50%{width:60%;margin-left:20%} 100%{width:0%;margin-left:100%} }
  .loading-text { text-align: center; font-size: 13px; color: var(--text-muted); margin-bottom: 24px; font-family: 'Inconsolata', monospace; }

  /* RECORDS */
  .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
  .status-ok { background: var(--green-soft); color: var(--green); border: 1px solid rgba(0,230,118,0.2); }
  .status-warn { background: var(--yellow-soft); color: var(--yellow); border: 1px solid rgba(255,214,0,0.2); }
  .status-alert { background: var(--red-soft); color: var(--red); border: 1px solid rgba(255,23,68,0.2); }
  .order-num { font-family: 'Inconsolata', monospace; font-size: 20px; font-weight: 500; color: var(--orange); }
  .order-num-label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
  .timestamp { font-family: 'Inconsolata', monospace; font-size: 13px; color: var(--green); background: var(--green-soft); padding: 4px 10px; border-radius: 6px; display: inline-block; }
  .filters-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { padding: 7px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; color: var(--text-muted); font-family: 'Syne', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .filter-btn.active { background: var(--orange-soft); border-color: var(--orange); color: var(--orange); }
  .search-row { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .search-input { flex: 1; min-width: 140px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-family: 'Inconsolata', monospace; font-size: 14px; outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--orange); }
  .search-input::placeholder { color: var(--text-muted); font-family: 'Syne', sans-serif; font-size: 13px; }
  .date-input { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-family: 'Inconsolata', monospace; font-size: 13px; outline: none; }
  .date-input::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1)" : "none"}; cursor: pointer; }
  .records-list { display: flex; flex-direction: column; gap: 10px; }
  .record-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: border-color 0.2s; }
  .record-item:hover { border-color: var(--orange); }
  .record-item.has-alert { border-color: rgba(255,23,68,0.3); }
  .record-thumb { width: 54px; height: 54px; border-radius: 10px; object-fit: cover; background: var(--surface2); flex-shrink: 0; }
  .record-info { flex: 1; min-width: 0; }
  .record-order { font-family: 'Inconsolata', monospace; font-size: 16px; color: var(--orange); font-weight: 500; }
  .record-meta { display: flex; gap: 8px; align-items: center; margin-top: 4px; flex-wrap: wrap; }
  .record-time { font-size: 11px; color: var(--text-muted); font-family: 'Inconsolata', monospace; }
  .record-author { font-size: 11px; color: var(--blue); background: var(--blue-soft); padding: 2px 8px; border-radius: 4px; }
  .record-status { font-size: 20px; flex-shrink: 0; }
  .empty-state { text-align: center; padding: 60px 24px; color: var(--text-muted); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }

  /* ALERTS */
  .alert-banner { background: var(--red-soft); border: 1px solid rgba(255,23,68,0.25); border-radius: 12px; padding: 14px 18px; margin-bottom: 12px; display: flex; align-items: flex-start; gap: 12px; animation: fadeUp 0.4s ease; }
  .alert-banner-icon { font-size: 20px; flex-shrink: 0; }
  .alert-banner-text { flex: 1; }
  .alert-banner-title { font-size: 14px; font-weight: 700; color: var(--red); margin-bottom: 4px; }
  .alert-banner-sub { font-size: 12px; color: var(--text-muted); }
  .alert-banner-close { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 0; }

  /* TEAM */
  .emp-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px 22px; margin-bottom: 12px; }
  .emp-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .emp-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; flex-shrink: 0; }
  .emp-avatar-ok { background: var(--green-soft); color: var(--green); }
  .emp-avatar-warn { background: var(--red-soft); color: var(--red); }
  .emp-name { font-size: 16px; font-weight: 700; }
  .emp-role { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .emp-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
  .emp-stat { background: var(--surface2); border-radius: 10px; padding: 12px; text-align: center; }
  .emp-stat-num { font-size: 22px; font-weight: 800; }
  .emp-stat-label { font-size: 10px; color: var(--text-muted); margin-top: 3px; text-transform: uppercase; }
  .emp-bar-wrap { margin-top: 14px; }
  .emp-bar-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
  .emp-bar-bg { height: 6px; background: var(--surface2); border-radius: 6px; overflow: hidden; }
  .emp-bar-fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
  .emp-warning { background: var(--red-soft); border: 1px solid rgba(255,23,68,0.2); border-radius: 10px; padding: 10px 14px; margin-top: 12px; font-size: 13px; color: var(--red); }

  /* ADMIN */
  .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; text-align: center; }
  .stat-num { font-size: 32px; font-weight: 800; color: var(--orange); }
  .stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .users-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .user-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .user-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
  .avatar-manager { background: var(--blue-soft); color: var(--blue); }
  .avatar-employee { background: var(--green-soft); color: var(--green); }
  .user-info { flex: 1; }
  .user-display { font-size: 15px; font-weight: 600; }
  .user-login { font-size: 12px; color: var(--text-muted); font-family: 'Inconsolata', monospace; margin-top: 2px; }
  .del-btn { padding: 6px 12px; background: var(--red-soft); border: 1px solid rgba(255,23,68,0.2); border-radius: 8px; color: var(--red); font-family: 'Syne', sans-serif; font-size: 12px; cursor: pointer; }
  .add-user-form { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-select { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: var(--text); font-family: 'Syne', sans-serif; font-size: 13px; outline: none; width: 100%; }
  .form-select option { background: var(--surface); }

  /* ABONNEMENT */
  .sub-wrap { max-width: 500px; margin: 0 auto; }
  .sub-active { background: var(--green-soft); border: 1px solid rgba(0,230,118,0.25); border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; }
  .sub-active-title { font-size: 16px; font-weight: 700; color: var(--green); }
  .sub-active-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .sub-card { background: var(--surface); border: 2px solid var(--orange); border-radius: 20px; padding: 32px; margin-bottom: 20px; position: relative; overflow: hidden; }
  .sub-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--orange), #ff8c00); }
  .sub-price { font-size: 48px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .sub-price span { font-size: 18px; color: var(--text-muted); font-weight: 400; }
  .sub-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
  .sub-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .sub-feature { display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .sub-feature-icon { width: 22px; height: 22px; background: var(--green-soft); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
  .sub-btn { width: 100%; padding: 16px; background: var(--orange); border: none; border-radius: 12px; color: #fff; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .sub-btn:hover { background: #ff8c00; transform: translateY(-1px); }
  .sub-note { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 12px; }
  .sub-inactive-banner { background: var(--orange-soft); border: 1px solid rgba(0,194,124,0.3); border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; font-size: 14px; display: flex; gap: 12px; align-items: flex-start; }
  .modal-del-btn { width: 100%; margin-top: 16px; padding: 12px; background: var(--red-soft); border: 1px solid rgba(255,23,68,0.2); border-radius: 10px; color: var(--red); font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }

  /* RESULT ROW */
  .result-row { display: flex; gap: 8px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
  .result-row:last-child { border-bottom: none; }
  .result-row-label { color: var(--text-muted); min-width: 100px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding-top: 2px; }
  .result-row-value { color: var(--text); line-height: 1.5; flex: 1; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; animation: scaleIn 0.2s ease; }
  @keyframes scaleIn { from{transform:scale(0.95)} to{transform:scale(1)} }
  .modal-header { padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); }
  .modal-close { width: 32px; height: 32px; background: var(--surface2); border: none; border-radius: 8px; color: var(--text); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .modal-img { width: 100%; max-height: 280px; object-fit: contain; background: var(--bg); }
  .modal-body { padding: 18px 22px; }

  @media (max-width: 520px) {
    .nav { padding: 10px 14px; }
    .main { padding: 20px 14px; }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid-3 { grid-template-columns: 1fr; }
    .stats-grid, .sa-stats { gap: 8px; }
    .stat-num, .sa-stat-num { font-size: 22px; }
    .emp-stats-row { grid-template-columns: repeat(2,1fr); }
    .user-name { display: none; }
    .sub-price { font-size: 36px; }
  }
`;

/* ─── DATA INITIALE ─── */
const INIT_DATA = {
  superadmin: { username: "seyana", password: "seyana060923" },
  restaurants: []
};
const fmtDate = (iso) => {
  const normalized = iso.endsWith('Z') ? iso : iso + 'Z';
  const d = new Date(normalized);
  const pad = n => String(n).padStart(2, '0');
  const offset = d.getTimezoneOffset() * -1;
  const local = new Date(d.getTime() + offset * 60000);
  return `${pad(local.getUTCDate())}/${pad(local.getUTCMonth()+1)}/${local.getUTCFullYear()} à ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}`;
};
const isoDay = (iso) => iso ? iso.slice(0, 10) : "";
const statusInfo = (s) => {
  if (s === "ok") return { label: "✅ Commande OK", cls: "status-ok" };
  if (s === "warning") return { label: "⚠️ Anomalie", cls: "status-warn" };
  return { label: "🚨 Alerte", cls: "status-alert" };
};

/* ─── ROOT ─── */
export default function ProofKit() {
  const [data, setData] = useState(INIT_DATA);
  const [session, setSession] = useState(() => {
  try {
    const saved = localStorage.getItem('proofkit_session');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}); // { type: "superadmin" } | { type: "resto", restoId, user }
  const [dark, setDark] = useState(true);

useEffect(() => {
  if (session) localStorage.setItem('proofkit_session', JSON.stringify(session));
  else localStorage.removeItem('proofkit_session');
}, [session]);
  const updateResto = (restoId, updater) => {
    setData(prev => ({
      ...prev,
      restaurants: prev.restaurants.map(r => r.id === restoId ? updater(r) : r)
    }));
  };

  useEffect(() => {
  if (!session?.restoId) return;
  const restoId = session.restoId;
  const refresh = () => {
    if (!localStorage.getItem('proofkit_session')) return;
    supabase.from('restaurants').select('subscribed').eq('id', restoId).single().then(({ data: r }) => {
      if (r) updateResto(restoId, prev => ({ ...prev, subscribed: r.subscribed }));
    });
  };
  refresh();
  document.addEventListener('visibilitychange', refresh);
  return () => document.removeEventListener('visibilitychange', refresh);
}, [session?.restoId]);

  if (!session) return <LoginScreen data={data} setData={setData} onLogin={setSession} dark={dark} setDark={setDark} />;
  if (session.type === "superadmin") return (
    <SuperAdminPanel data={data} setData={setData} onLogout={() => setSession(null)} dark={dark} setDark={setDark} />
  );

  const resto = data.restaurants.find(r => r.id === session.restoId);

if (!resto && session?.restoId) {
  supabase.from('restaurants').select('*').eq('id', session.restoId).single().then(({ data: r }) => {
    if (r) {
      setData(prev => ({ ...prev, restaurants: [...prev.restaurants, { id: r.id, name: r.name, emoji: "🍽️", subscribed: r.subscribed, users: [], records: [], alerts: [] }] }));
    } else {
      setSession(null);
    }
  });
  return <LoginScreen data={data} setData={setData} onLogin={setSession} dark={dark} setDark={setDark} />;
}
  return (
    <RestoApp
      resto={resto} user={session.user}
      updateResto={(updater) => updateResto(session.restoId, updater)}
      onLogout={() => setSession(null)}
      dark={dark} setDark={setDark}
    />
  );
}

/* ─── LOGIN ─── */
function LoginScreen({ data, setData, onLogin, dark, setDark }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  return (
    <>
      <style>{makeStyles(dark)}</style>
      <div className="login-wrap">
        <div className="login-box" style={{ maxWidth: 440 }}>
          <div className="login-logo">
            <img src="/logo.png" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "contain", background: "#fff" }} />
            <div className="login-brand">Proof<span>Kit</span></div>
            <button className="theme-btn" style={{ marginLeft: "auto" }} onClick={() => setDark(d => !d)}>{dark ? "☀️" : "🌙"}</button>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 12, padding: 4, gap: 4, marginBottom: 28, border: "1px solid var(--border)" }}>
            <button onClick={() => setMode("login")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", background: mode === "login" ? "var(--orange)" : "transparent", color: mode === "login" ? "#fff" : "var(--text-muted)", transition: "all 0.2s" }}>
              Connexion
            </button>
            <button onClick={() => setMode("register")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", background: mode === "register" ? "var(--orange)" : "transparent", color: mode === "register" ? "#fff" : "var(--text-muted)", transition: "all 0.2s" }}>
              Créer un compte
            </button>
          </div>

          {mode === "login"
            ? <LoginForm data={data} setData={setData} onLogin={onLogin} />
            : <RegisterForm data={data} setData={setData} onLogin={onLogin} />
          }
        </div>
      </div>
    </>
  );
}

/* ─── LOGIN FORM ─── */
function LoginForm({ data, setData, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    // Super admin
    if (email === data.superadmin.username && password === data.superadmin.password) {
      onLogin({ type: "superadmin" }); return;
    }
    // Cherche dans Supabase
    const { data: users } = await supabase
      .from('users')
      .select('*, restaurants(*)')
      .eq('email', email.trim())
      .eq('password', password)
      .single();

    if (users) {
      const resto = users.restaurants;
      const restoObj = {
        id: resto.id, name: resto.name, emoji: "🍽️",
        subscribed: resto.subscribed, users: [], records: [], alerts: []
      };
      const { data: freshResto } = await supabase.from('restaurants').select('subscribed').eq('id', resto.id).single();
      const restoObjFresh = { ...restoObj, subscribed: freshResto ? freshResto.subscribed : resto.subscribed };
      setData(prev => {
        const exists = prev.restaurants.find(r => r.id === resto.id);
        if (exists) return prev;
        return { ...prev, restaurants: [...prev.restaurants, restoObjFresh] };
      });
      onLogin({ type: "resto", restoId: resto.id, user: { id: users.id, email: users.email, name: users.name, role: users.role, username: users.email } });
      return;
    }
    setError("Email ou mot de passe incorrect.");
  };

  return (
    <>
      <div className="login-title">Bon retour 👋</div>
      <div className="login-sub" style={{ marginBottom: 24 }}>Connectez-vous à votre espace restaurant</div>
      {error && <div className="login-error">{error}</div>}
      <div className="field"><label>Email</label><input type="email" placeholder="votre@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && submit()} /></div>
      <div className="field"><label>Mot de passe</label><input type="password" placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && submit()} /></div>
      <button className="login-btn" onClick={submit} disabled={!email || !password}>Se connecter →</button>
    </>
  );
}

/* ─── REGISTER FORM ─── */
function RegisterForm({ data, setData, onLogin }) {
  const [restoName, setRestoName] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [managerName, setManagerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!restoName || !managerName || !email || !password) { setError("Tous les champs sont obligatoires."); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);

    // Vérifie email unique dans Supabase
    const { data: existing } = await supabase.from('users').select('id').eq('email', email.trim()).maybeSingle();
    if (existing) { setError("Cet email est déjà utilisé."); setLoading(false); return; }

    // Crée le restaurant
    const { data: restoData, error: restoError } = await supabase
      .from('restaurants')
      .insert([{ name: restoName, email: email.trim(), password, subscribed: false }])
      .select().single();

    if (restoError) { setError("Erreur lors de la création. Réessaie."); setLoading(false); return; }

    // Crée le manager
    const { data: userData } = await supabase
      .from('users')
      .insert([{ restaurant_id: restoData.id, name: managerName, email: email.trim(), username: email.trim(), password, role: "manager" }])
      .select().single();

    const user = { id: userData.id, email: email.trim(), username: email.trim(), password, name: managerName, role: "manager" };
    const newResto = { id: restoData.id, name: restoName, emoji: "🍽️", subscribed: false, users: [user], records: [], alerts: [] };
    setData(prev => ({ ...prev, restaurants: [...prev.restaurants, newResto] }));
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'welcome', email: email.trim(), name: managerName, restoName })
    });
    onLogin({ type: "resto", restoId: restoData.id, user });
    setLoading(false);
  };

  return (
    <>
      <div className="login-title">Créer votre espace 🚀</div>
      <div className="login-sub" style={{ marginBottom: 24 }}>Inscrivez votre restaurant — gratuit pour commencer</div>
      {error && <div className="login-error">{error}</div>}

      <div className="field"><label>Nom du restaurant</label><input placeholder="Ex : Le Bistrot du Coin" value={restoName} onChange={e => { setRestoName(e.target.value); setError(""); }} /></div>
      <div className="field"><label>Votre prénom</label><input placeholder="Ex : Marc" value={managerName} onChange={e => { setManagerName(e.target.value); setError(""); }} /></div>
      <div className="field"><label>Email</label><input type="email" placeholder="votre@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} /></div>
      <div className="field"><label>Mot de passe</label><input type="password" placeholder="Minimum 6 caractères" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} /></div>
      <div className="field"><label>Confirmer le mot de passe</label><input type="password" placeholder="••••••••" value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && submit()} /></div>

      <button className="login-btn" onClick={submit} disabled={loading || !restoName || !email || !password}>
        {loading ? "Création en cours..." : "Créer mon espace gratuitement →"}
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
        Sans engagement · 7 jours d'essai gratuit
      </div>
    </>
  );
}

/* ─── SUPER ADMIN PANEL ─── */
function SuperAdminPanel({ data, setData, onLogout, dark, setDark }) {
  const [tab, setTab] = useState("restos");
useEffect(() => {
  const loadRestos = async () => {
    const { data: restos } = await supabase.from('restaurants').select('*');
    if (restos) {
      const formatted = restos.map(r => ({
        id: r.id, name: r.name, emoji: "🍽️",
        subscribed: r.subscribed, users: [], records: [], alerts: []
      }));
      setData(prev => ({ ...prev, restaurants: formatted }));
    }
  };
  loadRestos();
}, []);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🍽️");
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const totalProofs = data.restaurants.reduce((s, r) => s + r.records.length, 0);
  const activeRestos = data.restaurants.filter(r => r.subscribed).length;

  const addResto = () => {
    if (!newName || !newUser || !newPass) return;
    const id = "r" + Date.now();
    setData(prev => ({
      ...prev,
      restaurants: [...prev.restaurants, {
        id, name: newName, emoji: newEmoji, subscribed: false,
        users: [{ id: id + "-u1", username: newUser, password: newPass, name: newName, role: "manager" }],
        records: [], alerts: []
      }]
    }));
    setNewName(""); setNewEmoji("🍽️"); setNewUser(""); setNewPass("");
  };

  const toggleSub = async (id) => {
    const resto = data.restaurants.find(r => r.id === id);
    const newSubscribed = !resto.subscribed;
    await supabase.from('restaurants').update({ subscribed: newSubscribed }).eq('id', id);
    if (newSubscribed) {
      const { data: users } = await supabase.from('users').select('*').eq('restaurant_id', id).eq('role', 'manager').single();
      if (users) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'subscription_activated', email: users.email, name: users.name, restoName: resto.name })
        });
      }
    }
    setData(prev => ({
      ...prev,
      restaurants: prev.restaurants.map(r => r.id === id ? { ...r, subscribed: newSubscribed } : r)
    }));
  };

const deleteResto = async (id) => {
  await supabase.from('records').delete().eq('restaurant_id', id);
  await supabase.from('users').delete().eq('restaurant_id', id);
  await supabase.from('restaurants').delete().eq('id', id);
  setData(prev => ({ ...prev, restaurants: prev.restaurants.filter(r => r.id !== id) }));
};

  return (
    <>
      <style>{makeStyles(dark)}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-left">
            <div className="nav-brand"><div className="brand-icon">📸</div><div className="brand-name">Proof<span>Kit</span></div></div>
            <span className="role-badge role-superadmin">⭐ Super Admin</span>
          </div>
          <div className="nav-tabs">
            <button className={`tab ${tab === "restos" ? "active" : ""}`} onClick={() => setTab("restos")}>Restaurants</button>
          </div>
          <div className="nav-right">
            <button className="theme-btn" onClick={() => setDark(d => !d)}>{dark ? "☀️" : "🌙"}</button>
            <button className="logout-btn" onClick={onLogout}>Déco</button>
          </div>
        </nav>
        <main className="main">
          <div className="sa-hero">
            <div className="sa-hero-icon">🏢</div>
            <div>
              <div className="sa-hero-title">Panel Super Admin</div>
              <div className="sa-hero-sub">Gérez tous vos restaurants clients depuis cet espace.</div>
            </div>
          </div>
          <div className="sa-stats">
            <div className="sa-stat"><div className="sa-stat-num">{data.restaurants.length}</div><div className="sa-stat-label">Restaurants</div></div>
            <div className="sa-stat"><div className="sa-stat-num" style={{ color: "var(--green)" }}>{activeRestos}</div><div className="sa-stat-label">Abonnés actifs</div></div>
            <div className="sa-stat"><div className="sa-stat-num">{totalProofs}</div><div className="sa-stat-label">Preuves totales</div></div>
          </div>
          <div className="section-title">Tous les restaurants</div>
          <div className="resto-list">
            {data.restaurants.map(r => (
              <div key={r.id} className="resto-card">
                <div className="resto-avatar">{r.emoji}</div>
                <div className="resto-info">
                  <div className="resto-card-name">{r.name}</div>
                  <div className="resto-card-meta">
                    <span className={`resto-tag ${r.subscribed ? "tag-active" : "tag-inactive"}`}>{r.subscribed ? "✅ Abonné" : "❌ Inactif"}</span>
                    <span className="resto-tag tag-users">👥 {r.users.length} utilisateurs</span>
                    <span className="resto-tag tag-proofs">📸 {r.records.length} preuves</span>
                  </div>
                </div>
                <div className="resto-actions">
                  <button className={`btn-sm ${r.subscribed ? "btn-red" : "btn-green"}`} onClick={() => toggleSub(r.id)}>
                    {r.subscribed ? "Désactiver" : "Activer"}
                  </button>
                  <button className="btn-sm btn-red" onClick={() => deleteResto(r.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ marginTop: 32 }}>Ajouter un restaurant</div>
          <div className="add-resto-form">
            <div className="form-grid-3">
              <input className="form-input" placeholder="Nom du restaurant" value={newName} onChange={e => setNewName(e.target.value)} />
              <input className="form-input" placeholder="Emoji (🍕 🍜 🍷...)" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} />
              <input className="form-input" placeholder="Identifiant manager" value={newUser} onChange={e => setNewUser(e.target.value)} />
            </div>
            <input className="form-input" placeholder="Mot de passe manager" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ marginBottom: 12 }} />
            <button className="add-btn" onClick={addResto} disabled={!newName || !newUser || !newPass}>+ Créer le restaurant</button>
          </div>
        </main>
      </div>
    </>
  );
}

/* ─── RESTO APP ─── */
function RestoApp({ resto, user, updateResto, onLogout, dark, setDark }) {
  const tabs = user.role === "manager"
    ? ["Capturer", "Preuves", "Alertes", "Équipe", "Admin", "Abonnement"]
    : ["Capturer", "Preuves", "Alertes"];
  const [activeTab, setActiveTab] = useState("Capturer");
useEffect(() => {
  const loadRecords = async () => {
    const { data } = await supabase
      .from('records')
      .select('*')
      .eq('restaurant_id', resto.id)
      .order('timestamp', { ascending: false });
    if (data && data.length > 0) {
      const formatted = data.map(r => ({
        ...r,
        imgSrc: r.img_src,
        img_src_2: r.img_src_2,
        img_b64: r.img_b64,
        img_b64_2: r.img_b64_2,
        authorId: r.author_id,
        id: r.id
      }));
      updateResto(r => ({ ...r, records: formatted }));
const { data: usersData } = await supabase.from('users').select('*').eq('restaurant_id', resto.id);
if (usersData) updateResto(r => ({ ...r, users: usersData }));
    }
  };
  loadRecords();
}, []);
  const unseenAlerts = resto.alerts.filter(a => !a.seenBy.includes(user.id));

  const addRecord = (record) => {
    updateResto(r => {
      const newRecord = { ...record, id: Date.now(), author: user.name, authorId: user.id };
      const newAlerts = record.status !== "ok"
        ? [...r.alerts, { id: Date.now() + 1, record: newRecord, seenBy: [user.id] }]
        : r.alerts;
      return { ...r, records: [newRecord, ...r.records], alerts: newAlerts };
    });
  };

  const dismissAlert = (id) => updateResto(r => ({ ...r, alerts: r.alerts.filter(a => a.id !== id) }));
  const setRecords = (fn) => updateResto(r => ({ ...r, records: typeof fn === "function" ? fn(r.records) : fn }));
  const setUsers = (fn) => updateResto(r => ({ ...r, users: typeof fn === "function" ? fn(r.users) : fn }));
  const setSubscribed = (val) => updateResto(r => ({ ...r, subscribed: val }));

  return (
    <>
      <style>{makeStyles(dark)}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-left">
            <div className="nav-brand"><img src="/logo.png" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "contain", background: "#fff" }} /><div className="brand-name">Proof<span>Kit</span></div></div>
            <span className="resto-name-badge">{resto.emoji} {resto.name}</span>
            <span className={`role-badge ${user.role === "manager" ? "role-manager" : "role-employee"}`}>{user.role === "manager" ? "Manager" : "Employé"}</span>
          </div>
          <div className="nav-tabs">
            {tabs.map(t => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                {t}
                {t === "Alertes" && unseenAlerts.length > 0 && <span className="tab-notif" />}
                {t === "Abonnement" && !resto.subscribed && <span className="tab-notif" style={{ background: "var(--orange)" }} />}
              </button>
            ))}
          </div>
          <div className="nav-right">
            <span className="user-name">{user.name}</span>
            <button className="theme-btn" onClick={() => setDark(d => !d)}>{dark ? "☀️" : "🌙"}</button>
            <button className="logout-btn" onClick={onLogout}>Déco</button>
          </div>
        </nav>
        <main className="main">
          {activeTab === "Capturer" && <CaptureView currentUser={user} restoId={resto.id} addRecord={addRecord} 
subscribed={resto.subscribed} setActiveTab={setActiveTab} />}
          {activeTab === "Preuves" && <RecordsView records={resto.records} setRecords={setRecords} currentUser={user} dark={dark} />}
          {activeTab === "Alertes" && <AlertsView alerts={resto.alerts} dismissAlert={dismissAlert} currentUser={user} />}
          {activeTab === "Équipe" && user.role === "manager" && <TeamView users={resto.users} records={resto.records} />}
         {activeTab === "Admin" && user.role === "manager" && <AdminView users={resto.users} setUsers={setUsers} records={resto.records} restoId={resto.id} subscribed={resto.subscribed} />}
          {activeTab === "Abonnement" && user.role === "manager" && <SubscriptionView subscribed={resto.subscribed} setSubscribed={setSubscribed} setActiveTab={setActiveTab} user={user} restoId={resto.id} />}
        </main>
        {activeTab !== "Capturer" && activeTab !== "Admin" && activeTab !== "Abonnement" && (
          <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 150 }}>
            <label style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--orange)", border: "5px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 24px rgba(0,194,124,0.5)", cursor: "pointer", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => { if(e.target.files[0]) { setActiveTab("Capturer"); setTimeout(() => window.dispatchEvent(new CustomEvent("quickCapture", { detail: e.target.files[0] })), 100); } }} />
              📷
            </label>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── CAPTURE VIEW ─── */
function CaptureView({ currentUser, restoId, addRecord, subscribed, setActiveTab }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgFile, setImgFile] = useState(null);
const [imgFile2, setImgFile2] = useState(null);
const [imgSrc2, setImgSrc2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [drag, setDrag] = useState(false);
useEffect(() => {
  const handler = (e) => handleFile(e.detail);
  window.addEventListener("quickCapture", handler);
  return () => window.removeEventListener("quickCapture", handler);
}, []);
const [dailyCount, setDailyCount] = useState(0);
useEffect(() => {
  const checkDaily = async () => {
    const today = new Date().toISOString().slice(0,10);
    const { count } = await supabase.from('records').select('*', { count: 'exact' }).eq('restaurant_id', restoId).gte('timestamp', today + 'T00:00:00').lte('timestamp', today + 'T23:59:59');
    setDailyCount(count || 0);
  };
  if (!subscribed) checkDaily();
}, [subscribed]);

const handleFile = (file) => {
    if (!file) return;
    setImgFile(file); setDone(false);
    const r = new FileReader();
    r.onload = e => setImgSrc(e.target.result);
    r.readAsDataURL(file);
  };

  const handleFile2 = (file) => {
    if (!file) return;
    setImgFile2(file);
    const r = new FileReader();
    r.onload = e => setImgSrc2(e.target.result);
    r.readAsDataURL(file);
  };
const uploadToSupabase = async (file, timestamp) => {
  const ext = file.type.includes('png') ? 'png' : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('proofs')
    .upload(fileName, file, { contentType: file.type });
  if (error) return null;
  const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(fileName);
  return urlData.publicUrl;
};
const compressImage = (file) => new Promise((resolve) => {
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.onload = () => {
    const maxSize = 1024;
    let w = img.width, h = img.height;
    if (w > maxSize || h > maxSize) {
      if (w > h) { h = h * maxSize / w; w = maxSize; }
      else { w = w * maxSize / h; h = maxSize; }
    }
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.7);
  };
  img.src = URL.createObjectURL(file);
});
const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const fixExifDate = (base64Img, timestamp) => {
  try {
    const dateObj = new Date(timestamp);
    const pad = n => String(n).padStart(2, '0');
    const exifDate = `${dateObj.getFullYear()}:${pad(dateObj.getMonth()+1)}:${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
    const exifObj = { "0th": {}, "Exif": {} };
    exifObj["0th"][piexif.ImageIFD.DateTime] = exifDate;
    exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = exifDate;
    exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized] = exifDate;
    const exifStr = piexif.dump(exifObj);
    return piexif.insert(exifStr, base64Img);
  } catch {
    return base64Img;
  }
};

  const handleSubmit = async () => {
    if (!imgFile) return;
    setLoading(true);
   const timestamp = new Date().toISOString();
    let record;
    try {
const compressed = await compressImage(imgFile);
const b64 = await toBase64(compressed);
let uploadedUrl = null;
try {
  uploadedUrl = await uploadToSupabase(imgFile, timestamp);
} catch(e) {
  console.error("Upload error:", e);
}
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: [
           { type: "image", source: { type: "base64", media_type: imgFile.type || "image/jpeg", data: b64 } },
...(imgFile2 ? [{ type: "image", source: { type: "base64", media_type: imgFile2.type || "image/jpeg", data: await toBase64(await compressImage(imgFile2)) } }] : []),
            { type: "text", text: `Tu es un système d'analyse de commandes restaurant de livraison (Uber Eats, Deliveroo, Just Eat, etc).

Analyse cette photo de ticket et réponds UNIQUEMENT en JSON valide sans markdown :
{"order_number":"numéro de commande","status":"ok|warning|alert","anomaly":"description anomalie ou null","items_detected":"liste des articles visibles","confidence":"high|medium|low"}

PRIORITÉ ABSOLUE — trouve le numéro de commande :
- Sur Uber Eats français : code 5 caractères en GROS dans un rectangle noir en haut (ex: DD31E, 9EE80, AB12C)
- Avec un # devant en gros caractères (ex: #255D5, #9E273) — retourne le numéro SANS le #, donc "255D5" et non "#255D5"
- "Order # XXXXXX" ou "Uber Eats #XXXXX"
- Code alphanumérique 5 caractères mélangant lettres et chiffres juste sous le numéro de téléphone (ex: 68F37, AB12C) — c'est CE code qui est le numéro de commande, pas "OF 23" qui est un numéro d'ordre interne
- Code alphanumérique court en évidence en haut du ticket
- IGNORE "OF XX" ou "OF XXX" — ce n'est jamais le numéro de commande
- Lis attentivement même si la photo est de travers ou froissée
Si tu vois un code alphanumérique 5 caractères, c'est FORCÉMENT le numéro de commande.` }
          ]}]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
      const fixedImg = fixExifDate(imgSrc, timestamp);
record = { ...parsed, timestamp, imgSrc: uploadedUrl || fixedImg };
    } catch(e) {
      record = { order_number: null, status: "warning", anomaly: "Erreur: " + e.message, items_detected: null, confidence: "low", timestamp, imgSrc };
    }
    const imgSrc2Url = imgFile2 ? (await uploadToSupabase(imgFile2, timestamp)) : null;
await supabase.from('records').insert([{
  restaurant_id: restoId,
  author: currentUser.name,
  author_id: currentUser.id,
  order_number: record.order_number,
  status: record.status,
  anomaly: record.anomaly,
  items_detected: record.items_detected,
  confidence: record.confidence,
  img_src: record.imgSrc,
  img_src_2: imgSrc2Url,
  timestamp: record.timestamp
}]);
addRecord({ ...record, img_src_2: imgSrc2Url, imgSrc2: imgSrc2Url });
if (!subscribed) setDailyCount(prev => prev + 1);
    setLoading(false); setDone(true);
    setTimeout(() => { setActiveTab("Preuves"); setImgSrc(null); setImgFile(null); setDone(false); }, 1200);
  };


if (!subscribed && currentUser.role !== "manager") return (
    <div className="empty-state"><div className="empty-icon">🔒</div><div style={{ marginBottom: 8 }}>Abonnement requis</div><div style={{ fontSize: 13 }}>Demande au manager d'activer l'abonnement.</div></div>
  );

  return (
    <>
      {!subscribed && currentUser.role === "manager" && (
        <div className="sub-inactive-banner">
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div><strong>Abonnement inactif</strong> — Mode démo. <span style={{ color: "var(--orange)", cursor: "pointer", marginLeft: 6 }} onClick={() => setActiveTab("Abonnement")}>Activer →</span></div>
        </div>
      )}
      <div className="section-title">Nouvelle commande — {currentUser.name}</div>
      {!imgSrc ? (
        <>
        <div className={`upload-zone ${drag ? "drag" : ""}`}
          onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}>
          <input type="file" accept="image/*" capture="environment" onChange={e => handleFile(e.target.files[0])} />
          <div className="upload-icon">📷</div>
          <div className="upload-title">Prendre une photo</div>
          <div className="upload-sub">ou glisser une image ici</div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <label style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 24px rgba(0,194,124,0.5)", border:"5px solid rgba(255,255,255,0.15)", transition: "transform 0.15s" }}>
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <span style={{ fontSize: 36 }}>📷</span>
          </label>
        </div>
        </>
      ) : (
        <>
          <div className="preview-wrap">
            <img src={imgSrc} alt="preview" className="preview-img" />
            {!loading && !done && <button className="preview-change" onClick={() => { setImgSrc(null); setImgFile(null); }}>Changer</button>}
          </div>
{!imgSrc2 && !loading && !done && (
  <div className="upload-zone" style={{ marginBottom: 12, padding: 20 }}>
    <input type="file" accept="image/*" capture="environment" onChange={e => handleFile2(e.target.files[0])} />
    <div style={{ fontSize: 14, fontWeight: 700 }}>📎 Ajouter une 2ème photo</div>
  </div>
)}
{imgSrc2 && (
  <div className="preview-wrap" style={{ marginBottom: 12 }}>
    <img src={imgSrc2} alt="preview 2" className="preview-img" />
    {!loading && !done && <button className="preview-change" onClick={() => { setImgSrc2(null); setImgFile2(null); }}>Supprimer</button>}
  </div>
)}
          {loading && (<><div className="loading-bar"><div className="loading-bar-inner" /></div><div className="loading-text">Analyse en cours · Horodatage...</div></>)}
          {done && <div style={{ textAlign: "center", padding: "16px 0", fontSize: 15, color: "var(--green)", fontWeight: 700 }}>✅ Preuve envoyée — redirection...</div>}
          {!loading && !done && <button className="send-btn" onClick={handleSubmit} disabled={!subscribed && dailyCount >= 10}>📤 Envoyer</button>}
{!subscribed && dailyCount >= 10 && <div style={{textAlign:"center", color:"var(--red)", fontSize:13, marginBottom:12}}>🔒 Limite de 10 photos/jour atteinte — <span style={{color:"var(--orange)", cursor:"pointer"}} onClick={() => setActiveTab("Abonnement")}>S'abonner →</span></div>}
        </>
      )}
    </>
  );
}

/* ─── RECORDS VIEW ─── */
function RecordsView({ records, setRecords, currentUser, dark }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = records.filter(r => {
    const matchSearch = !search || (r.order_number && r.order_number.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "tous" || r.status === filter;
    const day = isoDay(r.timestamp);
    return matchSearch && matchFilter && (!dateFrom || day >= dateFrom) && (!dateTo || day <= dateTo);
  });

const deleteRecord = async (id) => {
  await supabase.from('records').delete().eq('id', id);
  setRecords(prev => prev.filter(r => r.id !== id));
  setSelected(null);
};

  return (
    <>
      <div className="section-title">Toutes les preuves ({records.length})</div>
      <div className="search-row">
        <input className="search-input" placeholder="# de commande..." value={search} onChange={e => setSearch(e.target.value)} />
        <input className="date-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input className="date-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>
      <div className="filters-row">
        {["tous","ok","warning","alert"].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "tous" ? "Tous" : f === "ok" ? "✅ OK" : f === "warning" ? "⚠️ Anomalie" : "🚨 Alerte"}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📂</div><div>Aucune preuve trouvée.</div></div>
      ) : (
        <div className="records-list">
          {filtered.map(r => (
            <div key={r.id} className={`record-item ${r.status !== "ok" ? "has-alert" : ""}`} onClick={() => setSelected(r)}>
              <img src={r.imgSrc} alt="" className="record-thumb" />
              <div className="record-info">
                <div className="record-order">{r.order_number || "# Non détecté"}</div>
                <div className="record-meta">
                  <span className="record-time">{fmtDate(r.timestamp)}</span>
                  <span className="record-author">👤 {r.author}</span>
                </div>
              </div>
              <div className="record-status">{r.status === "ok" ? "✅" : r.status === "warning" ? "⚠️" : "🚨"}</div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><div className="order-num-label">Commande</div><div className="order-num">{selected.order_number || "Non détecté"}</div></div>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <img src={selected.imgSrc} alt="preuve" className="modal-img" />
{selected.img_src_2 && <img src={selected.img_src_2} alt="preuve 2" className="modal-img" style={{ borderTop: "1px solid var(--border)" }} />}
            <div className="modal-body">
              <div className="result-row"><span className="result-row-label">Statut</span><span className={`status-badge ${statusInfo(selected.status).cls}`}>{statusInfo(selected.status).label}</span></div>
              <div className="result-row"><span className="result-row-label">Horodatage</span><span className="timestamp">{fmtDate(selected.timestamp)}</span></div>
              <div className="result-row"><span className="result-row-label">Pris par</span><span className="result-row-value">{selected.author}</span></div>
              {selected.items_detected && <div className="result-row"><span className="result-row-label">Articles</span><span className="result-row-value">{selected.items_detected}</span></div>}
              {selected.anomaly && <div className="result-row"><span className="result-row-label">Anomalie</span><span className="result-row-value" style={{ color: "var(--yellow)" }}>{selected.anomaly}</span></div>}
             <button className="modal-del-btn" style={{ background: "var(--blue-soft)", borderColor: "rgba(68,138,255,0.2)", color: "var(--blue)", marginTop: 8 }} onClick={async () => {
  try {
    const date = new Date(selected.timestamp).toISOString().slice(0,10);
    const src2 = selected.img_src_2 || selected.imgSrc2;
    const dl = async (url, filename) => {
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&timestamp=${encodeURIComponent(selected.timestamp)}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    };
    await dl(selected.imgSrc, `commande-${selected.order_number || "inconnu"}-${date}.jpg`);
    if (src2) {
      await new Promise(r => setTimeout(r, 1000));
      await dl(src2, `commande-${selected.order_number || "inconnu"}-${date}-2.jpg`);
    }
  } catch(e) {
    alert("Erreur : " + e.message);
  }
}}>📥 Télécharger la preuve</button>
{currentUser.role === "manager" && <button className="modal-del-btn" onClick={() => deleteRecord(selected.id)}>🗑 Supprimer</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── ALERTS VIEW ─── */
function AlertsView({ alerts, dismissAlert, currentUser }) {
  const visible = alerts.filter(a => !a.seenBy.includes(currentUser.id) || currentUser.role === "manager");
  return (
    <>
      <div className="section-title">Alertes en temps réel</div>
      {visible.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✅</div><div>Aucune alerte — tout est OK !</div></div>
      ) : visible.map(a => (
        <div key={a.id} className="alert-banner">
          <div className="alert-banner-icon">{a.record.status === "alert" ? "🚨" : "⚠️"}</div>
          <div className="alert-banner-text">
            <div className="alert-banner-title">{a.record.status === "alert" ? "Alerte critique" : "Anomalie"} — Commande {a.record.order_number || "inconnue"}</div>
            <div className="alert-banner-sub">Par {a.record.author} · {fmtDate(a.record.timestamp)}{a.record.anomaly && ` · ${a.record.anomaly}`}</div>
          </div>
          <button className="alert-banner-close" onClick={() => dismissAlert(a.id)}>×</button>
        </div>
      ))}
    </>
  );
}

/* ─── TEAM VIEW ─── */
function TeamView({ users, records }) {
  const employees = users.filter(u => u.role === "employee");
  const today = new Date().toISOString().slice(0, 10);
  const thisWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); })();

  const getStats = (userId) => {
    const all = records.filter(r => r.authorId === userId);
    return { total: all.length, today: all.filter(r => isoDay(r.timestamp) === today).length, week: all.filter(r => isoDay(r.timestamp) >= thisWeekStart).length, anomalies: all.filter(r => r.status !== "ok").length };
  };
  const maxTotal = Math.max(...employees.map(u => getStats(u.id).total), 1);

  return (
    <>
      <div className="section-title">Suivi de l'équipe</div>
      {employees.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👥</div><div>Aucun employé enregistré.</div></div>
      ) : employees.map(u => {
        const s = getStats(u.id);
        const pct = Math.round((s.total / maxTotal) * 100);
        const isInactive = s.today === 0;
        return (
          <div key={u.id} className="emp-card">
            <div className="emp-header">
              <div className={`emp-avatar ${isInactive ? "emp-avatar-warn" : "emp-avatar-ok"}`}>{u.name[0].toUpperCase()}</div>
              <div><div className="emp-name">{u.name}</div><div className="emp-role">@{u.username}</div></div>
              <div style={{ marginLeft: "auto", fontSize: 24 }}>{isInactive ? "😴" : s.anomalies > 0 ? "⚠️" : "✅"}</div>
            </div>
            <div className="emp-stats-row">
              <div className="emp-stat"><div className="emp-stat-num" style={{ color: "var(--orange)" }}>{s.total}</div><div className="emp-stat-label">Total</div></div>
              <div className="emp-stat"><div className="emp-stat-num" style={{ color: isInactive ? "var(--red)" : "var(--green)" }}>{s.today}</div><div className="emp-stat-label">Aujourd'hui</div></div>
              <div className="emp-stat"><div className="emp-stat-num" style={{ color: "var(--blue)" }}>{s.week}</div><div className="emp-stat-label">Semaine</div></div>
              <div className="emp-stat"><div className="emp-stat-num" style={{ color: s.anomalies > 0 ? "var(--yellow)" : "var(--green)" }}>{s.anomalies}</div><div className="emp-stat-label">Anomalies</div></div>
            </div>
            <div className="emp-bar-wrap">
              <div className="emp-bar-label"><span>Activité relative</span><span>{pct}%</span></div>
              <div className="emp-bar-bg"><div className="emp-bar-fill" style={{ width: `${pct}%`, background: s.total === 0 ? "var(--red)" : s.anomalies > s.total * 0.3 ? "var(--yellow)" : "var(--green)" }} /></div>
            </div>
            {isInactive && <div className="emp-warning">⚠️ Aucune photo prise aujourd'hui — à vérifier</div>}
          </div>
        );
      })}
    </>
  );
}

/* ─── ADMIN VIEW ─── */
function AdminView({ users, setUsers, records, restoId, subscribed }) {
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("employee");

  const addUser = async () => {
    if (!newName || !newUsername || !newPassword) return;
    const { data: userData } = await supabase.from('users').insert([{
      restaurant_id: restoId,
      name: newName, username: newUsername, email: newUsername,
      password: newPassword, role: newRole
    }]).select().single();
    if (userData) setUsers(prev => [...prev, userData]);
    setNewName(""); setNewUsername(""); setNewPassword(""); setNewRole("employee");
  };

  return (
    <>
      <div className="section-title">Tableau de bord</div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{records.length}</div><div className="stat-label">Preuves</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: "var(--green)" }}>{records.filter(r => r.status === "ok").length}</div><div className="stat-label">OK</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: "var(--yellow)" }}>{records.filter(r => r.status !== "ok").length}</div><div className="stat-label">Anomalies</div></div>
      </div>
      <div className="section-title">👥 Comptes</div>
      <div className="users-list">
        {users.map(u => (
          <div key={u.id} className="user-item">
            <div className={`user-avatar ${u.role === "manager" ? "avatar-manager" : "avatar-employee"}`}>{u.name[0].toUpperCase()}</div>
            <div className="user-info">
              <div className="user-display">{u.name} {u.role === "manager" && <span style={{ fontSize: 11, color: "var(--blue)" }}>Manager</span>}</div>
              <div className="user-login">@{u.username}</div>
            </div>
            {u.role !== "manager" && <button className="del-btn" onClick={async () => {
await supabase.from('users').delete().eq('id', u.id);
  setUsers(prev => prev.filter(x => x.id !== u.id));
}}>Supprimer</button>}
          </div>
        ))}
      </div>
      <div className="add-user-form">
        <div className="section-title">Ajouter un compte</div>
        <div className="form-grid">
          <input className="form-input" placeholder="Prénom" value={newName} onChange={e => setNewName(e.target.value)} />
          <input className="form-input" placeholder="Identifiant" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
          <input className="form-input" placeholder="Mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
            <option value="employee">Employé</option>
            <option value="manager">Manager</option>
          </select>
        </div>
<button className="add-btn" onClick={addUser} disabled={!newName || !newUsername || !newPassword || !subscribed}>+ Ajouter</button>
{!subscribed && <div style={{marginTop: 8, fontSize: 12, color: "var(--red)"}}>🔒 Abonnement requis pour ajouter des employés</div>}
      </div>
    </>
  );
}

/* ─── SUBSCRIPTION VIEW ─── */
function SubscriptionView({ subscribed, setSubscribed, setActiveTab, user, restoId }) {
  const [loading, setLoading] = useState(false);
  const handleSubscribe = () => {
    setLoading(true);
    window.location.href = "https://buy.stripe.com/00w28jbx93kA1PV9zS1gs01?prefilled_email=" + encodeURIComponent(user?.email || "");
  };
  return (
    <div className="sub-wrap">
      <div className="section-title">Abonnement</div>
      {subscribed ? (
        <>
          <div className="sub-active">
            <span style={{ fontSize: 32 }}>✅</span>
            <div><div className="sub-active-title">Abonnement actif</div><div className="sub-active-sub">Prochain renouvellement dans 30 jours · 14,99€/mois</div></div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            {[["Plan","ProofKit Pro"],["Prix","14,99€ / mois"],["Employés","Illimités"],["Preuves","Illimitées"],["Support","Email prioritaire"]].map(([k,v]) => (
              <div key={k} className="result-row"><span className="result-row-label">{k}</span><span className="result-row-value">{v}</span></div>
            ))}
            <button className="modal-del-btn" onClick={async () => {
              await supabase.from('restaurants').update({ subscribed: false }).eq('id', restoId);
              setSubscribed(false);
            }}>Résilier l'abonnement</button>
          </div>
        </>
      ) : (
        <>
          <div className="sub-inactive-banner"><span style={{ fontSize: 20 }}>🔒</span><div>Abonnez-vous pour débloquer toutes les fonctionnalités et donner accès à votre équipe.</div></div>
          <div className="sub-card">
            <div className="sub-price">14,99€<span> / mois</span></div>
            <div style={{ fontSize: 13, color: "var(--green)", fontWeight: 700, marginBottom: 8 }}>🎁 7 jours gratuits — aucun paiement aujourd'hui</div>
            <div className="sub-desc">Tout ce qu'il faut pour protéger votre restaurant des remboursements abusifs.</div>
            <div className="sub-features">
              {["Photos horodatées infalsifiables","Lecture automatique du # de commande","Détection d'anomalies par IA","Alertes en temps réel","Suivi de l'équipe","Employés illimités","Accès depuis tous les téléphones","Support prioritaire"].map(f => (
                <div key={f} className="sub-feature"><div className="sub-feature-icon">✓</div><span>{f}</span></div>
              ))}
            </div>
            <button className="sub-btn" onClick={handleSubscribe} disabled={loading}>
              {loading ? "Redirection..." : "S'abonner pour 14,99€ / mois →"}
            </button>
            <div style={{ background: "var(--green-soft)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 10, padding: "12px 16px", textAlign: "center", fontSize: 13, color: "var(--green)", fontWeight: 700, marginBottom: 12 }}>
              🎁 7 jours gratuits inclus — aucun paiement aujourd'hui
            </div>
            <div className="sub-note">Résiliation possible à tout moment · Sans engagement</div>
          </div>
        </>
      )}
    </div>
  );
}