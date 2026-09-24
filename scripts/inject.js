const extension = typeof chrome !== 'undefined' ? chrome : browser;

(function () {
  extension.storage.sync.get('toggleState', function (data) {
    const isEnabled = data.toggleState !== undefined ? data.toggleState : true;

    if (isEnabled) {
      const script = document.createElement('script');
      script.src = extension.runtime.getURL('scripts/unseen.js');
      script.onload = function () {
        this.remove();
        console.log('Ẩn trạng thái xem ĐÃ BẬT');
      };
      (document.head || document.documentElement).appendChild(script);
    } else {
      console.log('Ẩn trạng thái xem ĐÃ TẮT');
    }
  });
})();
