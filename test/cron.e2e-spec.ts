// Copyright 2016-present Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { NestExpressApplication } from '@nestjs/platform-express';
import { fail } from 'assert';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { CronService } from 'src//observers/cron.service';
import { AccessTokenService } from 'src/api/administrators/access-token.service';
import { BouncesService } from 'src/api/bounces/bounces.service';
import { BaseController } from 'src/api/common/base.controller';
import { ConfigurationsService } from 'src/api/configurations/configurations.service';
import { NotificationsService } from 'src/api/notifications/notifications.service';
import { SubscriptionsService } from 'src/api/subscriptions/subscriptions.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CronTasksService } from 'src/observers/cron-tasks.service';
import { RssService } from 'src/rss/rss.service';
import supertest from 'supertest';
import {
  getAppAndClient,
  runAsSuperAdmin,
  setupApplication,
  wait,
} from './test-helper';
let client: supertest.SuperTest<supertest.Test>;
let app: NestExpressApplication;
let rssService: RssService;
let notificationsService: NotificationsService;
let subscriptionsService: SubscriptionsService;
let configurationsService: ConfigurationsService;
let bouncesService: BouncesService;
let accessTokenService: AccessTokenService;
let cronTasksService: CronTasksService;
let appConfigService: AppConfigService;
let cronService: CronService;
beforeEach(() => {
  ({ app, client } = getAppAndClient());
  rssService = app.get<RssService>(RssService);
  notificationsService = app.get<NotificationsService>(NotificationsService);
  subscriptionsService = app.get<SubscriptionsService>(SubscriptionsService);
  configurationsService = app.get<ConfigurationsService>(ConfigurationsService);
  bouncesService = app.get<BouncesService>(BouncesService);
  accessTokenService = app.get<AccessTokenService>(AccessTokenService);
  cronTasksService = app.get<CronTasksService>(CronTasksService);
  cronService = app.get<CronService>(CronService);
  appConfigService = app.get<AppConfigService>(AppConfigService);
});

describe('CRON purgeData', function () {
  it('should deleted old non-inApp notifications', async function () {
    await notificationsService.create({
      channel: 'email',
      isBroadcast: true,
      message: {
        title: 'test',
        body: 'this is a test',
      },
      serviceName: 'pastService',
      created: '2010-01-01',
      state: 'sent',
    });
    await notificationsService.create({
      channel: 'email',
      isBroadcast: true,
      message: {
        title: 'test',
        body: 'this is a test',
      },
      serviceName: 'futureService',
      created: '3020-01-01',
      state: 'sent',
    });
    try {
      await cronTasksService.purgeData()();
    } catch (err: any) {
      fail(err);
    }
    let data = await notificationsService.findAll(
      {
        where: {
          serviceName: 'futureService',
          channel: 'email',
        },
      },
      undefined,
    );
    expect(data.length).toEqual(1);
    data = await notificationsService.findAll(
      {
        where: {
          serviceName: 'pastService',
          channel: 'email',
        },
      },
      undefined,
    );
    expect(data.length).toEqual(0);
  });

  it('should delete all expired inApp notifications', async function () {
    await notificationsService.create({
      channel: 'inApp',
      isBroadcast: true,
      message: {
        title: 'test',
        body: 'this is a test',
      },
      serviceName: 'expiredService',
      validTill: '2010-01-01',
      state: 'new',
    });
    await notificationsService.create({
      channel: 'inApp',
      isBroadcast: true,
      message: {
        title: 'test',
        body: 'this is a test',
      },
      serviceName: 'nonexpiredService',
      validTill: '3010-01-01',
      state: 'new',
    });
    try {
      await cronTasksService.purgeData()();
    } catch (err: any) {
      fail(err);
    }
    let data = await notificationsService.findAll(
      {
        where: {
          serviceName: 'nonexpiredService',
          channel: 'inApp',
        },
      },
      undefined,
    );
    expect(data.length).toEqual(1);
    data = await notificationsService.findAll(
      {
        where: {
          serviceName: 'expiredService',
          channel: 'inApp',
        },
      },
      undefined,
    );
    expect(data.length).toEqual(0);
  });

  it('should delete all deleted inApp notifications', async function () {
    await notificationsService.create({
      channel: 'inApp',
      userId: 'foo',
      message: {
        title: 'test',
        body: 'this is a test',
      },
      serviceName: 'deletedService',
      state: 'deleted',
    });
    try {
      await cronTasksService.purgeData()();
    } catch (err: any) {
      fail(err);
    }
    const data = await notificationsService.findAll(
      {
        where: {
          serviceName: 'deletedService',
          channel: 'inApp',
        },
      },
      undefined,
    );
    expect(data.length).toEqual(0);
  });

  it('should delete all old non-confirmed subscriptions', async function () {
    await subscriptionsService.create({
      serviceName: 'unconfirmedService',
      channel: 'email',
      userChannelId: 'bar@foo.com',
      state: 'unconfirmed',
      confirmationRequest: {
        confirmationCodeRegex: '\\d{5}',
        sendRequest: true,
        from: 'no_reply@invlid.local',
        subject: 'Subscription confirmation',
        textBody: 'enter {confirmation_code} in email!',
        confirmationCode: '53007',
      },
      updated: '2010-01-01',
    });
    try {
      await cronTasksService.purgeData()();
    } catch (err: any) {
      fail(err);
    }
    const data = await subscriptionsService.findAll(
      {
        where: {
          serviceName: 'unconfirmedService',
          channel: 'email',
        },
      },
      undefined,
    );
    expect(data.length).toEqual(0);
  });

  it('should delete all old deleted bounces', async function () {
    await bouncesService.create({
      channel: 'email',
      userChannelId: 'foo@invalid.local',
      state: 'deleted',
      updated: '2010-01-01',
    });
    const mockedPromiseAll = jest.spyOn(Promise, 'all');
    try {
      await cronTasksService.purgeData()();
      expect((await mockedPromiseAll.mock.results[0].value)[4].count).toEqual(
        1,
      );
    } catch (err: any) {
      fail(err);
    }
    let data;
    try {
      data = await bouncesService.findById('1');
    } catch (ex) {}
    expect(data).toBeUndefined();
  });

  it('should not delete any newly deleted bounces', async function () {
    let data = await bouncesService.create({
      channel: 'email',
      userChannelId: 'foo@invalid.local',
      state: 'deleted',
      updated: new Date(),
    });
    const mockedPromiseAll = jest.spyOn(Promise, 'all');
    try {
      await cronTasksService.purgeData()();
      expect((await mockedPromiseAll.mock.results[0].value)[4].count).toEqual(
        0,
      );
    } catch (err: any) {
      fail(err);
    }
    data = await bouncesService.findById(data.id);
    expect(data).not.toBeNull();
  });

  it('should delete all expired access tokens', async function () {
    const id1 = new mongoose.Types.ObjectId();
    const id2 = new mongoose.Types.ObjectId();
    await accessTokenService.create({
      _id: '1',
      ttl: 0,
      created: '2020-02-10T20:22:05.045Z',
      userId: id1,
    });
    await accessTokenService.create({
      _id: '2',
      created: '2020-02-10T20:22:05.045Z',
      userId: id2,
    });
    try {
      await cronTasksService.purgeData()();
    } catch (err: any) {
      fail(err);
    }
    let data = await accessTokenService.findAll({
      where: {
        userId: id1,
      },
    });
    expect(data.length).toEqual(0);
    data = await accessTokenService.findAll({
      where: {
        userId: id2,
      },
    });
    expect(data.length).toEqual(1);
  });
});

