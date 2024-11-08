import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const ManagerDashboard = () => {
  return (
    <Row gutter={16} justify="center">
      <Col span={12}>
        <Card style={{ width: 300, height: 200, textAlign: 'center' }}>
          <Typography.Title level={4}>Manager Dashboard</Typography.Title>
          <Typography.Paragraph>Some statistics and tasks for the manager here.</Typography.Paragraph>
        </Card>
      </Col>
    </Row>
  );
};

export default ManagerDashboard;
