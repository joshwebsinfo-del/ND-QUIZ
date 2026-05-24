import React from 'react';

import { getAllUsers, removeUser, toggleRestrictUser } from '../utils/admin';

const AdminPanel = () => {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  const handleRemove = (uid) => {
    removeUser(uid);
    setUsers(getAllUsers());
  };

  const handleToggle = (uid) => {
    toggleRestrictUser(uid);
    setUsers(getAllUsers());
  };

  return (
    <div
      className="admin-panel"
      style={{ padding: '2rem' }}
    >
      <h2>Admin Panel</h2>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.uid} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{user.displayName}</td>
              <td>{user.email}</td>
              <td>{user.restricted ? 'Restricted' : 'Active'}</td>
              <td>
                <button onClick={() => handleToggle(user.uid)} style={{ marginRight: '0.5rem' }}>
                  {user.restricted ? 'Unrestrict' : 'Restrict'}
                </button>
                <button onClick={() => handleRemove(user.uid)} style={{ color: 'red' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
