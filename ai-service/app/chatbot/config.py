import os

OPENAI_API_KEY=os.environ["OPENAI_API_KEY"]
KAFKA_HOST=f"{os.environ['KAFKA_HOST']}:9092"
STOCK_SERVICE_URL="http://stock-service:8082"