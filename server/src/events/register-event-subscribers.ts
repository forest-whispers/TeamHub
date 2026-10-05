import { registerActivitySubscribers } from "../features/activity/events/subscriber.js";
import { registerDocDiscussionSubscriber } from "../features/documents/discussion/subscriber.js";
import { registerChatSubscriber } from "../features/chat/events/subscriber.js";
import { registerNotificationSubscribers } from "../features/notifications/events/subscriber.js";

export function registerEventSubscribers() {
    registerActivitySubscribers();
    registerDocDiscussionSubscriber();
    registerChatSubscriber();
    registerNotificationSubscribers();
}