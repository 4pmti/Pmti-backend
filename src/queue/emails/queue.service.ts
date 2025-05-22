import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { queues } from 'src/config/queue';
import { EmailJobData, RescheduleEmailData } from 'src/common/templates/types';

@Injectable()
export class EmailQueueService {
  private queueEvents: QueueEvents;

  constructor(@InjectQueue(queues.email) private readonly queue: Queue) {
    // Initialize QueueEvents
    this.queueEvents = new QueueEvents(queues.email, {
      connection: queue.opts.connection // Reuse the same Redis connection
    });
  }

  async addJob(data: EmailJobData) {
    await this.queue.add(
      queues.email, // Job type matching the processor
      data,          // Job data
      {
        attempts: 1,              // Retry up to 1 times
        backoff: {
          type: 'exponential',    // Exponential backoff
          delay: 1000,            // Initial delay of 1 second
        },
      },
    );
  }
}