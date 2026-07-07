import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

export interface ActiveDocument {
    ydoc: Y.Doc;
    awareness: Awareness;
    users: Set<string>;
    awarenessClients: Map<string, number>;
}