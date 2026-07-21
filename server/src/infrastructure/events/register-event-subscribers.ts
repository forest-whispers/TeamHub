import { registerActivitySubscribers } from "../../modules/activity/activity.subscriber.js";
import { registerDocDiscussionSubscriber } from "../../modules/documents/discussion/discussion.subscriber.js";

export function registerEventSubscribers() {
    registerActivitySubscribers();
    registerDocDiscussionSubscriber();
}