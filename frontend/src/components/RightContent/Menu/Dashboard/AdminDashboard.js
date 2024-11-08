import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Progress, Typography } from 'antd';
import api from '../../../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,         // Field for total employees
    presentEmployees: 0,       // Field for present employees
    activeJobPostings: 0,
    pendingOnboarding: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin_app/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Calculate the percentage of present employees
  const presentPercent = (stats.presentEmployees / stats.totalEmployees) * 100;

  return (
    <Row gutter={16} justify="center">
      <Col span={8}>
        <Card
          style={{
            width: '300px',   // Fixed width for the card
            height: '300px',  // Fixed height for the card
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3>Present Employees</h3>

          {/* Progress Circle for Present Employees */}
          <Progress
            type="circle"
            percent={presentPercent} // Percentage for present employees
            strokeColor="#1890ff"    // Color for present employees
            width={120}              // Adjust size as needed
            format={() => `${stats.presentEmployees} Present`}
          />

          <Typography.Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
            Total Employees: {stats.totalEmployees}
          </Typography.Text>
        </Card>
      </Col>

      <Col span={8}>
        <Card
          style={{
            width: '300px',   // Fixed width for the card
            height: '300px',  // Fixed height for the card
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3>Active Job Postings</h3>
          <Progress
            type="circle"
            percent={(stats.activeJobPostings / 50) * 100} // Example max value
            format={(percent) => `${stats.activeJobPostings}`}
            strokeColor="#52c41a"
          />
        </Card>
      </Col>

      <Col span={8}>
        <Card
          style={{
            width: '300px',   // Fixed width for the card
            height: '300px',  // Fixed height for the card
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3>Pending Onboarding</h3>
          <Progress
            type="circle"
            percent={(stats.pendingOnboarding / 50) * 100} // Example max value
            format={(percent) => `${stats.pendingOnboarding}`}
            strokeColor="#faad14"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AdminDashboard;
