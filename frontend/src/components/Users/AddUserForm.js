import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import './AddUserForm.css';

const AddUserForm = ({ onClose, initialData }) => {
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [email, setEmail] = useState(initialData ? initialData.email : '');
    const [phone, setPhone] = useState(initialData ? initialData.phone : '');
    const [designation, setDesignation] = useState(initialData ? initialData.designation : '');
    const formRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            setPhone(initialData.phone);
            setDesignation(initialData.designation);
        }
    }, [initialData]);

    const handleSubmit = () => {
        const userData = { name, email, phone, designation };

        axios.post(`${process.env.REACT_APP_LOCALHOST}/users/add-user/`, userData)
            .then(response => {
                console.log('Success:', response.data);
                onClose(); // Close the form after successful submission
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <div className="addusers-form-overlay">
            <div className="addusers-form" ref={formRef}>
                <h3>{initialData ? 'Edit User' : 'Add User'}</h3>
                <div className="addusers-form-group-name">
                    <label>
                         Name
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className=" addusers-form-group-email">
                    <label>
                        Email
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="addusers-form-group-mobile">
                    <label>
                         Phone
                    </label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="addusers-form-group-designation">
                    <label>
                         Designation
                    </label>
                    <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                </div>
                <div className="addusers-form-footer">
                    <button onClick={handleSubmit}>OK</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddUserForm;