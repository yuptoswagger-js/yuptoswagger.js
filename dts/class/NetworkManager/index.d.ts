declare class NetworkManager {
    is_network_available: boolean;
    is_playing_offline: boolean;
    url_internet_check: string;
    span_internet_connection_el: HTMLSpanElement;
    private request_timeout;
    update_span(mode: "online" | "offline"): void;
    check_internet_connection__onload: () => void;
    check_internet_connection__onerror: () => void;
    check_internet_connection(): void;
}
declare const _default: NetworkManager;
export default _default;
