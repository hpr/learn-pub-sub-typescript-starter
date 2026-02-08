import type { ChannelModel, ConsumeMessage } from "amqplib";
import type { SimpleQueueType } from "./common.js"
import { declareAndBind } from "./pub.js";

export async function subscribeJSON<T>(conn: ChannelModel, exchange: string, queueName: string, key: string, queueType: SimpleQueueType, handler: (data: T) => void): Promise<void> {
  const [ch, queue] = await declareAndBind(conn, exchange, queueName, key, queueType);
  ch.consume(queue.queue, (msg: ConsumeMessage | null) => {
    if (!msg) return;
    const content: T = JSON.parse(msg.content.toString());
    handler(content);
    ch.ack(msg);
  });
};
