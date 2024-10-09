
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PhysicianDetailsDialog.css';


const PhysicianDetailsDialog = ({ onClose }) => {
    const [physicians, setPhysicians] = useState([]);
    const [selectedPhysician, setSelectedPhysician] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [physicianData, setPhysicianData] = useState({
        name: '',
        email: '',
        phone_number: '',
        whatsapp_number: '',
    });

    useEffect(() => {
        fetchPhysicians();
    }, []);

    const fetchPhysicians = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCALHOST}/patientViewer/physician/`);
            setPhysicians(response.data);
        } catch (error) {
            console.error('Error fetching physician data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Allow only digits and enforce 10-digit limit
        if (name === 'phone_number' || name === 'whatsapp_number') {
            if (!/^\d*$/.test(value) || value.length > 10) {
                return; // Prevent non-numeric characters and limit to 10 digits
            }
        }

        setPhysicianData({
            ...physicianData,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedPhysician) {
                await axios.put(`${process.env.REACT_APP_LOCALHOST}/patientViewer/physician/${selectedPhysician.id}/`, physicianData);
            } else {
                await axios.post(`${process.env.REACT_APP_LOCALHOST}/patientViewer/physician/`, physicianData);
            }
            fetchPhysicians();
            setShowForm(false);
            setSelectedPhysician(null);
            setPhysicianData({
                name: '',
                email: '',
                phone_number: '',
                whatsapp_number: '',
            });
        } catch (error) {
            console.error('Error saving physician data:', error);
        }
    };

    const handleEdit = () => {
        if (selectedPhysician) {
            setPhysicianData(selectedPhysician);
            setShowForm(true);
        }
    };

    const handleDelete = async () => {
        if (selectedPhysician) {
            try {
                await axios.delete(`${process.env.REACT_APP_LOCALHOST}/patientViewer/physician/${selectedPhysician.id}/`);
                fetchPhysicians();
                setSelectedPhysician(null);
            } catch (error) {
                console.error('Error deleting physician:', error);
            }
        }
    };

    return (
        <div className="overlay">
            <div className="physician-dialog">
                {showForm ? (
                    <>
                        <h2>{selectedPhysician ? 'Edit Physician' : 'Add Physician'}</h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter name"
                                    value={physicianData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter email"
                                    value={physicianData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone_number">Phone Number</label>
                                <input
                                    type="text"
                                    id="phone_number"
                                    name="phone_number"
                                    placeholder="Enter phone number"
                                    value={physicianData.phone_number}
                                    onChange={handleChange}
                                    maxLength="10" // Limit input to 10 characters
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="whatsapp_number">WhatsApp Number</label>
                                <input
                                    type="text"
                                    id="whatsapp_number"
                                    name="whatsapp_number"
                                    placeholder="Enter WhatsApp number"
                                    value={physicianData.whatsapp_number}
                                    onChange={handleChange}
                                    maxLength="10" // Limit input to 10 characters
                                />
                            </div>
                            <div className="dialog-footer">
                                <button type="button" onClick={() => { setShowForm(false); setSelectedPhysician(null); }}>Cancel</button>
                                <button type="button" onClick={handleSubmit}>OK</button>                         
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h2>Physician List</h2>
                        <table className="shareWithPhysician-dialog-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                    <th>WhatsApp Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {physicians.map((physician) => (
                                    <tr
                                        key={physician.id}
                                        onClick={() => setSelectedPhysician(physician)}
                                        className={selectedPhysician && selectedPhysician.id === physician.id ? 'selected' : ''}
                                    >
                                        <td>{physician.name}</td>
                                        <td>{physician.email}</td>
                                        <td>{physician.phone_number}</td>
                                        <td>{physician.whatsapp_number}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="dialog-footer">
                            <button onClick={() => { setShowForm(true); setSelectedPhysician(null); }}>
                                 Add Physician
                            </button>
                            <button onClick={handleEdit} disabled={!selectedPhysician}>
                                 Edit Physician
                            </button>
                            <button onClick={handleDelete} disabled={!selectedPhysician}>
                                 Delete Physician
                            </button>
                            <button onClick={onClose}>
                                 Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PhysicianDetailsDialog;