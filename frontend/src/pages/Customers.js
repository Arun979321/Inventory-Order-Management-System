import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { customersAPI } from '../api/endpoints';
import Modal from '../components/Modal';

const emptyForm = { name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    setLoading(true);
    customersAPI.getAll().then((res) => setCustomers(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone || '' });
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await customersAPI.update(editing.id, form);
        toast.success('Customer updated');
      } else {
        await customersAPI.create(form);
        toast.success('Customer created');
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await customersAPI.delete(id);
      toast.success('Customer deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  if (loading) return <div style={styles.loading}>Loading customers...</div>;

  return (
    <div>
      <div style={styles.header}>
        <h2>Customers</h2>
        <button style={styles.addBtn} onClick={openAdd}>+ Add Customer</button>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || '—'}</td>
                <td>
                  <button style={styles.editBtn} onClick={() => openEdit(c)}>Edit</button>
                  <button style={styles.delBtn} onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} style={styles.input} />
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
