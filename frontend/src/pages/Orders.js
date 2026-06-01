import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ordersAPI, customersAPI, productsAPI } from '../api/endpoints';
import Modal from '../components/Modal';

const statusColors = {
  pending: '#f39c12',
  confirmed: '#3498db',
  shipped: '#9b59b6',
  delivered: '#2ecc71',
  cancelled: '#e74c3c',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderLines, setOrderLines] = useState([{ product_id: '', quantity: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    ordersAPI.getAll().then((res) => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const openCreate = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([customersAPI.getAll(), productsAPI.getAll()]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setSelectedCustomer('');
      setOrderLines([{ product_id: '', quantity: '' }]);
      setModalOpen(true);
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const addLine = () => setOrderLines([...orderLines, { product_id: '', quantity: '' }]);

  const removeLine = (idx) => {
    if (orderLines.length === 1) return;
    setOrderLines(orderLines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx, field, value) => {
    const updated = [...orderLines];
    updated[idx][field] = value;
    setOrderLines(updated);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) { toast.error('Select a customer'); return; }
    const items = orderLines
      .filter((l) => l.product_id && l.quantity)
      .map((l) => ({ product_id: parseInt(l.product_id), quantity: parseInt(l.quantity) }));
    if (items.length === 0) { toast.error('Add at least one product'); return; }
    setSubmitting(true);
    try {
      await ordersAPI.create({ customer_id: parseInt(selectedCustomer), items });
      toast.success('Order created');
      setModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Status update failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order? Stock will NOT be restored.')) return;
    try {
      await ordersAPI.delete(id);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cancel failed');
    }
  };

  const viewDetail = async (id) => {
    try {
      const res = await ordersAPI.get(id);
      setDetailModal(res.data);
    } catch (err) {
      toast.error('Failed to load order details');
    }
  };

  if (loading) return <div style={styles.loading}>Loading orders...</div>;

  return (
    <div>
      <div style={styles.header}>
        <h2>Orders</h2>
        <button style={styles.addBtn} onClick={openCreate}>+ New Order</button>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name || `ID: ${o.customer_id}`}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                    style={{ ...styles.statusBadge, background: statusColors[o.status] || '#95a5a6', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>${o.total_amount ? parseFloat(o.total_amount).toFixed(2) : '0.00'}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <button style={styles.viewBtn} onClick={() => viewDetail(o.id)}>View</button>
                  <button style={styles.delBtn} onClick={() => handleCancel(o.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title="Create Order" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate}>
            <div style={styles.field}>
              <label>Customer</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required style={styles.input}>
                <option value="">Select customer...</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <h4 style={{ margin: '16px 0 8px' }}>Order Items</h4>
            {orderLines.map((line, idx) => (
              <div key={idx} style={styles.lineRow}>
                <select
                  value={line.product_id}
                  onChange={(e) => updateLine(idx, 'product_id', e.target.value)}
                  required
                  style={{ ...styles.input, flex: 2 }}
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (${parseFloat(p.price).toFixed(2)})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                  required
                  style={{ ...styles.input, flex: 1 }}
                />
                <button type="button" onClick={() => removeLine(idx)} style={styles.removeBtn}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addLine} style={styles.addLineBtn}>+ Add Item</button>
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </form>
        </Modal>
      )}

      {detailModal && (
        <Modal title={`Order #${detailModal.id}`} onClose={() => setDetailModal(null)}>
          <p><strong>Customer:</strong> {detailModal.customer_id}</p>
          <p><strong>Status:</strong> {detailModal.status}</p>
          <p><strong>Total:</strong> ${parseFloat(detailModal.total_amount || 0).toFixed(2)}</p>
          <p><strong>Date:</strong> {new Date(detailModal.created_at).toLocaleString()}</p>
          <h4>Items</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Product ID</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              {detailModal.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_id}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  addBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  viewBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' },
  delBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
  submitBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, width: '100%', marginTop: '12px' },
  addLineBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' },
  removeBtn: { background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '8px 12px', fontSize: '0.9rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  field: { marginBottom: '14px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', marginTop: '4px' },
  lineRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
};
