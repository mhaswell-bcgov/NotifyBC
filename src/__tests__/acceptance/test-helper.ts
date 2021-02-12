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

import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import sinon from 'sinon';
import {NotifyBcApplication} from '../..';
import {BaseController} from '../../controllers/base.controller';

process.env['NODE_ENV'] = 'test';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new NotifyBcApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  beforeEach(async () => {
    await app.migrateSchema({existingSchema: 'drop'});
  });
  after(async () => {
    await app.stop();
  });
  return {app, client};
}

export interface AppWithClient {
  app: NotifyBcApplication;
  client: Client;
}

beforeEach(function () {
  async function fakeSendEmail(_mailOptions: any, cb?: Function) {
    console.log('faking sendEmail');
    cb?.(null, null);
  }

  async function fakeSendSMS(
    _to: string,
    _textBody: string,
    _data: any,
    cb?: Function,
  ) {
    console.log('faking sendSMS');
    cb?.(null, null);
  }

  sinon.stub(BaseController.prototype, 'sendEmail').callsFake(fakeSendEmail);
  sinon.stub(BaseController.prototype, 'sendSMS').callsFake(fakeSendSMS);
});

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});
