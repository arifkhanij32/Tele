import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditUserForm.css';

const EditUserForm = ({ initialData, onClose, onSave }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [designation, setDesignation] = useState(initialData?.designation || '');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            setPhone(initialData.phone);
            setDesignation(initialData.designation);
        }
    }, [initialData]);

    const handleSave = () => {
        const updatedUser = { name, email, phone, designation };

        axios.put(`${process.env.REACT_APP_LOCALHOST}/users/update-user/${initialData.id}/`, updatedUser)
            .then(response => {
                onSave(response.data);
                onClose(); // Close the form after saving
            })
            .catch(error => {
                console.error('Error updating user:', error);
            });
    };

    return (
        <div className="editusers-form-overlay">
            <div className="edit-user-form">
                <h3>Edit User</h3>
                <div className="editusers-form-group-name">
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="editusers-form-group-email">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="editusers-form-group-mobile">
                    <label>Mobile</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="editusers-form-group-designation">
                    <label>Designation</label>
                    <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                </div>
                <div className="editusers-form-footer">
                    <button  onClick={handleSave}>Save</button>
                    <button  onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditUserForm;

/* August 29 */