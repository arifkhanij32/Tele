import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './statics/AddDiscount.css';

const AddDiscount = ({ isOpen, onRequestClose, onAddDiscount, netPrice }) => {
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [note, setNote] = useState('');
    const [totalPrice, setTotalPrice] = useState(netPrice);

    useEffect(() => {
        if (discountPercentage) {
            const discount = (netPrice * parseFloat(discountPercentage)) / 100;
            setDiscountAmount(discount.toFixed(2));
            setTotalPrice((netPrice - discount).toFixed(2));
        } else if (discountAmount) {
            setTotalPrice((netPrice - parseFloat(discountAmount)).toFixed(2));
        } else {
            setTotalPrice(netPrice.toFixed(2));
        }
    }, [discountPercentage, discountAmount, netPrice]);

    const handleAdd = () => {
        onAddDiscount({
            discountPercentage: parseFloat(discountPercentage) || 0,
            discountAmount: parseFloat(discountAmount) || 0,
            note,
        });
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="discount-modal"
            overlayClassName="overlay"
        >
            <h3>Enter discount</h3>
            <div className="input-group">
                <label>Discount Percentage:</label>
                <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => {
                        setDiscountPercentage(e.target.value);
                        setDiscountAmount('');
                    }}
                />
            </div>
            <div className="input-group">
                <label>Discount Amount:</label>
                <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => {
                        setDiscountAmount(e.target.value);
                        setDiscountPercentage('');
                    }}
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
                <button onClick={onRequestClose}>Cancel</button>
                <button onClick={handleAdd}>Add</button>
            </div>
        </Modal>
    );
};

export default AddDiscount;