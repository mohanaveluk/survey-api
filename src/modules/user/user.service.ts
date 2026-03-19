/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository
    ){    }

    async validateAccount(uniqueId) {
        try {
            const userResponse = await this.userRepository.validateAccount(uniqueId);
            if (userResponse === 'success') {
                return userResponse;
            }
            else {
                throw new NotFoundException('User not found');
            }

        } catch (error) {
            throw new NotFoundException('Failed to get user');
        }
    }
}
