import './statics/PaymentSelectOption.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceModal from './ServiceModal';

function PaymentSelectOption({ closePaymentSelectOption, serviceID, patientData, fetchServiceDescriptions }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [services, setServices] = useState([]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setModalShow(true);
    };

    const handleCloseModal = () => {
        setModalShow(false);
        closePaymentSelectOption(); // Close the parent dialog
        fetchServiceDescriptions(); // Fetch the latest service descriptions
    };

    useEffect(() => {
        let apiEndpoint = '';
        if (selectedOption === 'General') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/general-services/`;
        } else if (selectedOption === 'Insurance') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/insurance-services/`;
        } else if (selectedOption === 'Beneficiary') {
            apiEndpoint = `${process.env.REACT_APP_LOCALHOST}/services/beneficiary-services/`;
        }

        if (apiEndpoint) {
            axios.get(apiEndpoint)
                .then(response => {
                    setServices(response.data || []);
                })
                .catch(error => console.error(`Error fetching ${selectedOption.toLowerCase()} services:`, error));
        }
    }, [selectedOption]);

    return (
        <div className={`payment-select-option-overlay ${modalShow ? 'hide-overlay' : ''}`}>
            <div className="payment-select-option-content">
                <button className="close-button" onClick={closePaymentSelectOption}>×</button>
                <h2>Please select price list.</h2>
                <ul>
                    <li onClick={() => handleOptionSelect('General')}>General</li>
                    <li onClick={() => handleOptionSelect('Insurance')}>Insurance</li>
                    <li onClick={() => handleOptionSelect('Beneficiary')}>Beneficiary</li>
                </ul>
            </div>
            {selectedOption && (
                <ServiceModal
                    show={modalShow}
                    handleClose={handleCloseModal}
                    services={services}
                    selectedOption={selectedOption}
                    serviceID={serviceID}
                    patientData={patientData}
                    closePaymentSelectOption={closePaymentSelectOption} // Pass down the function
                    fetchServiceDescriptions={fetchServiceDescriptions} // Pass the fetch function
                />
            )}
        </div>
    );
}

export default PaymentSelectOption;