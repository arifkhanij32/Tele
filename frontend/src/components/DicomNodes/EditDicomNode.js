import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditDicomNode.css';

const EditDicomNode = ({ show, onClose, nodeData, onSubmit }) => {
    const [formData, setFormData] = useState({
        location: '',
        name: '',
        manufacturer: '',
        model: '',
        deviceSerialNumber: '',
        softwareVersions: '',
        stationName: '',
        ipAddress: '',
        aeTitle: '',
        useLatinOnly: false,
    });

    useEffect(() => {
        if (nodeData) {
            setFormData(nodeData);
        }
    }, [nodeData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`${process.env.REACT_APP_LOCALHOST}/dicomNodes/dicomnodes/${nodeData.id}/`, formData)
            .then(response => {
                onSubmit(response.data);
                onClose();
            })
            .catch(error => {
                console.error('There was an error updating the dicom node!', error);
            });
    };

    if (!show) {
        return null;
    }

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h2>Edit Dicom Node</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Location:</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Manufacturer:</label>
                        <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Model:</label>
                        <input type="text" name="model" value={formData.model} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Device Serial Number:</label>
                        <input type="text" name="deviceSerialNumber" value={formData.deviceSerialNumber} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Software Versions:</label>
                        <input type="text" name="softwareVersions" value={formData.softwareVersions} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Station Name:</label>
                        <input type="text" name="stationName" value={formData.stationName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>IP Address:</label>
                        <input type="text" name="ipAddress" value={formData.ipAddress} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>MWL Aet:</label>
                        <input type="text" name="aeTitle" value={formData.aeTitle} onChange={handleChange} />
                    </div>
                    
                    <div className="dialog-buttons">
                        <button type="submit">OK</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDicomNode;