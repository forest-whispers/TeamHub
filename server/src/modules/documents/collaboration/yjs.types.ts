import * as Y from "yjs";

export interface ActiveDocument {
    ydoc: Y.Doc;
    users: Set<string>;
}