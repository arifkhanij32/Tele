import React, { useState } from 'react';
import './AdvancedDashboard.css';

const AdvancedDashboard = () => {
    const [dashboards] = useState([
        { name: 'Order & Reported Dashboard', customer: 'Sunket Sunsol, Kitwe, Zambia', cloudOnly: true },
        { name: 'Cashier & Payment Overview', customer: 'Sunket Sunsol, Kitwe, Zambia', cloudOnly: true },
        { name: 'Payment Report', customer: 'Sunket Sunsol, Kitwe, Zambia', cloudOnly: true },
        { name: 'Visit Dashboard', customer: 'Sunket Sunsol, Kitwe, Zambia', cloudOnly: true }
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredDashboards = dashboards.filter(dashboard =>
        dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="advanced-dashboard">
            <h1>Please select any dashboard</h1>
            <input
                type="text"
                placeholder="Search here for name."
                value={searchTerm}
                onChange={handleSearch}
            />
            <button>Refresh</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Customer</th>
                        <th>Cloud Only</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDashboards.map((dashboard, index) => (
                        <tr key={index}>
                            <td>{dashboard.name}</td>
                            <td>{dashboard.description || ''}</td>
                            <td>{dashboard.customer}</td>
                            <td>{dashboard.cloudOnly ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br></br>
            <button>Open</button>
            <button>Close</button>
            <div className="AdvancedDashboardfooter">
                <button className="footer-btn">Refresh</button>
                <button className="footer-btn" >Select Dashboard</button>
                <button className="footer-btn" >Export to Excel</button>
            </div>
        </div>
    );
};

export default AdvancedDashboard;