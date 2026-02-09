import type { ConfirmChannel, ChannelModel, Channel, Replies } from "amqplib";
import type { SimpleQueueType } from "./common.js";
import msgpack from "@msgpack/msgpack";

export const publishJSON = <T>(ch: ConfirmChannel, exchange: string, routingKey: string, value: T) =>
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(value)), { contentType: "application/json" });

export const declareAndBind = async (conn: ChannelModel, exchange: string, queueName: string, key: string, queueType: SimpleQueueType): Promise<[Channel, Replies.AssertQueue]> => {
  const ch = await conn.createChannel();
  const queue = await ch.assertQueue(queueName, {
    durable: queueType === "durable",
    autoDelete: queueType === "transient",
    exclusive: queueType === "transient",
    arguments: {
      "x-dead-letter-exchange": "peril_dlx"
    },
  });
  await ch.bindQueue(queueName, exchange, key);
  return [ch, queue];
};

export const publishMsgPack = <T>(ch: ConfirmChannel, exchange: string, routingKey: string, value: T) =>
  ch.publish(exchange, routingKey, Buffer.from(msgpack.encode(value)), { contentType: "application/x-msgpack" });
