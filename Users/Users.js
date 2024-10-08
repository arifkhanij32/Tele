


import React, { useState, useEffect } from 'react';
import './Users.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [isAddUserFormVisible, setAddUserFormVisible] = useState(false);
    const [isEditUserFormVisible, setEditUserFormVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get(`${process.env.REACT_APP_LOCALHOST}/users/list-users/`)
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching data:', error));
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleRoleChange = (event) => {
        setRoleFilter(event.target.value);
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditUserFormVisible(true);
    };

    const handleDeleteClick = () => {
        if (selectedUser) {
            axios.delete(`${process.env.REACT_APP_LOCALHOST}/users/delete-user/${selectedUser.id}/`)
                .then(() => {
                    // Remove the deleted user from the list
                    setUsers(users.filter(user => user.id !== selectedUser.id));
                    setSelectedUser(null); // Reset the selected user
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                });
        }
    };

    const handleSave = (updatedUser) => {
        // Update the users list with the updated user
        setUsers(users.map(user => (user.id === updatedUser.id ? updatedUser : user)));
        setEditUserFormVisible(false);
    };

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roleFilter === 'All' || user[roleFilter.toLowerCase()])
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return (
        <div className="users-page">
            <div className="users-search-bar">
                <input
                    type="text"
                    placeholder="Search here for name or email."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <select value={roleFilter} onChange={handleRoleChange}>
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="ManageReports">Manage Reports</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Reception">Reception</option>
                    <option value="Sharing">Sharing</option>
                    <option value="Technician">Technician</option>
                    <option value="TeleRadiologist">Tele Radiologist</option>
                    <option value="ViewDashboard">View Dashboard</option>
                    <option value="WorklistAssigner">Worklist Assigner</option>
                </select>
                <button onClick={fetchUsers}>Refresh</button>
            </div>

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('name')}>Name</th>
                            <th onClick={() => requestSort('email')}>Email</th>
                            <th onClick={() => requestSort('phone')}>Phone</th>
                            <th>Admin</th>
                            <th>Manage Reports</th>
                            <th>Radiologist</th>
                            <th>Reception</th>
                            <th>Sharing</th>
                            <th>Technician</th>
                            <th>Tele Radiologist</th>
                            <th>View Dashboard</th>
                            <th>Worklist Assigner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user) => (
                            <tr key={user.id} onClick={() => setSelectedUser(user)}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.admin ? '✓' : ''}</td>
                                <td>{user.manageReports ? '✓' : ''}</td>
                                <td>{user.radiologist ? '✓' : ''}</td>
                                <td>{user.reception ? '✓' : ''}</td>
                                <td>{user.sharing ? '✓' : ''}</td>
                                <td>{user.technician ? '✓' : ''}</td>
                                <td>{user.teleRadiologist ? '✓' : ''}</td>
                                <td>{user.viewDashboard ? '✓' : ''}</td>
                                <td>{user.worklistAssigner ? '✓' : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="users-footer-buttons">
                <button className="users-footer-button" onClick={() => setAddUserFormVisible(true)}>
                    <FontAwesomeIcon icon={faPlus} className="users-footer-icon" />
                    New User
                </button>
                <button
                    className="users-footer-button"
                    onClick={() => handleEditClick(selectedUser)}
                    disabled={!selectedUser}
                >
                    <FontAwesomeIcon icon={faEdit} className="users-footer-icon" />
                    Edit User
                </button>
                <button
                    className="users-footer-button"
                    onClick={handleDeleteClick}
                    disabled={!selectedUser}
                >
                    <FontAwesomeIcon icon={faTrashAlt} className="users-footer-icon" />
                    Delete User
                </button>
            </div>

            {isAddUserFormVisible && (
                <AddUserForm
                    onClose={() => {
                        setAddUserFormVisible(false);
                        fetchUsers(); // Refresh the user list after closing the form
                    }}
                />
            )}
            {isEditUserFormVisible && selectedUser && (
                <EditUserForm
                    initialData={selectedUser}
                    onClose={() => setEditUserFormVisible(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default Users;