describe('CRON dispatchLiveNotifications', function () {
  let beforeEachRes;
  beforeEach(async function () {
    beforeEachRes = await Promise.all([
      (async () => {
        return notificationsService.create({
          channel: 'email',
          message: {
            from: 'admin@foo.com',
            subject: 'test',
            textBody: 'this is a test {http_host}',
          },
          isBroadcast: true,
          serviceName: 'myService',
          httpHost: 'http://foo.com',
          asyncBroadcastPushNotification: false,
          invalidBefore: '2010-01-01',
          state: 'new',
        });
      })(),
      (async () => {
        return notificationsService.create({
          channel: 'email',
          message: {
            from: 'admin@foo.com',
            subject: 'test',
            textBody: 'this is another test {http_host}',
          },
          serviceName: 'myService',
          httpHost: 'http://foo.com',
          userChannelId: 'bar@foo.com',
          invalidBefore: '3010-01-01',
          state: 'new',
        });
      })(),
      (async () => {
        return subscriptionsService.create({
          serviceName: 'myService',
          channel: 'email',
          userChannelId: 'bar@foo.com',
          state: 'confirmed',
          unsubscriptionCode: '12345',
        });
      })(),
    ]);
  });
  it('should send all live push notifications', async function () {
    await runAsSuperAdmin(async () => {
      jest.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
        if (options?.method === 'PUT') {
          const r = await client
            .put(url.toString())
            .send(JSON.parse(options?.body as string));
          return new Response(JSON.stringify(r.body));
        }
      });
      const mockedPromiseAll = jest.spyOn(Promise, 'all');
      try {
        await cronTasksService.dispatchLiveNotifications()();
        expect((await mockedPromiseAll.mock.results[0].value).length).toEqual(
          1,
        );
      } catch (err: any) {
        fail(err);
      }
      await wait(3000);
      const mockedSendEmail = BaseController.prototype
        .sendEmail as unknown as jest.SpyInstance;
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      const subId = beforeEachRes[2].id;
      expect(mockedSendEmail).toHaveBeenLastCalledWith(
        expect.objectContaining({
          from: 'admin@foo.com',
          to: 'bar@foo.com',
          subject: 'test',
          text: 'this is a test http://foo.com',
          html: undefined,
          list: {
            id: 'http://foo.com/myService',
            unsubscribe: [
              [
                `un-${subId}-12345@invalid.local`,
                `http://foo.com/api/subscriptions/${subId}/unsubscribe?unsubscriptionCode=12345`,
              ],
            ],
          },
        }),
      );

      const data = await notificationsService.findAll(
        {
          where: {
            serviceName: 'myService',
            channel: 'email',
            state: 'sent',
          },
        },
        undefined,
      );
      expect(data.length).toEqual(1);
    });
  });
});

