import React, { useState, useEffect } from 'react';
import './statics/ExistingPatientDialog.css';
import axios from 'axios';
import SelectOptionDialog from './SelectOptionDialog';

const ExistingPatientDialog = ({ show, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [showSelectOptionDialog, setShowSelectOptionDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (show) {
      axios.get(`${process.env.REACT_APP_LOCALHOST}/patients/api/visits/`)
        .then(response => {
          setPatients(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the patients!', error);
        });
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const filteredPatients = patients.filter(patient =>
    (patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone || '').includes(searchTerm) ||
    (patient.patientId || '').toString().includes(searchTerm)
  );

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAddVisitClick = () => {
    if (selectedPatient) {
      setShowSelectOptionDialog(true);
    } else {
      alert('Please select a patient first.');
    }
  };

  const handleRowDoubleClick = (patient) => {
    setSelectedPatient(patient);
    setShowSelectOptionDialog(true);
  };

  const handleSelectOptionDialogClose = () => {
    setShowSelectOptionDialog(false);
    setSelectedPatient(null);
  };

  return (
    <>
      {!showSelectOptionDialog && (
        <div className="existingPatientOverlay">
          <div className="existingPatientDialog">
            <button className="existingPatientCloseButton" onClick={onClose}>×</button>
            <h2>Please select Existing patient</h2>
            <div className="searchContainer">
              <input
                type="text"
                placeholder="Search here for name, mobile and patient ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="tableContainer">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>DOB</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, index) => (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(patient)}
                      onDoubleClick={() => handleRowDoubleClick(patient)}
                      className={selectedPatient === patient ? 'selected' : ''}
                    >
                      <td>{patient.patientId}</td>
                      <td>{patient.name}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.dob}</td>
                      <td>{patient.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="Existingfooter">
              <button onClick={handleAddVisitClick}>Add Visit</button>
            </div>
          </div>
        </div>
      )}

      {showSelectOptionDialog && (
        <SelectOptionDialog
          show={showSelectOptionDialog}
          onClose={handleSelectOptionDialogClose}
          patientData={selectedPatient}
          onParentClose={onClose} // Pass parent's onClose function
        />
      )}
    </>
  );
};

export default ExistingPatientDialog;