import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/users/role.enum';
import { FriendStatus } from '../src/friends/friend.entity';
import { DataSource } from 'typeorm';

describe('Friends (e2e)', () => {
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
  let user3Token: string;
  let user1Id: string;
  let user2Id: string;
  let user3Id: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    // Get the DataSource for database operations
    dataSource = app.get(DataSource);

    // Clear database before starting tests
    await global.databaseUtils.clearAndSynchronize(dataSource);

    // Create test users
    const user1Email = global.testUtils.generateUniqueEmail('user1');
    const user2Email = global.testUtils.generateUniqueEmail('user2');
    const user3Email = global.testUtils.generateUniqueEmail('user3');

    // Register user 1
    const user1Response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: user1Email,
        name: 'User 1',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      })
      .expect(201);

    user1Id = user1Response.body.user.id;
    user1Token = user1Response.body.accessToken;

    // Register user 2
    const user2Response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: user2Email,
        name: 'User 2',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      })
      .expect(201);

    user2Id = user2Response.body.user.id;
    user2Token = user2Response.body.accessToken;

    // Register user 3
    const user3Response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: user3Email,
        name: 'User 3',
        password: 'Password123!',
        userRole: UserRole.MATCHMAKER,
      })
      .expect(201);

    user3Id = user3Response.body.user.id;
    user3Token = user3Response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/friends/request/:receiverId (POST)', () => {
    it('should send friend request successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/friends/request/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('senderId', user1Id);
      expect(response.body).toHaveProperty('receiverId', user2Id);
      expect(response.body).toHaveProperty('status', FriendStatus.PENDING);
    });

    it('should fail to send friend request to self', async () => {
      await request(app.getHttpServer())
        .post(`/friends/request/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);
    });

    it('should fail to send friend request to non-existent user', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      await request(app.getHttpServer())
        .post(`/friends/request/${nonExistentId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });

    it('should fail to send duplicate friend request', async () => {
      await request(app.getHttpServer())
        .post(`/friends/request/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(409);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/friends/request/${user2Id}`)
        .expect(401);
    });
  });

  describe('/friends (GET)', () => {
    it('should get friends list', async () => {
      const response = await request(app.getHttpServer())
        .get('/friends')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/friends').expect(401);
    });
  });

  describe('/friends/pending (GET)', () => {
    it('should get pending friend requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/friends/pending')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/friends/sent (GET)', () => {
    it('should get sent friend requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/friends/sent')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/friends/accept/:id (PATCH)', () => {
    let friendRequestId: string;

    beforeAll(async () => {
      // Get the pending request ID
      const response = await request(app.getHttpServer())
        .get('/friends/pending')
        .set('Authorization', `Bearer ${user2Token}`);

      friendRequestId = response.body[0].id;
    });

    it('should accept friend request successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/friends/accept/${friendRequestId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', FriendStatus.ACCEPTED);
    });

    it('should fail to accept non-existent request', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      await request(app.getHttpServer())
        .patch(`/friends/accept/${nonExistentId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);
    });
  });

  describe('/friends/block/:targetId (PATCH)', () => {
    it('should block user successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/friends/block/${user3Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', FriendStatus.BLOCKED);
    });

    it('should fail to block self', async () => {
      await request(app.getHttpServer())
        .patch(`/friends/block/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);
    });
  });

  describe('/friends/remove/:targetId (DELETE)', () => {
    it('should remove friend successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/friends/remove/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);
    });

    it('should fail to remove non-existent friendship', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      await request(app.getHttpServer())
        .delete(`/friends/remove/${nonExistentId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });
});
