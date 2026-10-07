import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';


export function ManageUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Error loading user directory from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    return (
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(u.id).includes(searchQuery)
    );
  });

  return (
    <div style={{ textAlign: 'left' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--ink-primary)',
          paddingBottom: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Registered Attendees & Users</h1>
          <p style={{ color: 'var(--ink-secondary)', marginTop: '4px' }}>
            User accounts authenticated with BCrypt hashing and JWT.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '220px' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div 
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>
            Loading users from backend...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-secondary)' }}>No registered users found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Full Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email Address</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN' || u.role === 'ROLE_ADMIN';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td className="font-mono" style={{ padding: '14px 16px', color: 'var(--ink-muted)' }}>#{u.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--ink-primary)' }}>{u.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--ink-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${isAdmin ? 'badge-accent' : 'badge-subtle'}`}>
                          {u.role || 'USER'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

