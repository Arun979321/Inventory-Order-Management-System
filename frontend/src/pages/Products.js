import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { productsAPI } from '../api/endpoints';
import Modal from '../components/Modal';

const emptyForm = { name: '', sku: '', price: '', stock_quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    productsAPI.getAll().then((res) => setProducts(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({ name: product.name, sku: product.sku, price: String(product.price), stock_quantity: String(product.stock_quantity) });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0 };
      if (editing) {
        await productsAPI.update(editing.id, payload);
        toast.success('Product updated');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  if (loading) return <div style={styles.loading}>Loading products...</div>;

  return (
    <div>
      <div style={styles.header}>
        <h2>Products</h2>
        <button style={styles.addBtn} onClick={openAdd}>+ Add Product</button>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
                <td>
                  <button style={styles.editBtn} onClick={() => openEdit(p)}>Edit</button>
                  <button style={styles.delBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label>SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label>Price</label>
              <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label>Stock Quantity</label>
              <input name="stock_quantity" type="number" min="0" value={form.stock_quantity} onChange={handleChange} required style={styles.input} />
            </div>
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  addBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },
  editBtn: { background: '#3498db', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' },
  delBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer' },
  submitBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, width: '100%', marginTop: '8px' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  field: { marginBottom: '14px' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', marginTop: '4px' },
};
