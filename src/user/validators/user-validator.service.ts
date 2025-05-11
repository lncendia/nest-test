import { User } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserValidatorService {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(user: User): Promise<void> {
    const owner = await this.userRepository.findByEmail(user.email);

    if (owner && owner.id != user.id) {
      throw new Error('User already exists');
    }
  }
}
