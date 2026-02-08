#!/bin/bash

case "$1" in
    start)
        sudo systemctl start rabbitmq-server
        ;;
    stop)
        echo "Stopping Peril RabbitMQ container..."
        sudo systemctl stop rabbitmq-server
        ;;
    logs)
        echo "Fetching logs for Peril RabbitMQ container..."
        sudo journalctl -u rabbitmq-server -f
        ;;
    *)
        echo "Usage: $0 {start|stop|logs}"
        exit 1
esac
