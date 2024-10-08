import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReferrerBarChart = ({ referrers }) => {
    // Extract referrer names, total revenue, and total referrals
    const labels = referrers.map(referrer => referrer.name);
    const totalRevenue = referrers.map(referrer => parseFloat(referrer.totalRevenue) || 0);
    const totalReferral = referrers.map(referrer => referrer.totalReferral || 0);

    const data = {
        labels,
        datasets: [
            {
                label: 'Total Revenue ($)',
                data: totalRevenue,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Total Referral',
                data: totalReferral,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Referrer Revenue and Referral Stats',
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default ReferrerBarChart;
