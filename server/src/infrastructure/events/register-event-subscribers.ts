import { registerActivitySubscribers } from "../../modules/activity/activity.subscriber.js";
import { registerDocDiscussionSubscriber } from "../../modules/documents/discussion/discussion.subscriber.js";
import { registerChatSubscriber } from "../../modules/chat/chat.subscriber.js";
import { registerNotificationSubscribers } from "../../modules/notifications/notification.subscriber.js";

export function registerEventSubscribers() {
    registerActivitySubscribers();
    registerDocDiscussionSubscriber();
    registerChatSubscriber();
    registerNotificationSubscribers();
}