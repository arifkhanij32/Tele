import React, { useState } from 'react';
import './statics/SelectOptionDialog.css';
import ServicePage from './ServicePage';

const SelectOptionDialog = ({ show, onClose, patientData, onParentClose }) => {
  console.log("patientdata", patientData)
  const [selectedOption, setSelectedOption] = useState(null);
  const [showServicePage, setShowServicePage] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowServicePage(true);
  };

  const handleServicePageClose = () => {
    setShowServicePage(false);
    setSelectedOption(null);
    handleClose(); // Close SelectOptionDialog when ServicePage is closed
  };

  const handleSaveSelectedServices = (option, services) => {
    console.log('Saved services for option:', option, services);
  };

  const handleClose = () => {
    onClose();
    if (onParentClose) {
      onParentClose(); // Close the parent dialog as well
    }
  };

  return (
    <div className={`selectOptionDialog ${show ? 'show' : ''}`}>
      {!showServicePage ? (
        <>
          <div className="backsideDialogOverlay" onClick={handleClose}></div> {/* Use handleClose */}
          <div className="selectOptionDialog">
            <button onClick={handleClose} className="selectOptionDialog-closeButton">X</button> {/* Use handleClose */}
            <h2>Please select price list.</h2>
            <ul>
              <li onClick={() => handleOptionSelect('General')}>General</li>
              <li onClick={() => handleOptionSelect('Insurance')}>Insurance</li>
              <li onClick={() => handleOptionSelect('Beneficiary')}>Beneficiary</li>
            </ul>
          </div>
        </>
      ) : (
        <ServicePage
          selectedOption={selectedOption}
          onClose={handleServicePageClose}
          patientData={patientData}
          onSave={handleSaveSelectedServices}
        />
      )}
    </div>
  );
};

export default SelectOptionDialog;