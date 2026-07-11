import { eventBus } from "./event-bus.js";

export function registerEventSubscribers() {
    eventBus.on("document.created", async (event) => {
        console.log("[EVENT] document.created", event);
    });

    eventBus.on("document.renamed", async (event) => {
        console.log("[EVENT] document.renamed", event);
    });

    eventBus.on("document.deleted", async (event) => {
        console.log("[EVENT] document.deleted", event);
    });
}