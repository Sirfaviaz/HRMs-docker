// JobApplicationForm.js
import React, { useState } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import api from '../../../../services/api';

const JobApplicationForm = ({ jobId }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('job_posting', jobId);
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('email', values.email);
    formData.append('cover_letter', values.cover_letter);
    formData.append('resume', values.resume.file.originFileObj);

    try {
      setLoading(true);
      await api.post('/jobs/applications/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onFinish={handleSubmit} layout="vertical">
      <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      {/* Other form fields */}
      <Form.Item name="resume" label="Resume" rules={[{ required: true }]}>
        <Upload beforeUpload={() => false}>
          <Button>Click to Upload</Button>
        </Upload>
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
        Submit Application
      </Button>
    </Form>
  );
};

export default JobApplicationForm;
