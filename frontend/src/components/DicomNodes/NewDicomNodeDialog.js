import React, { useState } from 'react';
import axios from 'axios';
import './NewDicomNodeDialog.css';

const initialNodeState = {
    location: '',
    name: '',
    manufacturer: '',
    model: '',
    deviceSerialNumber: '',
    softwareVersion: '',
    stationName: '',
    ipAddress: '',
    aeTitle: '',
    latin: false
};

function NewDicomNodeDialog({ show, onClose, onSubmit }) {
    const [newNode, setNewNode] = useState(initialNodeState);

    if (!show) {
        return null;
    }

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setNewNode({
            ...newNode,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const correctedNode = {
            location: newNode.location,
            name: newNode.name,
            manufacturer: newNode.manufacturer,
            model: newNode.model,
            deviceSerialNumber: newNode.deviceSerialNumber,
            softwareVersions: newNode.softwareVersion,
            stationName: newNode.stationName,
            ipAddress: newNode.ipAddress,
            aeTitle: newNode.aeTitle,
            useLatinOnly: newNode.latin
        };
        axios.post(`${process.env.REACT_APP_LOCALHOST}/dicomNodes/dicomnodes/`, correctedNode)
            .then(response => {
                console.log('Success:', response.data);
                onSubmit(response.data); // Pass the new node data back to the parent
                setNewNode(initialNodeState); // Clear form after successful submission
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h2>New Dicom Node</h2>
                    <div className="form-group">
                        <label>Location:</label>
                        <input type="text" name="location" value={newNode.location} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Name:</label>
                        <input type="text" name="name" value={newNode.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Manufacturer:</label>
                        <input type="text" name="manufacturer" value={newNode.manufacturer} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Model:</label>
                        <input type="text" name="model" value={newNode.model} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Device Serial Number:</label>
                        <input type="text" name="deviceSerialNumber" value={newNode.deviceSerialNumber} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Software Versions:</label>
                        <input type="text" name="softwareVersion" value={newNode.softwareVersion} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Station Name:</label>
                        <input type="text" name="stationName" value={newNode.stationName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>IP Address:</label>
                        <input type="text" name="ipAddress" value={newNode.ipAddress} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>MWL Aet:</label>
                        <input type="text" name="aeTitle" value={newNode.aeTitle} onChange={handleInputChange} />
                    </div>
                    
                    <div className="dialog-buttons">
                        <button type="submit">OK</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewDicomNodeDialog;