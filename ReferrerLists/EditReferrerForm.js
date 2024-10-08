import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditReferrerForm.css';

// Country code model
const countryCodes = [
    { code: '+91', name: 'India', length: 10 },
    { code: '+1', name: 'USA', length: 10 },
    { code: '+260', name: 'Zambia', length: 9 },
];

const EditReferrerForm = ({ initialData, onClose, onSave }) => {
    const [name, setName] = useState(initialData.name || '');
    const [email, setEmail] = useState(initialData.email || '');
    const [phone, setPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Default to the first country (India)

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);

            // Set initial country and phone number by checking the country code
            const initialCountry = countryCodes.find(c => initialData.phone.startsWith(c.code)) || countryCodes[0];
            setSelectedCountry(initialCountry);
            setPhone(initialData.phone.replace(initialCountry.code, '')); // Remove country code for input field
        }
    }, [initialData]);

    const handlePhoneInput = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
        if (value.length <= selectedCountry.length) { // Limit to the country's phone number length
            setPhone(value);
        }
    };

    const handleSave = () => {
        const updatedPhone = phone.startsWith(selectedCountry.code)
            ? phone
            : `${selectedCountry.code}${phone}`; // Ensure country code isn't added twice

        const updatedReferrer = {
            name,
            email,
            phone: updatedPhone // Only append the country code if not already present
        };

        axios.put(`${process.env.REACT_APP_LOCALHOST}/referrer/update-referrer/${initialData.id}/`, updatedReferrer)
            .then(response => {
                onSave(response.data);
                onClose(); // Close the form after saving
            })
            .catch(error => {
                console.error('Error updating referrer:', error);
            });
    };

    return (
        <div className="form-overlay">
            <div className="edit-referrer-form">
                <h3>Edit Referrer</h3>
                <div className="form-group-name">
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group-email">
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group-mobile">
                    <label>Mobile:</label>
                    <div style={{ display: 'flex' }}>
                        <select
                            value={selectedCountry.code}
                            onChange={(e) => {
                                const selected = countryCodes.find(c => c.code === e.target.value);
                                setSelectedCountry(selected);
                                setPhone(''); // Reset the phone input field when the country code changes
                            }}
                            style={{ marginRight: '5px' }}>
                            {countryCodes.map(option => (
                                <option key={option.code} value={option.code}>
                                    {`${option.name} (${option.code})`}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={phone}
                            onChange={handlePhoneInput} // Updated to onChange
                            placeholder={`Enter ${selectedCountry.name} phone number`}
                            maxLength={selectedCountry.length} // Set maxLength based on selected country
                        />
                    </div>
                </div>
                <div className="form-footer">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default EditReferrerForm;
