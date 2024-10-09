import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AddReferrerForm.css';

// Country code model
export const countryCodes = [
    { code: '+91', name: 'IN', length: 10 },
    { code: '+1', name: 'USA', length: 10 },
    { code: '+260', name: 'Zambia', length: 9 },
];

const AddReferrerForm = ({ onClose, initialData }) => {
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [email, setEmail] = useState(initialData ? initialData.email : '');
    const [phone, setPhone] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Default to the first country (India)
    const formRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            const initialCountry = countryCodes.find(c => initialData.phone.startsWith(c.code)) || countryCodes[0];
            setSelectedCountry(initialCountry);
        }
    }, [initialData]);

    const handlePhoneInput = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
        if (value.length <= selectedCountry.length) { // Limit to country-specific phone length
            setPhone(value);
        }
    };

    const handleSubmit = () => {
        const referrerData = { name, email, phone: `${selectedCountry.code}${phone}` };

        axios.post(`${process.env.REACT_APP_LOCALHOST}/referrer/add-referrer/`, referrerData)
            .then(response => {
                console.log('Success:', response.data);
                onClose();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return (
        <div className="form-overlay">
            <div className="add-referrer-form" ref={formRef}>
                <h3>{initialData ? 'Edit Referrer' : 'Add Referrer'}</h3>
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
                                setPhone(''); // Reset phone number when country code changes
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
                            onInput={handlePhoneInput}
                            placeholder={`Enter ${selectedCountry.name} phone number`}
                            maxLength={selectedCountry.length} // Set maxLength based on selected country
                        />
                    </div>
                </div>

                <div className="form-footer">
                    <button onClick={handleSubmit}>OK</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddReferrerForm;