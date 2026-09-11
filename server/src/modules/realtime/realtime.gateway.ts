import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';
import { IJwtUser } from '../../common/interfaces';
import { PrismaService } from '../../prisma';
import { TokenService } from '../token/token.service';

export const realtimeRooms = {
  user: (userId: string) => `user:${userId}`,
  organization: (organizationId: string) => `organization:${organizationId}`,
};

const socketOrigins = process.env.PUBLIC_APP_URL?.includes(',')
  ? process.env.PUBLIC_APP_URL.split(',').map((origin) => origin.trim())
  : process.env.PUBLIC_APP_URL ?? false;

@WebSocketGateway({ namespace: '/realtime', cors: { origin: socketOrigins, credentials: true } })
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async afterInit(server: Server): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not configured; realtime events are limited to this API instance');
      return;
    }

    try {
      const publisher = createClient({ url: redisUrl });
      const subscriber = publisher.duplicate();
      await Promise.all([publisher.connect(), subscriber.connect()]);
      const rootServer = typeof (server as any).adapter === 'function' ? server : (server as any).server;
      if (rootServer && typeof rootServer.adapter === 'function') {
        rootServer.adapter(createAdapter(publisher, subscriber));
        this.logger.log('Realtime Redis adapter connected');
      } else {
        this.logger.warn('Socket.IO root adapter method not found; fallback to default in-memory adapter');
      }
    } catch (error) {
      this.logger.error(`Realtime Redis adapter unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string' || !token) throw new UnauthorizedException();

      const payload = this.jwtService.verify<IJwtUser>(token);
      if (!payload.userId || !payload.refreshTokenId || await this.tokenService.isTokenRevoked(payload.refreshTokenId)) {
        throw new UnauthorizedException();
      }

      socket.join(realtimeRooms.user(payload.userId));
      if (payload.organizationId && payload.roleId) {
        const membership = await this.prisma.organizationMember.findUnique({
          where: { userId_organizationId: { userId: payload.userId, organizationId: payload.organizationId } },
          select: { roleId: true },
        });
        if (membership?.roleId === payload.roleId) {
          socket.join(realtimeRooms.organization(payload.organizationId));
        }
      }
    } catch {
      socket.disconnect(true);
    }
  }
}
