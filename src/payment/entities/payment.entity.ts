import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";

@Entity()
export class Payments {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column("decimal")
    amount: number;

    @Column()
    cardNumber: string;

    @Column()
    expirationDate: string;

    @Column()
    cvv: string;

    @Column({ nullable: true })
    invoiceNumber: string;

    @Column({ nullable: true })
    description: string;

    @Column({ unique: true })
    transactionId: string;

    @Column()
    studentLastName: string;

    @Column()
    studentFirstName: string;

    @Column({ nullable: true })
    company: string;

    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    zip: string;

    @Column()
    country: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @Column()
    studentAddress: string;

    @Column()
    studentCity: string;

    @Column()
    studentState: string;

    @Column()
    studentZip: string;

    @Column()
    studentCountry: string;

    @Column()
    studentPhone: string;

    @Column()
    studentEmail: string;


    @Column({ nullable: true })
    transactionName: string;
}
