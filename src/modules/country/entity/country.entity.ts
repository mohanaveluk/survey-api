import { Entity, PrimaryColumn, Column, CreateDateColumn, JoinColumn, ManyToOne, OneToMany, BeforeInsert } from 'typeorm';
import { PartyMaster } from '../../party-Master/entity/party-master.entity';
import { v4 as uuidv4 } from 'uuid';
import { Party } from 'src/modules/party/entity/party.entity';

@Entity({ name: 'country' })
export class Country {

    @PrimaryColumn()
    id: string;
    @BeforeInsert()
    generateId() {
        this.id = uuidv4();
    }

    @Column({ type: 'varchar', length: 120 })
    name: string;

    @Column({ name: 'iso_code', type: 'varchar', length: 5, nullable: true })
    isoCode: string;

    @Column({ name: 'created_at', type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;    

    @OneToMany(() => PartyMaster, (party) => party.countryId)
    parties: PartyMaster[];

    @OneToMany(() => Party, (party) => party.countryId)
    userParties: Party[];    
}