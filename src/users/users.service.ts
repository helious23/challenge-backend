import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import {
  ToggleSubscribeInput,
  ToggleSubscribeOutput,
} from './dtos/subscribe.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '../jwt/jwt.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Podcast } from '../podcast/entities/podcast.entity';
import {
  MarkEpisodeAsPlayedInput,
  MarkEpisodeAsPlayedOutput,
} from './dtos/mark-episode-played.dto';
import { Episode } from 'src/podcast/entities/episode.entity';
import {
  EditPasswordInput,
  EditPasswordOutput,
} from './dtos/edit-password.dto';
import * as bcrypt from 'bcrypt';
import { ToggleLikeInput, ToggleLikeOutput } from './dtos/like.dto';
import { MySubscriptionOutput } from './dtos/my-subscriptions.dto';
import { MyLikesOutput } from './dtos/my-likes.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Podcast)
    private readonly podcasts: Repository<Podcast>,
    @InjectRepository(Episode)
    private readonly episodes: Repository<Episode>,
    private readonly jwtService: JwtService,
  ) {}

  private readonly InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return { ok: false, error: `사용중인 이메일 입니다` };
      }
      const user = this.users.create({
        email,
        password,
        role,
      });
      await this.users.save(user);

      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '회원 가입을 할 수 없습니다',
      };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return { ok: false, error: '사용자를 찾을 수 없습니다' };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 맞지 않습니다',
        };
      }

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: '가입하지 않은 이메일 입니다',
      };
    }
  }

  async editProfile(
    userId: number,
    { email }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        if (user.email === email) {
          return {
            ok: false,
            error: '동일한 이메일로는 변경할 수 없습니다',
          };
        }
        const existUser = await this.users.findOne({
          where: {
            email,
          },
        });
        if (existUser?.email === email) {
          return {
            ok: false,
            error: '사용중인 이메일 입니다',
          };
        }
        user.email = email;
      }
      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '프로필을 수정하지 못했습니다',
      };
    }
  }

  async editPassword(
    userId: number,
    { password: newPassword }: EditPasswordInput,
  ): Promise<EditPasswordOutput> {
    try {
      const user = await this.users.findOne(userId);
      const { password: oldPassword } = await this.users.findOne(userId, {
        select: ['password'],
      });
      const samePassword = await bcrypt.compare(newPassword, oldPassword);
      if (samePassword) {
        return {
          ok: false,
          error: '동일한 비밀번호로는 변경할 수 없습니다',
        };
      }
      user.password = newPassword;
      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '패스워드를 수정하지 못했습니다',
      };
    }
  }

  async toggleSubscribe(
    user: User,
    { podcastId }: ToggleSubscribeInput,
  ): Promise<ToggleSubscribeOutput> {
    try {
      const podcast = await this.podcasts.findOne({ id: podcastId });
      if (!podcast) {
        return { ok: false, error: '팟캐스트를 찾을 수 없습니다' };
      }
      if (user.subscriptions.some(sub => sub.id === podcast.id)) {
        user.subscriptions = user.subscriptions.filter(
          sub => sub.id !== podcast.id,
        );
      } else {
        console.log('foo');
        user.subscriptions = [...user.subscriptions, podcast];
      }
      await this.users.save(user);
      return { ok: true };
    } catch (e) {
      console.log(e);
      return this.InternalServerErrorOutput;
    }
  }

  async toggleLike(
    user: User,
    { podcastId }: ToggleLikeInput,
  ): Promise<ToggleLikeOutput> {
    try {
      const podcast = await this.podcasts.findOne({ id: podcastId });
      if (!podcast) {
        return { ok: false, error: '팟캐스트를 찾을 수 없습니다' };
      }
      if (user.likes.some(like => like.id === podcast.id)) {
        user.likes = user.likes.filter(sub => sub.id !== podcast.id);
      } else {
        console.log('foo');
        user.likes = [...user.likes, podcast];
      }
      await this.users.save(user);
      return { ok: true };
    } catch {
      return this.InternalServerErrorOutput;
    }
  }

  async markEpisodeAsPlayed(
    user: User,
    { id: episodeId }: MarkEpisodeAsPlayedInput,
  ): Promise<MarkEpisodeAsPlayedOutput> {
    try {
      const episode = await this.episodes.findOne({ id: episodeId });
      if (!episode) {
        return { ok: false, error: 'Episode not found' };
      }
      user.playedEpisodes = [...user.playedEpisodes, episode];
      await this.users.save(user);
      return { ok: true };
    } catch {
      return this.InternalServerErrorOutput;
    }
  }

  async mySubscriptions(client: User): Promise<MySubscriptionOutput> {
    try {
      const user = await this.users.findOne({
        relations: ['subscriptions'],
        where: {
          id: client.id,
        },
      });
      const podcasts = user.subscriptions;
      return {
        ok: true,
        podcasts,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '구독중인 팟캐스트를 불러올 수 없습니다',
      };
    }
  }

  async myLikes(client: User): Promise<MyLikesOutput> {
    try {
      const user = await this.users.findOne({
        relations: ['likes'],
        where: {
          id: client.id,
        },
      });
      const likes = user.likes;
      return {
        ok: true,
        likes,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: '구독중인 팟캐스트를 불러올 수 없습니다',
      };
    }
  }
}
