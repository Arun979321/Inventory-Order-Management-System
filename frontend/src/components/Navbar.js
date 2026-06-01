import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
  { to: '/inventory', label: 'Inventory' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>📦 IMS</span>
      <div style={styles.links}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              ...styles.link,
              ...(location.pathname === link.to ? styles.active : {}),
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#1a1a2e',
    color: '#fff',
    padding: '12px 24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  brand: { fontWeight: 700, fontSize: '1.3rem' },
  links: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '0.95rem',
  },
  active: { background: '#16213e', color: '#fff', fontWeight: 600 },
};
