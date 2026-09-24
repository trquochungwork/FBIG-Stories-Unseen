(function () {
  'use strict';

  const toggleButton = document.getElementById('toggle-feature');
  const footerButtons = document.querySelectorAll('.footer button');
  const header = document.getElementById('site-header');

  // Cập nhật giao diện nút bật/tắt & huy hiệu trạng thái tiếng Việt
  function updateButtonAppearance(isActive) {
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');

    if (isActive) {
      toggleButton?.classList.add('is-active');
      if (statusBadge) statusBadge.classList.add('active');
      if (statusText) statusText.textContent = 'ĐANG BẬT BẢO VỆ';
    } else {
      toggleButton?.classList.remove('is-active');
      if (statusBadge) statusBadge.classList.remove('active');
      if (statusText) statusText.textContent = 'ĐÃ TẮT BẢO VỆ';
    }
  }

  // Xử lý sự kiện nhấn nút bật/tắt
  if (toggleButton) {
    toggleButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      chrome.storage.sync.get('toggleState', (result) => {
        const currentState = result?.toggleState !== undefined ? result.toggleState : true;
        const newState = !currentState;
        chrome.storage.sync.set({ toggleState: newState }, () => {
          if (chrome.runtime.lastError) {
            console.error('Lỗi khi lưu trạng thái:', chrome.runtime.lastError);
          }
          updateButtonAppearance(newState);
        });
      });
    });
  }

  // Mở liên kết ngoài trong tab mới
  footerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const iconClass = button.querySelector('i')?.className || '';
      let url = null;

      if (iconClass.includes('fa-github')) {
        url = 'https://github.com/trquochungwork';
      } else if (iconClass.includes('fa-code')) {
        url = 'https://github.com/trquochungwork/FBIG-Stories-Unseen';
      } else if (iconClass.includes('fa-facebook')) {
        url = 'https://www.facebook.com/quochung.trinh.758737';
      }

      if (url) chrome.tabs.create({ url });
    });
  });

  // Tải trạng thái bật/tắt (mặc định là bật nếu chưa thiết lập)
  chrome.storage.sync.get('toggleState', (data) => {
    const isActive = data?.toggleState !== undefined ? data.toggleState : true;
    updateButtonAppearance(isActive);
  });

  // Hiển thị tên miền của tab hiện tại một cách an toàn
  if (chrome.tabs?.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        return;
      }
      const url = tabs && tabs[0]?.url ? tabs[0].url : '';
      let hostname = 'không xác định';

      if (url) {
        try {
          hostname = new URL(url).hostname;
        } catch (e) {
          hostname = 'không xác định';
        }
      }

      if (header) {
        header.textContent = hostname;

        // Đánh dấu đỏ nếu không phải Facebook hoặc Instagram
        if (hostname !== 'không xác định' && !hostname.includes('facebook.com') && !hostname.includes('instagram.com')) {
          header.classList.add('error');
        }
      }
    });
  }

  const updateButton = document.getElementById('update-button');
  if (updateButton && chrome.runtime?.getManifest) {
    const currentVersion = chrome.runtime.getManifest().version;
    const versionURL =
      'https://raw.githubusercontent.com/trquochungwork/FBIG-Stories-Unseen/main/data/version.json';

    fetch(versionURL)
      .then((response) => {
        if (!response.ok) throw new Error('Mạng không phản hồi');
        return response.json();
      })
      .then((data) => {
        const latestVersion = data.version;
        const changelogURL = data.changelog;

        if (currentVersion !== latestVersion) {
          updateButton.title = `Đã có bản cập nhật ${latestVersion}! Bấm để xem chi tiết.`;
          updateButton.style.color = 'var(--coral-accent)';
          updateButton.style.animation = 'pulse 1.2s infinite';

          updateButton.addEventListener('click', () => {
            chrome.tabs.create({ url: changelogURL });
          });
        } else {
          updateButton.title = `Phiên bản mới nhất (v${currentVersion})`;
        }
      })
      .catch((error) => {
        updateButton.title = `Phiên bản mới nhất (v${currentVersion})`;
      });
  }
})();
