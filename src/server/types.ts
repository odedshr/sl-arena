type Parameters = Record<string,any>;

type Endpoint = {
    url: string | RegExp;
    method: string;
    handle: (params:Parameters) => Promise<any>;
};

export { Endpoint, Parameters}