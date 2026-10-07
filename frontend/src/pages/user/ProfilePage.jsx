import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';


export function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setProfileLoading(true);
    try {
      const updated = await userService.updateUser(user.id, { name, email });
      updateUserProfile({ name: updated.name, email: updated.email });
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await userService.changePassword(user.id, { currentPassword, newPassword });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ padding: '48px 0 96px 0', backgroundColor: 'var(--bg-paper)' }}>
      <div className="container-narrow">
        <div 
          style={{
            borderBottom: '2px solid var(--ink-primary)',
            paddingBottom: '20px',
            marginBottom: '36px',
            textAlign: 'left',
          }}
        >
          <div 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              color: 'var(--accent)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            ACCOUNT SETTINGS
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', margin: 0 }}>
            Profile & Security
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
          {/* Personal Info Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Personal Details</h3>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Update your account credentials and contact details.
            </p>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  Role: <strong style={{ color: 'var(--accent)' }}>{user?.role || 'USER'}</strong>
                </span>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn btn-primary btn-sm"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Security & Password</h3>
            <p style={{ color: 'var(--ink-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Change your password securely using BCrypt backend validation.
            </p>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn btn-outline btn-sm"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

