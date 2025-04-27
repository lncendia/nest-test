import { UserRepository } from '../repositories/user.repository';
import { UserValidator } from './user.validator';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../models/user.model';
import { PasswordHasher } from '../../common/password-hasher/password-hasher.service';
import { PasswordValidator } from './password.validator';
import { Inject, Injectable } from '@nestjs/common';
import { TokenGeneratorService } from '../../common/token-generator/token-generator.service';

@Injectable()
export class UserManager {
  constructor(
    private userRepository: UserRepository,
    private userValidator: UserValidator,
    private passwordValidator: PasswordValidator,
    private passwordHasher: PasswordHasher,
    @Inject('EmailTokenGenerator')
    private emailTokenGenerator: TokenGeneratorService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = new User();

    user.email = dto.email;

    await this.userValidator.validate(user);
    await this.passwordValidator.validate(dto.password);
    user.passwordHash = await this.passwordHasher.hash(dto.password);
    this.updateSecurityStamp(user);
    return await this.userRepository.add(user);
  }

  async passwordAuthenticate(user: User, password: string) {
    if (!(await this.passwordHasher.compare(password, user.passwordHash)))
      throw new Error('Passwords do not match');
  }

  generateEmailConfirmationToken(user: User): string {
    if (user.emailConfirmed) throw new Error('Email already confirmed');
    return this.emailTokenGenerator.generate(
      'EmailConfirmation',
      user.id,
      user.securityStamp,
    );
  }

  async confirmEmail(user: User, token: string) {
    if (user.emailConfirmed) throw new Error('Email already confirmed');
    const validationResult = this.emailTokenGenerator.validate(
      'EmailConfirmation',
      user.id,
      user.securityStamp,
      token,
    );
    if (!validationResult) throw new Error('Token incorrect');

    user.emailConfirmed = true;
    this.updateSecurityStamp(user);
    await this.userRepository.update(user);
  }

  private updateSecurityStamp(user: User) {
    user.securityStamp = crypto.randomUUID();
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}