describe('CRON checkRssConfigUpdates', function () {
  let beforeEachRes;
  beforeEach(async function () {
    jest.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
      switch (url) {
        case 'http://myService/rss':
          const output = fs.createReadStream(path.join(__dirname, 'rss.xml'));
          return new Response(output as unknown as BodyInit, {
            status: 200,
          });
        case 'http://foo/api/notifications':
          const r = await client
            .post('/api/notifications')
            .send(JSON.parse(options?.body as string));
          return new Response(JSON.stringify(r.body));
      }
    });
    beforeEachRes = await Promise.all([
      configurationsService.create({
        name: 'notification',
        serviceName: 'myService',
        value: {
          rss: {
            url: 'http://myService/rss',
            timeSpec: '0 0 1 1 0',
            outdatedItemRetentionGenerations: 1,
            includeUpdatedItems: false,
            fieldsToCheckForUpdate: ['title'],
          },
          messageTemplates: {
            email: {
              from: 'no_reply@invlid.local',
              subject: '{title}',
              textBody: '{description}',
              htmlBody: '{description}',
            },
          },
          httpHost: 'http://foo',
        },
      }),
      subscriptionsService.create({
        serviceName: 'myService',
        channel: 'email',
        userChannelId: 'bar@foo.com',
        state: 'confirmed',
        unsubscriptionCode: '12345',
      }),
    ]);
  });
  afterEach(() => {
    const rssTasks = cronTasksService.getRssTasks();
    if (!rssTasks) return;
    for (const idx in rssTasks) {
      rssTasks[idx].stop();
      delete rssTasks[idx];
    }
  });
  it('should create rss task and post notifications at initial run', async function () {
    try {
      const rssTasks = await cronTasksService.checkRssConfigUpdates(true);
      expect(rssTasks[beforeEachRes[0].id.toString()]).not.toBeNull();
    } catch (err: any) {
      fail(err);
    }
    await wait(1000);
    expect(fetch as unknown as jest.SpyInstance).toBeCalledWith(
      'http://foo/api/notifications',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringMatching('"httpHost":"http://foo"'),
      }),
    );
    const results = await rssService.findAll();
    expect(results?.[0].items?.[0].author).toEqual('foo');
  });
  it('should avoid sending notification for unchanged items', async function () {
    const data: any = {
      serviceName: 'myService',
      items: [
        {
          title: 'Item 2',
          description: 'lorem ipsum',
          summary: 'lorem ipsum',
          pubDate: '1970-01-01T00:00:00.000Z',
          link: 'http://myservice/2',
          guid: '2',
          author: 'foo',
          _notifyBCLastPoll: '1970-01-01T00:00:00.000Z',
        },
        {
          title: 'Item 1',
          description: 'lorem ipsum',
          summary: 'lorem ipsum',
          pubDate: '1970-01-01T00:00:00.000Z',
          link: 'http://myservice/1',
          guid: '1',
          author: 'foo',
          _notifyBCLastPoll: '1970-01-01T00:00:00.000Z',
        },
      ],
      lastPoll: '1970-01-01T00:00:00.000Z',
    };
    await rssService.create(data);
    await cronTasksService.checkRssConfigUpdates(true);
    await wait(2000);
    expect(fetch as unknown as jest.SpyInstance).not.toBeCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' }),
    );
    const results = await rssService.findAll();
    expect(results[0].items[0].author).toEqual('foo');
  });
  it('should send notification for updated item', async function () {
    const res = await configurationsService.findById(
      beforeEachRes[0].id.toString(),
    );
    const newVal = res.value;
    newVal.rss.includeUpdatedItems = true;
    newVal.rss.outdatedItemRetentionGenerations = 100;
    await configurationsService.updateById(res.id, { value: newVal });
    const data: any = {
      serviceName: 'myService',
      items: [
        {
          title: 'Item',
          description: 'lorem ipsum',
          pubDate: '1970-01-01T00:00:00.000Z',
          link: 'http://myservice/1',
          guid: '1',
          author: 'foo',
          _notifyBCLastPoll: '1970-01-01T00:00:00.000Z',
        },
      ],
      lastPoll: '1970-01-01T00:00:00.000Z',
    };
    await rssService.create(data);
    await cronTasksService.checkRssConfigUpdates(true);
    await wait(2000);

    expect(fetch as unknown as jest.SpyInstance).lastCalledWith(
      expect.stringContaining('/api/notifications'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
  it('should handle error', async function () {
    // (fetch as unknown as jest.SpyInstance).mockRestore();
    jest.spyOn(global, 'fetch').mockImplementation(async function () {
      return new Response(null, {
        status: 300,
      });
    });
    const loggerErrorSpy = jest
      .spyOn(cronTasksService.logger, 'error')
      .mockReturnValueOnce(null);
    await cronTasksService.checkRssConfigUpdates(true);
    await wait(1000);
    expect(loggerErrorSpy).toBeCalledWith(
      expect.objectContaining({
        message: 'Bad status code',
      }),
    );
  });
});

describe('CRON deleteBounces', () => {
  it('should delete bounce records in which no messages since latestNotificationStarted', async () => {
    const bounce = await bouncesService.create({
      channel: 'email',
      userChannelId: 'foo@invalid.local',
      hardBounceCount: 6,
      state: 'active',
      latestNotificationStarted: '2018-09-30T17:27:44.501Z',
      latestNotificationEnded: '2018-07-30T17:27:45.261Z',
      bounceMessages: [
        {
          date: '2018-08-30T17:27:45.784Z',
          message: 'blah',
        },
      ],
    });
    try {
      await cronTasksService.deleteBounces()();
    } catch (err: any) {
      fail(err);
    }
    const item = await bouncesService.findById(bounce.id);
    expect(item.state).toEqual('deleted');
  });
  it('should not delete bounce records in which there are messages since latestNotificationStarted', async function () {
    const bounce = await bouncesService.create({
      channel: 'email',
      userChannelId: 'foo@invalid.local',
      hardBounceCount: 6,
      state: 'active',
      latestNotificationStarted: '2018-07-30T17:27:44.501Z',
      latestNotificationEnded: '2018-07-30T17:27:45.261Z',
      bounceMessages: [
        {
          date: '2018-08-30T17:27:45.784Z',
          message: 'blah',
        },
      ],
    });
    try {
      await (
        await cronTasksService.deleteBounces()
      )();
    } catch (err: any) {
      fail(err);
    }
    const item = await bouncesService.findById(bounce.id);
    expect(item.state).toEqual('active');
  });
});

describe('CRON reDispatchBroadcastPushNotifications', () => {
  let subId;
  beforeEach(async () => {
    subId = (
      await subscriptionsService.create({
        serviceName: 'myService',
        channel: 'email',
        userChannelId: 'bar@foo.com',
        state: 'confirmed',
        unsubscriptionCode: '12345',
      })
    ).id;
    await notificationsService.create({
      channel: 'email',
      message: {
        from: 'admin@foo.com',
        subject: 'test',
        textBody: 'this is a test http://foo.com',
      },
      isBroadcast: true,
      serviceName: 'myService',
      httpHost: 'http://foo.com',
      asyncBroadcastPushNotification: false,
      state: 'sending',
      updated: new Date(new Date().valueOf() - 601000).toUTCString(),
      dispatch: {
        candidates: [subId],
      },
    });
  });

  it('should reDispatch broadcast push notifications', async () => {
    await runAsSuperAdmin(async () => {
      jest.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
        if (options.method === 'PUT') {
          const r = await client
            .put(url.toString())
            .send(JSON.parse(options?.body as string));
          return new Response(JSON.stringify(r.body));
        }
      });

      try {
        const promiseAllSpy = jest.spyOn(Promise, 'all');
        await cronTasksService.reDispatchBroadcastPushNotifications()();
        const value = await promiseAllSpy.mock.results?.[0].value;
        expect(value.length).toEqual(1);
      } catch (err: any) {
        fail(err);
      }
      await wait(3000);
      const mockedSendEmail = BaseController.prototype
        .sendEmail as unknown as jest.SpyInstance;
      expect(mockedSendEmail).toBeCalledWith(
        expect.objectContaining({
          from: 'admin@foo.com',
          to: 'bar@foo.com',
          subject: 'test',
          text: 'this is a test http://foo.com',
          html: undefined,
          list: {
            id: 'http://foo.com/myService',
            unsubscribe: [
              [
                `un-${subId}-12345@invalid.local`,
                `http://foo.com/api/subscriptions/${subId}/unsubscribe?unsubscriptionCode=12345`,
              ],
            ],
          },
        }),
      );
      const data = await notificationsService.findAll(
        {
          where: {
            serviceName: 'myService',
            channel: 'email',
            state: 'sent',
          },
        },
        undefined,
      );
      expect(data.length).toEqual(1);
      expect(data[0].dispatch?.successful).toContainEqual(subId);
    });
  });
});

