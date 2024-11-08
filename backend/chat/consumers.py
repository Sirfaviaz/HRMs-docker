# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_room_id = self.scope['url_route']['kwargs'].get('chat_room_id')
        self.user = self.scope['user']

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Join the general chat list group
        await self.channel_layer.group_add('chat_list', self.channel_name)

        if self.chat_room_id:
            self.chat_room_group_name = f'chat_{self.chat_room_id}'
            # Join the specific chat room group
            await self.channel_layer.group_add(
                self.chat_room_group_name,
                self.channel_name
            )

        await self.accept()
        print("WebSocket connected: sending initial chat rooms")

        # Only send initial chat rooms if chat_room_id is not provided
        if not self.chat_room_id:
            await self.send_initial_chat_rooms()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('chat_list', self.channel_name)
        if self.chat_room_id:
            await self.channel_layer.group_discard(
                f'chat_{self.chat_room_id}',
                self.channel_name
            )

    async def send_initial_chat_rooms(self):
        chat_rooms = await self.get_user_chat_rooms(self.user)
        print(f"Sending initial chat rooms: {chat_rooms}")

        await self.send(text_data=json.dumps({
            'type': 'initial_chat_rooms',
            'chat_rooms': chat_rooms
        }))

    @database_sync_to_async
    def get_user_chat_rooms(self, user):
        # Get all chat rooms the user is part of
        chat_rooms = ChatRoom.objects.filter(participants=user).prefetch_related('participants')

        chat_room_list = []
        for chat_room in chat_rooms:
            # Get the last message for the chat room
            last_message = chat_room.messages.order_by('-timestamp').first()

            chat_room_list.append({
                "id": chat_room.id,
                "last_message": last_message.content if last_message else "",
                "last_message_timestamp": last_message.timestamp.isoformat() if last_message else "",
                "participants": [
                    {
                        "id": participant.id,
                        "username": participant.username,
                        "first_name": participant.first_name,
                        "last_name": participant.last_name
                    }
                    for participant in chat_room.participants.all()
                ],
            })
        return chat_room_list

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data['message']

        if not self.user.is_authenticated or not self.chat_room_id:
            return

        # Get the chat room
        chat_room = await self.get_chat_room(self.chat_room_id)

        # Create a new message in the database
        new_message = await self.create_message(self.user, chat_room, message_content)

        # Format the sender's name
        sender_name = f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username

        # Broadcast the message to all users in the room
        await self.channel_layer.group_send(
            f'chat_{self.chat_room_id}',
            {
                'type': 'chat_message',
                'message': new_message.content,
                'sender': sender_name,
                'sender_id': self.user.id,
                'chat_room_id': self.chat_room_id,
                'timestamp': new_message.timestamp.isoformat(),
            }
        )

        # Send a notification to update the chat list for all users
        await self.channel_layer.group_send(
            'chat_list',
            {
                'type': 'chat_list_update',
                'chat_room_id': self.chat_room_id,
                'last_message': new_message.content,
                'last_message_timestamp': new_message.timestamp.isoformat(),
            }
        )

    @database_sync_to_async
    def get_chat_room(self, chat_room_id):
        return ChatRoom.objects.get(id=chat_room_id)

    @database_sync_to_async
    def create_message(self, sender, chat_room, content):
        return Message.objects.create(sender=sender, chat_room=chat_room, content=content)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender_name': event['sender'],
            'sender_id': event['sender_id'],
            'chat_room_id': event['chat_room_id'],
            'timestamp': event['timestamp'],
        }))

    async def chat_list_update(self, event):
        chat_room = await self.get_chat_room(event['chat_room_id'])
        participants = await self.get_chat_room_participants(chat_room)

        await self.send(text_data=json.dumps({
            'type': 'chat_list_update',
            'chat_room_id': event['chat_room_id'],
            'last_message': event['last_message'],
            'last_message_timestamp': event['last_message_timestamp'],
            'participants': participants,
        }))

    @database_sync_to_async
    def get_chat_room_participants(self, chat_room):
        return [
            {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
            for user in chat_room.participants.all()
        ]
