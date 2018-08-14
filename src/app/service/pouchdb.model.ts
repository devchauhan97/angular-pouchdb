export class IUserCredentials {
    local: {
        identifier: string;
    };
    remote: {
        url: string;
        key: string;
        password: string;
    };
}

export class ISyncResult {
    pull: {
        docs: any[],
        errors: any[]
    };
    push: {
        docs: any[],
        errors: any[]
    };
};