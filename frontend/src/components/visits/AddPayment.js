import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './statics/AddPayment.css';

Modal.setAppElement('#root');

const AddPayment = ({ isOpen, onRequestClose, onAddPayment, balance, visitId, onUpdateVisitStatus, setRefundAmount, referrerId }) => {
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [amount, setAmount] = useState(balance);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (balance !== null && balance !== undefined) {
            setAmount(balance);
        }
    }, [balance]);

    const handleAdd = () => {
        const paymentAmount = parseFloat(amount);

        if (paymentAmount <= 0) {
            alert('Amount should be greater than 0');
            return;
        }

        if (paymentAmount > balance) {
            alert(`You cannot pay more than the balance amount of ${balance.toFixed(2)}`);
            return;
        }

        // Prepare the payment data for the API request
        const paymentData = {
            payment_mode: paymentMode,
            amount: paymentAmount,
            note: note,
            visit: visitId,
        };

        // First, post the payment data
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/payments/`, paymentData)
            .then(response => {
                console.log('Payment saved successfully:', response.data);
                const newBalance = balance - paymentAmount;
                const updatedStatus = newBalance <= 0 ? 'paid' : 'unpaid';

                // Update visit status
                axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_pay_status/${visitId}/`, { pay: updatedStatus })
                    .then(res => {
                        console.log('Visit pay status updated successfully:', res.data);
                        onUpdateVisitStatus(updatedStatus);
                        onAddPayment(paymentData);

                        // Set the refund amount to the exact amount paid
                        setRefundAmount(paymentAmount);

                        // Patch referrer data using the referrerId (assumes referrerId exists)
                        if (referrerId) {
                            const referrerPatchData = {
                                totalReferral: 1, // Increment total referrals by 1
                                totalRevenue: paymentAmount, // Update the total revenue
                            };

                            axios.patch(`${process.env.REACT_APP_LOCALHOST}/referrer/referrers/${referrerId}/update-total-referral/`, referrerPatchData)
                                .then(refResponse => {
                                    console.log('Referrer data updated successfully:', refResponse.data);
                                })
                                .catch(refError => {
                                    console.error('Error updating referrer data:', refError);
                                    alert('Error updating referrer data. Please try again.');
                                });
                        }

                        onRequestClose();
                    })
                    .catch(err => {
                        console.error('Error updating visit pay status:', err);
                        alert('Error updating visit pay status. Please try again.');
                    });
            })
            .catch(error => {
                console.error('There was an error saving the payment!', error);
                let errorMessage = 'There was an error saving the payment. Please try again.';
                if (error.response) {
                    errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
                } else if (error.request) {
                    errorMessage = 'Error: No response received from the server.';
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
                alert(errorMessage);
            });
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="payment-modal" overlayClassName="overlay">
            <h3>Select mode of payment and enter amount to pay</h3>
            <div className="input-group">
                <label>Payment Mode:</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="input-group">
                <label>Amount:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label>Note:</label>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
            <div className="button-container">
                <button onClick={handleAdd}>Pay</button>
                <button onClick={onRequestClose}>Cancel</button>
            </div>
        </Modal>
    );
};

export default AddPayment;
