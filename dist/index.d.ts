export declare class ReverseFileReader {
    private filename;
    constructor(filename: string);
    getLatestEntires(offset?: number, limit?: number): AsyncGenerator<string[], void, unknown>;
}
