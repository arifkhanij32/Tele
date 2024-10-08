import React, { useState, useEffect } from 'react';
import './statics/NewPatientDialog.css';
import axios from 'axios';
import SelectOptionDialog from './SelectOptionDialog';

function formatDateTime(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleString('en-US', options).replace(',', '').replace(' AM', ' AM').replace(' PM', ' PM');
}

export const countryCodes = [
    { code: '91', name: 'India', length: 10 },
    { code: '1', name: 'USA', length: 10 },
    { code: '260', name: 'Zambia', length: 9 },
];

const PhoneNumberInput = ({ value, onChange }) => {
    const [countryCode, setCountryCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (value) {
            const splitValue = value.split(' ');
            if (splitValue.length === 2) {
                setCountryCode(splitValue[0]);
                setPhoneNumber(splitValue[1]);
            }
        }
    }, [value]);

    const handleCountryCodeChange = (e) => {
        const newCountryCode = e.target.value;
        setCountryCode(newCountryCode);
        onChange(`${newCountryCode} ${phoneNumber}`);
    };

    const handlePhoneNumberChange = (e) => {
        let newPhoneNumber = e.target.value;
        const country = countryCodes.find(country => `+${country.code}` === countryCode);
        if (country && newPhoneNumber.length > country.length) {
            newPhoneNumber = newPhoneNumber.slice(0, country.length);
        }
        setPhoneNumber(newPhoneNumber);
        onChange(`${countryCode} ${newPhoneNumber}`);
    };

    return (
        <div className="phoneNumberInput">
            <select className="countryCodeSelect" value={countryCode} onChange={handleCountryCodeChange}>
                <option value=""></option>
                {countryCodes.map(country => (
                    <option key={country.code} value={`+${country.code}`}>
                        +{country.code} {country.name}
                    </option>
                ))}
            </select>
            <input
                type="text"
                className="phoneNumberField"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
            />
        </div>
    );
};

const NewPatientDialog = ({ show, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        id: '',
        patientId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        dob: '',
        age: '',
        mobile: '',
    });

    const [errors, setErrors] = useState({});
    const [showBacksideDialog, setShowBacksideDialog] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.dob) {
            calculateAge(formData.dob);
        }
    }, [formData.dob]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrors({
            ...errors,
            [name]: '',
        });
    };

    const handlePhoneNumberChange = (value) => {
        setFormData({
            ...formData,
            mobile: value,
        });
        setErrors({
            ...errors,
            mobile: '',
        });
    };

    const handleDateOfBirthChange = (e) => {
        const value = e.target.value;
        const today = new Date();
        const inputDate = new Date(value);

        if (value.length <= 10 && /^\d{4}-\d{2}-\d{2}$/.test(value) && inputDate <= today) {
            setFormData({
                ...formData,
                dob: value,
            });
            setErrors({
                ...errors,
                dob: '',
            });
            calculateAge(value);
        }
    };

    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        setFormData(prevState => ({
            ...prevState,
            age: age.toString(),
        }));
    };

    const validateForm = () => {
        let formErrors = {};

        if (!formData.firstName) {
            formErrors.firstName = 'First name is required';
        }

        if (!formData.gender) {
            formErrors.gender = 'Gender is required';
        }

        if (!formData.mobile) {
            formErrors.mobile = 'Mobile number is required';
        }

        if (!formData.age) {
            formErrors.age = 'Age is required';
        }

        setErrors(formErrors);

        return Object.keys(formErrors).length === 0;
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    
    //     if (!validateForm()) {
    //         return;
    //     }
    
    //     try {
    //         const currentDateTime = formatDateTime(new Date());
    //         const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`, {
    //             id: formData.id,
    //             Emg: false,
    //             pay: 'unpaid',
    //             status: 'Created',
    //             date: currentDateTime,
    //             service: '',
    //             name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
    //             dob: formData.dob,
    //             age: formData.age,
    //             gender: formData.gender,
    //             phone: formData.mobile,
    //             patientId: formData.patientId,
    //         });
    //         console.log('Patient created:', response.data);
    //         setFormData(prevState => ({
    //             ...prevState,
    //             id: response.data.id,
    //             patientId: response.data.patientId,
    //         }));
    //         setShowBacksideDialog(true);
    //     } catch (error) {
    //         console.error('There was an error creating the patient!', error);
    //         console.log('Error details:', error.response?.data);
    //     }
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!validateForm()) {
            return;
        }
    
        try {
            const currentDateTime = formatDateTime(new Date());
            const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`, {
                id: formData.id,
                Emg: false,
                pay: 'unpaid',
                status: 'Created',
                date: currentDateTime,
                service: '',
                name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
                dob: formData.dob,
                age: formData.age,
                gender: formData.gender,
                phone: formData.mobile,
                patientId: formData.patientId, // Ensure patientId is passed here
            });
            console.log('Patient created:', response.data);
    
            setFormData(prevState => ({
                ...prevState,
                id: response.data.id,
                patientId: response.data.patientId, // Store the patientId
            }));
    
            // Store the patientId in local storage or a higher-level state if needed
            localStorage.setItem('patientId', response.data.patientId);
    
            setShowBacksideDialog(true);
        } catch (error) {
            console.error('There was an error creating the patient!', error);
            console.log('Error details:', error.response?.data);
        }
    };
    
    
    if (!show) {
        return null;
    }

    return (
        <>
            <div className={`newPatientDialogOverlay ${showBacksideDialog ? 'hidden' : ''}`} onClick={onClose}></div>
            <div className={`newPatientDialog mediumDialog ${showBacksideDialog ? 'hidden' : ''}`}>
                <h2>Create New Patient</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label className="label">Patient ID:</label>
                        <input
                            className="input"
                            type="text"
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            placeholder="Auto Generate"
                            readOnly
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">First Name:<span className="mandatory">*</span></label>
                        <input
                            className="input"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        {errors.firstName && <div className="error">{errors.firstName}</div>}
                    </div>
                    <div className="form-row">
                        <label className="label">Middle Name:</label>
                        <input
                            className="input"
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Last Name:</label>
                        <input
                            className="input"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Gender:<span className="mandatory">*</span></label>
                        <select
                            className="input"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">None Selected</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Others</option>
                        </select>
                        {errors.gender && <div className="error">{errors.gender}</div>}
                    </div>
                    <div className="form-row">
                        <label className="label">Date of Birth:</label>
                        <input
                            className="input"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dob}
                            onChange={handleDateOfBirthChange}
                        />
                    </div>
                    <div className="form-row">
                        <label className="label">Age (Yr):<span className="mandatory">*</span></label>
                        <input
                            className="input"
                            type="text"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                        />
                        {errors.age && <div className="error">{errors.age}</div>}
                    </div>
                    <div className="form-row">
                        <label className="label">Mobile:<span className="mandatory">*</span></label>
                        <PhoneNumberInput
                            value={formData.mobile}
                            onChange={handlePhoneNumberChange}
                        />
                        {errors.mobile && <div className="error">{errors.mobile}</div>}
                    </div>
                    <div className="form-row newPatientDialogFormButtons">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">OK</button>
                    </div>
                </form>
            </div>
            {showBacksideDialog && (
                <SelectOptionDialog
                    show={showBacksideDialog}
                    onClose={onClose}
                    patientData={{
                        id : formData.id,
                        patientId: formData.patientId,
                        name: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
                        dob: formData.dob,
                        gender: formData.gender,
                        age: formData.age,
                        phone: formData.mobile,
                    }}
                />
            )}
        </>
    );
};

export default NewPatientDialog;

