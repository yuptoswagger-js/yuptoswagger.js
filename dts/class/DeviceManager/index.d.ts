declare class DeviceManager {
    serialNumber: string;
    platform_version: any;
    appVersion: string;
    app_build: string;
    timezone_string: string;
    time_zone: string;
    device_name: any;
    width: any;
    height: any;
    private request_timeout;
    private base_url;
    constructor({ base_url }: any);
    onreadystatechange(this: XMLHttpRequest): false | undefined;
    init_screen(): void;
}
export default DeviceManager;
