(function () {
    'use strict';

    // Chặn và ghi đè window.fetch
    const originalFetch = window.fetch;
    window.fetch = function (resource, config) {
        const requestURL = resource instanceof Request ? resource.url : resource;

        // Chặn các yêu cầu liên quan đến trạng thái đã xem trên Facebook/Instagram
        if (config?.body && typeof config.body === 'string') {
            if (
                config.body.includes('PolarisStoriesV3SeenMutation') ||
                config.body.includes('storiesUpdateSeenStateMutation')
            ) {
                console.log('Đã chặn yêu cầu fetch tới:', requestURL);
                return new Promise(() => { }); // Ngăn fetch phản hồi
            }
        }

        return originalFetch.apply(this, arguments);
    };

    // Chặn và ghi đè XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method;
        this._url = url;
        originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
        if (typeof body === 'string') {
            if (
                this._url.includes('graphql') &&
                (body.includes('PolarisStoriesV3SeenMutation') || body.includes('storiesUpdateSeenStateMutation'))
            ) {
                console.log('Đã chặn XMLHttpRequest tới:', this._url);
                this.abort(); // Hủy yêu cầu
                return;
            }
        }

        originalSend.apply(this, arguments);
    };
})();
