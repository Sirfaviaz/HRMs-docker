import React, { useState } from 'react';
import { Card, Typography, Row, Col } from 'antd';
import UserMeetings from './GenericDashboard/UserMeetings'; // Import the UserMeetings component
import ClockInStatus from './GenericDashboard/ClockInStatus'; // Import the ClockInStatus component
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '16px',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const GenericWelcome = () => {
  const [items, setItems] = useState([
    { id: 'clockInStatus', content: <ClockInStatus /> },
    {
      id: 'welcomeCard',
      content: (
        <Card style={{ width: '400px', margin: '0 auto', textAlign: 'center' }}>
          <Typography.Title level={3}>Welcome!</Typography.Title>
          <Typography.Paragraph>
            It seems you don't have access to any specific admin, manager, or HR features.
            Please contact your administrator if this is an error.
          </Typography.Paragraph>
        </Card>
      ),
    },
    { id: 'userMeetings', content: <UserMeetings /> },
  ]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Row gutter={16} style={{ marginTop: '50px' }}>
          {items.map((item) => (
            <Col xs={24} sm={8} key={item.id}>
              <SortableItem id={item.id}>
                {item.content}
              </SortableItem>
            </Col>
          ))}
        </Row>
      </SortableContext>
    </DndContext>
  );
};

export default GenericWelcome;
