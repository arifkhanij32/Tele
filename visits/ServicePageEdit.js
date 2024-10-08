


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './statics/ServicePageEdit.css';

const ServicePageEdit = ({ show, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    patientId: '',
    firstName: '',
    middleName: null,
    lastName: null,
    gender: '',
    dob: '',
    age: '',
    phone: '',
  });

  const parseDate = (dateString) => {
    if (!dateString) return '';

    // Check if the date is in yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString; // Return as is if it's already in the correct format
    }

    // Check if the date is in dd-mm-yyyy format
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`; // Convert to yyyy-mm-dd format
    }

    // If the date is in the format 'dd Mon yyyy'
    const [day, monthName, year] = dateString.split(' ');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames.indexOf(monthName);
    if (month === -1) return ''; // Invalid month name
    const date = new Date(Date.UTC(year, month, day));
    if (isNaN(date)) return ''; // Invalid date
    return date.toISOString().split('T')[0]; // Return yyyy-mm-dd
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        patientId: initialData.patientId || initialData.patient_id,
        firstName: initialData.firstName,
        middleName: initialData.middleName,
        lastName: initialData.lastName,
        gender: initialData.gender,
        dob: parseDate(initialData.dob),  // Parse the date correctly
        age: initialData.age,
        phone: initialData.phone,
      });
    }
  }, [initialData]);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    if (name === 'dob') {
      updatedData.age = calculateAge(value);
    }
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const today = new Date();

    if (formData.dob > today.toISOString().split('T')[0]) {
      alert('Date of birth cannot be a future date.');
      return;
    }

    let singleName = formData.firstName;

    if (formData.middleName) {
        singleName += ` ${formData.middleName}`;
    }

    if (formData.lastName) {
        singleName += ` ${formData.lastName}`;
    }

    singleName = singleName.trim();

    const updatedData = {
      id: formData.id,
      patientId: formData.patientId,
      name: singleName,
      gender: formData.gender,
      dob: formData.dob,
      age: formData.age,
      phone: formData.phone,
    };

    console.log('Form submitted:', updatedData);

    try {
      const response = await axios.put(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/${formData.id}/`, updatedData);
      onSave(updatedData); // Call the onSave callback with the updated data
      onClose(); // Close the dialog
    } catch (error) {
      console.error('Error updating data:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (!show) {
    return null;
  }

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // yyyy-MM-dd
  };

  return (
    <div className="overlay">
      <div className="ServicePageEdit">
        <h2>Edit Patient Data</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient ID:</label>
            <input type="text" name="patientId" value={formData.patientId} disabled />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Middle Name:</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">None Selected</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date of Birth:</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              max={getTodayDate()}
            />
          </div>
          <div className="form-group">
            <label>Age (Yr):</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              readOnly
            />
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="ok-button">OK</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServicePageEdit;
