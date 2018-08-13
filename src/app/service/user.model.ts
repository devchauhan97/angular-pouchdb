
export class  IFriend {
    id: string;
    name: string;
}

export class IPouchDBAllDocsResult {
    offset: number;
    total_rows: number;
    rows: IPouchDBRow[];
}

export class IPouchDBGetResult {
    _id: string;
    _rev: string;
}

export class IPouchDBPutResult {
    ok: boolean;
    id: string;
    rev: string;
}

export class IPouchDBRemoveResult {
    ok: boolean;
    id: string;
    rev: string;
}

export class IPouchDBRow {
    id: string;
    key: string;
    value: { rev: string };

    // Only included if include_docs is set to true during query.
    doc?: any;
}

export class IEditForm {
    id: string;
    name: string;
};

export class IAddForm {
    name: string;
}
export class IPouchDBGetFriendResult extends IPouchDBGetResult {
    name: string;
}