describe('CRON clearRedisDatastore', function () {
  let thisApp: NestExpressApplication;
  let ready: jest.Mock<any, any, any>;
  let disconnect: jest.Mock<any, any, any>;
  let spiedBottleneck: jest.SpyInstance<any, any, any>;

  beforeEach(async function () {
    const { app } = await setupApplication({
      email: { throttle: { enabled: true, datastore: 'ioredis' } },
      sms: { throttle: { enabled: true, datastore: 'ioredis' } },
    });
    thisApp = app;
    ready = jest.fn();
    disconnect = jest.fn();
    spiedBottleneck = (
      jest.spyOn(CronTasksService, 'Bottleneck') as jest.SpyInstance<any, any>
    ).mockReturnValue({ ready, disconnect });
  });

  afterEach(async () => {
    await thisApp.close();
  });

  it('should not clear datastore when there is sending notification', async function () {
    const notificationsService =
      thisApp.get<NotificationsService>(NotificationsService);
    await Promise.all([
      notificationsService.create({
        channel: 'sms',
        message: {
          textBody: 'this is a test http://foo.com',
        },
        isBroadcast: true,
        serviceName: 'myService',
        state: 'sending',
      }),
      notificationsService.create({
        channel: 'email',
        isBroadcast: true,
        serviceName: 'myService',
        state: 'sending',
      }),
    ]);
    const cronTasksService = thisApp.get<CronTasksService>(CronTasksService);
    await cronTasksService.clearRedisDatastore()();
    expect(spiedBottleneck).not.toBeCalled();
    expect(spiedBottleneck.mock.instances).toHaveLength(0);
  });

  it('should clear datastore when no sending notification', async function () {
    await cronTasksService.clearRedisDatastore()();
    expect(spiedBottleneck).nthCalledWith(
      1,
      expect.objectContaining({
        clearDatastore: true,
        datastore: 'ioredis',
        id: 'notifyBCSms',
      }),
    );
    expect(spiedBottleneck).nthCalledWith(
      2,
      expect.objectContaining({
        clearDatastore: true,
        datastore: 'ioredis',
        id: 'notifyBCEmail',
      }),
    );
    expect(ready).toBeCalledTimes(2);
    expect(disconnect).toBeCalledTimes(2);
  });
});

