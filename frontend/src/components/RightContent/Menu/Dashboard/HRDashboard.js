import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const HRDashboard = () => {
  return (
    <Row gutter={16} justify="center">
      <Col span={12}>
        <Card style={{ width: 300, height: 200, textAlign: 'center' }}>
          <Typography.Title level={4}>HR Dashboard</Typography.Title>
          <Typography.Paragraph>Tasks and features for HR personnel go here.</Typography.Paragraph>
        </Card>
      </Col>
    </Row>
  );
};

export default HRDashboard;
