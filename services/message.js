/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

module.exports = class Message {
  constructor(rawMessage) {
    this.id = rawMessage.id;

    let type = rawMessage.type;
    if (type === 'interactive') {
      const interactive = rawMessage.interactive;
      if (interactive.type === 'button_reply') {
        this.type = interactive.button_reply.id;
        this.title = interactive.button_reply.title;
      } else if (interactive.type === 'list_reply') {
        this.type = interactive.list_reply.id;
        this.title = interactive.list_reply.title;
        this.description = interactive.list_reply.description;
      }
    } else if (type === 'text') {
      this.type = 'text';
      this.text = rawMessage.text.body;
    } else if (type === 'image') {
      this.type = 'image';
      this.imageId = rawMessage.image.id;
      this.imageCaption = rawMessage.image.caption;
    } else {
      this.type = 'unknown'
    }

    this.senderPhoneNumber = rawMessage.from;
    this.userName = rawMessage.from; // Default to phone number, but we can't easily get name from webhook message body directly without a separate call or if it's in contacts
    
    // Attempt to extract display name if present (it's often in contacts, but the structure varies)
    // The webhook payload structure passed to handleMessage is usually entry[0].changes[0].value.messages[0]
    // The contacts info is in entry[0].changes[0].value.contacts
    // But here we are constructing from rawMessage. 
    // We'll rely on ensuring contact via API.
  }
};
