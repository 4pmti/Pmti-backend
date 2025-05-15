import { BaseEntity } from "src/common/dto/base.dto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Review  extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    category: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    date: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    rating: number;

    @Column({ type: 'text', nullable: true })
    review: string;
}
