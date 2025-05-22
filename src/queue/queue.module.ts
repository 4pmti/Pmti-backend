import { Module, forwardRef } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { UploadService } from "src/upload/upload.service";
import { EmailQueueService } from "./emails/queue.service";
import { EmailQueueProcessor } from "./emails/queue.processor";
import { queues } from "src/config/queue";
import { EmailService } from "src/common/services/email.service";

@Module({
    imports: [
        BullModule.registerQueue({
            name: queues.email,
        }),
        BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
        }),
        BullBoardModule.forFeature({
            name: queues.email,
            adapter: BullMQAdapter,
        }),
        TypeOrmModule.forFeature([
            User,
        ]),
    ],
    providers: [
        EmailService,
        UploadService,
        EmailQueueService,
        EmailQueueProcessor,
    ],
    exports: [
        BullModule,
        EmailQueueService,
    ],
})
export class QueueModule { }
