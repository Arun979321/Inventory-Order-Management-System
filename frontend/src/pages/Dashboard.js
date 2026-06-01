import React, { useEffect, useState } from 'react';
import { productsAPI, customersAPI, ordersAPI, inventoryAPI } from '../api/endpoints';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsAPI.getAll(),
      customersAPI.getAll(),
      ordersAPI.getAll(),
      inventoryAPI.getAll(),
    ])
      .then(([productsRes, customersRes, ordersRes, inventoryRes]) => {
        const products = productsRes.data;
        const lowStock = inventoryRes.data.filter((p) => p.stock_quantity < 10);
        setData({
          totalProducts: products.length,
          totalCustomers: customersRes.data.length,
          totalOrders: ordersRes.data.length,
          lowStock,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const cards = [
    { label: 'Total Products', value: data.totalProducts, color: '#3498db' },
    { label: 'Total Customers', value: data.totalCustomers, color: '#2ecc71' },
    { label: 'Total Orders', value: data.totalOrders, color: '#e67e22' },
    {
      label: 'Low Stock Items',
      value: data.lowStock.length,
      color: data.lowStock.length > 0 ? '#e74c3c' : '#95a5a6',
    },
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}>
            <div style={styles.cardValue}>{card.value}</div>
            <div style={styles.cardLabel}>{card.label}</div>
          </div>
        ))}
      </div>
      {data.lowStock.length > 0 && (
        <div style={styles.alertBox}>
          <h3>⚠️ Low Stock Alerts (stock &lt; 10)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td style={{ color: p.stock_quantity === 0 ? '#e74c3c' : '#e67e22', fontWeight: 600 }}>
                    {p.stock_quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: '#666' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: { background: '#fff', padding: '24px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardValue: { fontSize: '2.2rem', fontWeight: 700, marginBottom: '4px' },
  cardLabel: { fontSize: '0.9rem', color: '#666' },
  alertBox: { background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
};
