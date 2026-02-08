import type { ConfirmChannel, ChannelModel, Channel, Replies } from "amqplib";

export const publishJSON = <T>(ch: ConfirmChannel, exchange: string, routingKey: string, value: T) =>
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(value)), { contentType: "application/json" });

export type SimpleQueueType = "durable" | "transient";
export const declareAndBind = async (conn: ChannelModel, exchange: string, queueName: string, key: string, queueType: SimpleQueueType): Promise<[Channel, Replies.AssertQueue]> => {
  const ch = await conn.createChannel();
  const queue = await ch.assertQueue(queueName, {
    durable: queueType === "durable",
    autoDelete: queueType === "transient",
    exclusive: queueType === "transient",
  });
  await ch.bindQueue(queueName, exchange, key);
  return [ch, queue]
};
