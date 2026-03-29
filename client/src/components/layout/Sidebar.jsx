import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import styles from '../../styles/Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard'       },
  { to: '/transactions', icon: '💸', label: 'Transactions'    },
  { to: '/history',      icon: '📅', label: 'Monthly History' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const initials  = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>💳</span>
        <span className={styles.brandName}>SpendSmart</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.userInfo}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userDetails}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
      </div>
    </aside>
  );
}
