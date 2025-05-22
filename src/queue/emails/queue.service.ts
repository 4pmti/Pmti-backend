import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { queues } from 'src/config/queue';

@Injectable()
export class EmailQueueService {
  private queueEvents: QueueEvents;

  constructor(@InjectQueue(queues.email) private readonly queue: Queue) {
    // Initialize QueueEvents
    this.queueEvents = new QueueEvents(queues.email, {
      connection: queue.opts.connection // Reuse the same Redis connection
    });
  }

  async addJob(data: {
    channelId: string;
  }) {
    const job = await this.queue.add(
      queues.email,
      data,
      {
        attempts: 5,              // Retry up to 5 times
        backoff: {
          type: 'exponential',    // Exponential backoff
          delay: 10000,           // Initial delay of 10 seconds
        },
        removeOnComplete: true,   // Remove completed jobs
        removeOnFail: false      // Keep failed jobs for debugging
      },
    );

    // Return both job and queueEvents
    return { job, queueEvents: this.queueEvents };
  }
}