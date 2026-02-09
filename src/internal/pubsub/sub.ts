import type { ChannelModel, ConsumeMessage } from "amqplib";
import type { AckType, SimpleQueueType } from "./common.js"
import { declareAndBind } from "./pub.js";

export async function subscribeJSON<T>(conn: ChannelModel, exchange: string, queueName: string, key: string, queueType: SimpleQueueType, handler: (data: T) => Promise<AckType> | AckType): Promise<void> {
  const [ch, queue] = await declareAndBind(conn, exchange, queueName, key, queueType);
  ch.consume(queue.queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    const content: T = JSON.parse(msg.content.toString());
    const ackType = await handler(content);
    console.log(`AckType: ${ackType}`);
    switch (ackType) {
      case "Ack": ch.ack(msg); break;
      case "NackRequeue": ch.nack(msg, false, true); break;
      case "NackDiscard": ch.nack(msg, false, false); break;
    }
  });
};
