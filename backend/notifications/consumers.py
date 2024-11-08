# notifications/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']

        if user.is_authenticated:
            # Group notifications by user ID (using user.id as group name)
            self.group_name = f'user_{user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()  # Reject the connection if user is not authenticated

    async def disconnect(self, close_code):
        if self.scope['user'].is_authenticated:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message,
        }))