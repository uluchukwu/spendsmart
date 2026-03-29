import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import styles from '../../styles/Navbar.module.css';

export default function Navbar() {
  const { user, logout }      = useAuth();
  const navigate              = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.logo}>💳</span>
        <span className={styles.brandName}>SpendSmart</span>
      </div>

      <div className={styles.links}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Transactions
        </NavLink>
      </div>

      <div className={styles.userArea}>
        <button
          className={styles.avatarBtn}
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.caret}>▾</span>
        </button>

        {menuOpen && (
          <div className={styles.dropdown} role="menu">
            <div className={styles.dropdownEmail}>{user?.email}</div>
            <hr className={styles.divider} />
            <button
              className={styles.dropdownItem}
              role="menuitem"
              onClick={() => { setMenuOpen(false); handleLogout(); }}
            >
              🚪 Sign out
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
    </nav>
  );
}
