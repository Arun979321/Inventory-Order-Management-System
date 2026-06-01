import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { inventoryAPI } from '../api/endpoints';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const fetchInventory = () => {
    setLoading(true);
    inventoryAPI.getAll().then((res) => setItems(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, []);

  const startEdit = (item) => {
    setEditId(item.id);
    setEditValue(String(item.stock_quantity));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValue('');
  };

  const saveEdit = async (id) => {
    const newQty = parseInt(editValue);
    if (isNaN(newQty) || newQty < 0) {
      toast.error('Stock must be a non-negative number');
      return;
    }
    try {
      await inventoryAPI.update(id, { stock_quantity: newQty });
      toast.success('Stock updated');
      setEditId(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  if (loading) return <div style={styles.loading}>Loading inventory...</div>;

  return (
    <div>
      <h2>Inventory</h2>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        Manage stock levels. Click a stock value to edit inline.
      </p>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>${parseFloat(item.price).toFixed(2)}</td>
                <td>
                  {editId === item.id ? (
                    <input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={styles.inlineInput}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={{
                        ...styles.stockValue,
                        color: item.stock_quantity < 10 ? '#e74c3c' : '#2ecc71',
                        fontWeight: item.stock_quantity < 10 ? 700 : 400,
                      }}
                      onClick={() => startEdit(item)}
                    >
                      {item.stock_quantity}
                    </span>
                  )}
                </td>
                <td>
                  {editId === item.id ? (
                    <>
                      <button style={styles.saveBtn} onClick={() => saveEdit(item.id)}>Save</button>
                      <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button style={styles.editBtn} onClick={() => startEdit(item)}>Adjust</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  inlineInput: { width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #3498db', textAlign: 'center' },
  stockValue: { cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' },
  editBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' },
  cancelBtn: { background: '#95a5a6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
};
