import { Injectable, Inject } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  async findOne(where: FindOptionsWhere<User>): Promise<User | null> {
    return this.userRepository.findOne({ where });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, user);
    return this.findOne({ id });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
