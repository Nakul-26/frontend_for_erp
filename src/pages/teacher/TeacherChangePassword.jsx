import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/Dashboard.css'; // Use the same styles
// import '../../styles/ChangePassword.css'; // Add a new style file for the form
import TeacherSidebar from '../../components/TeacherSidebar';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

function TeacherChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    // Frontend validation
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/teacher/changepassword`,
        { oldpassword: oldPassword, newpassword: newPassword },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage('Password changed successfully! Redirecting...');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/teacher/dashboard');
        }, 2000);
      }
    } catch (error) {
      // console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error?.errors?.[0] || 'Failed to change password. Please try again.';
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <main className="main-content">
        <Navbar pageTitle="Change Password" />
        <div className="change-password-container">
          <div className="change-password-form">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="input-group">
                <label htmlFor="oldPassword">Old Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {message && (
                <p className={`status-message ${isSuccess ? 'success' : 'error'}`}>
                  {message}
                </p>
              )}
              <button type="submit" disabled={isLoading} className="change-password-button">
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherChangePassword;