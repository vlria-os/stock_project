from confluent_kafka import Producer, Consumer
from app.chatbot.config import KAFKA_HOST

def get_producer() -> Producer:
    return Producer({'bootstrap.servers': KAFKA_HOST})

def get_consumer(group_id: str) -> Consumer:
    return Consumer({
        'bootstrap.servers': KAFKA_HOST,
        'group.id': group_id,
        'auto.offset.reset': 'earliest'
    })