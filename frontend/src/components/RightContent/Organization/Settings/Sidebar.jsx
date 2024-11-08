import React from 'react';
import { FaCog, FaExchangeAlt, FaDatabase, FaHeadset } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ setActiveSection, activeSection }) => {
    return (
        <div className="sidebar">
            <div
                className={`sidebar-item ${activeSection === 'General' ? 'active' : ''}`}
                onClick={() => setActiveSection('General')}
            >
                <FaCog className="icon" />
                <span>General</span>
            </div>
            <div
                className={`sidebar-item ${activeSection === 'Import/Export' ? 'active' : ''}`}
                onClick={() => setActiveSection('Import/Export')}
            >
                <FaExchangeAlt className="icon" />
                <span>Import/Export</span>
            </div>
            <div
                className={`sidebar-item ${activeSection === 'Base' ? 'active' : ''}`}
                onClick={() => setActiveSection('Base')}
            >
                <FaDatabase className="icon" />
                <span>Base</span>
            </div>
            <div
                className={`sidebar-item ${activeSection === 'Help Desk' ? 'active' : ''}`}
                onClick={() => setActiveSection('Help Desk')}
            >
                <FaHeadset className="icon" />
                <span>Help Desk</span>
            </div>
        </div>
    );
};

export default Sidebar;