describe('CronService Tests', () => {
  // Shared mock config.
  const mockConfig = {
    cron: {
      purgeData: { timeSpec: '* * * * *' },
      dispatchLiveNotifications: { timeSpec: '* * * * *' },
      checkRssConfigUpdates: { timeSpec: '* * * * *' },
      deleteBounces: { timeSpec: '* * * * *' },
      reDispatchBroadcastPushNotifications: { timeSpec: '* * * * *' },
      clearRedisDatastore: { timeSpec: '* * * * *' },
    },
    sms: {
      throttle: { enabled: true, clearDatastore: false, datastore: 'remote' },
    },
    email: {
      throttle: { enabled: true, clearDatastore: false, datastore: 'remote' },
    },
  };

  // Mocked AppConfigService with basic config retrieval functionality.
  const mockAppConfigService = {
    config: mockConfig,
    get: jest.fn((propName) => {
      if (!propName) {
        return mockConfig;
      }
      return mockConfig[propName] || {};
    }),
  } as unknown as AppConfigService;

  let cronService: CronService;
  let cronTasksService: CronTasksService;

  beforeEach(() => {
    // Mock the CronTasksService with jest functions.
    cronTasksService = {
      purgeData: jest.fn(),
      dispatchLiveNotifications: jest.fn(),
      checkRssConfigUpdates: jest.fn(),
      deleteBounces: jest.fn(),
      reDispatchBroadcastPushNotifications: jest.fn(),
      clearRedisDatastore: jest.fn(),
    } as unknown as CronTasksService;

    // Instantiate CronService with mocked AppConfigService and CronTasksService.
    cronService = new CronService(mockAppConfigService, cronTasksService);

    // Reset environment variables for normal operation.
    process.env.NOTIFYBC_NODE_ROLE = '';
    process.env.NODE_ENV = '';
  });

  afterEach(() => {
    // Stop all jobs after each test.
    cronService['jobs'].forEach((job) => {
      job.stop();
    });

    // Remove environment variables after each test.
    delete process.env.NOTIFYBC_NODE_ROLE;
    delete process.env.NODE_ENV;
  });

  describe('normal operation', () => {
    it('should start all cron jobs and call the correct methods', async () => {
      await cronService.onApplicationBootstrap();
      expect(cronService['jobs']).toHaveLength(6);

      // Simulate cron job execution.
      cronService['jobs'].forEach((job) => {
        job.start();
        const onTick = job._callbacks[0];
        onTick();
      });

      expect(cronTasksService.purgeData).toHaveBeenCalled();
      expect(cronTasksService.dispatchLiveNotifications).toHaveBeenCalled();
      expect(cronTasksService.checkRssConfigUpdates).toHaveBeenCalled();
      expect(cronTasksService.deleteBounces).toHaveBeenCalled();
      expect(
        cronTasksService.reDispatchBroadcastPushNotifications,
      ).toHaveBeenCalled();
      expect(cronTasksService.clearRedisDatastore).toHaveBeenCalled();
    });
  });

  describe('on secondary node', () => {
    beforeEach(() => {
      // Set environment variable for secondary node.
      process.env.NOTIFYBC_NODE_ROLE = 'slave';
    });

    it('should not start cron jobs if NOTIFYBC_NODE_ROLE is "slave"', async () => {
      await cronService.onApplicationBootstrap();
      expect(cronService['jobs']).toHaveLength(0);

      // Ensure no methods are called.
      expect(cronTasksService.purgeData).not.toHaveBeenCalled();
      expect(cronTasksService.dispatchLiveNotifications).not.toHaveBeenCalled();
      expect(cronTasksService.checkRssConfigUpdates).not.toHaveBeenCalled();
      expect(cronTasksService.deleteBounces).not.toHaveBeenCalled();
      expect(
        cronTasksService.reDispatchBroadcastPushNotifications,
      ).not.toHaveBeenCalled();
      expect(cronTasksService.clearRedisDatastore).not.toHaveBeenCalled();
    });
  });

  describe('on test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should not start cron jobs if NODE_ENV is "test"', async () => {
      await cronService.onApplicationBootstrap();
      expect(cronService['jobs']).toHaveLength(0);
      expect(cronTasksService.purgeData).not.toHaveBeenCalled();
      expect(cronTasksService.dispatchLiveNotifications).not.toHaveBeenCalled();
      expect(cronTasksService.checkRssConfigUpdates).not.toHaveBeenCalled();
      expect(cronTasksService.deleteBounces).not.toHaveBeenCalled();
      expect(
        cronTasksService.reDispatchBroadcastPushNotifications,
      ).not.toHaveBeenCalled();
      expect(cronTasksService.clearRedisDatastore).not.toHaveBeenCalled();
    });
  });

  describe('throttling configurations', () => {
    it('should not enter if both SMS and Email throttling are disabled', async () => {
      cronService['appConfig'].sms.throttle.enabled = false;
      cronService['appConfig'].email.throttle.enabled = false;

      await cronService.onApplicationBootstrap();
      const onTick = cronService['jobs'][0]._callbacks[0];
      onTick();

      expect(cronTasksService.clearRedisDatastore).not.toHaveBeenCalled();
    });

    it('should not enter if SMS throttling is enabled but conditions do not meet', async () => {
      cronService['appConfig'].sms.throttle.enabled = true;
      cronService['appConfig'].sms.throttle.clearDatastore = true;
      cronService['appConfig'].sms.throttle.datastore = 'local';

      await cronService.onApplicationBootstrap();
      const onTick = cronService['jobs'][0]._callbacks[0];
      onTick();

      expect(cronTasksService.clearRedisDatastore).not.toHaveBeenCalled();
    });

    it('should not enter if Email throttling is enabled but conditions do not meet', async () => {
      cronService['appConfig'].sms.throttle.enabled = false;
      cronService['appConfig'].email.throttle.enabled = true;
      cronService['appConfig'].email.throttle.clearDatastore = true;
      cronService['appConfig'].email.throttle.datastore = 'local';

      await cronService.onApplicationBootstrap();
      const onTick = cronService['jobs'][0]._callbacks[0];
      onTick();

      expect(cronTasksService.clearRedisDatastore).not.toHaveBeenCalled();
    });

    it('should enter if SMS throttling is enabled and datastore is not local', async () => {
      cronService['appConfig'].sms.throttle.enabled = true;
      cronService['appConfig'].sms.throttle.clearDatastore = false;
      cronService['appConfig'].sms.throttle.datastore = 'remote';

      await cronService.onApplicationBootstrap();
      const onTick = cronService['jobs'][0]._callbacks[0];
      onTick();

      expect(cronTasksService.clearRedisDatastore).toHaveBeenCalled();
    });

    it('should enter if Email throttling is enabled and datastore is not local', async () => {
      cronService['appConfig'].sms.throttle.enabled = false;
      cronService['appConfig'].email.throttle.enabled = true;
      cronService['appConfig'].email.throttle.clearDatastore = false;
      cronService['appConfig'].email.throttle.datastore = 'remote';

      await cronService.onApplicationBootstrap();
      const onTick = cronService['jobs'][0]._callbacks[0];
      onTick();

      expect(cronTasksService.clearRedisDatastore).toHaveBeenCalled();
    });

    it('should enter if both SMS and Email throttling are enabled and neither is local', async () => {
      cronService['appConfig'].sms.throttle.enabled = true;
      cronService['appConfig'].sms.throttle.clearDatastore = false;
      cronService['appConfig'].sms.throttle.datastore = 'remote';
      cronService['appConfig'].email.throttle.enabled = true;
      cronService['appConfig'].email.throttle.clearDatastore = false;
      cronService['appConfig'].email.throttle.datastore = 'remote';

      await cronService.onApplicationBootstrap();
      const onTick = cronService['jobs'][0]._callbacks[0];
      onTick();

      expect(cronTasksService.clearRedisDatastore).toHaveBeenCalled();
    });
  });
});
