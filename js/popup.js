document.addEventListener('DOMContentLoaded', () => {
  let displayedTweets = [];
  const tweetList = document.getElementById('tweet-list')
  let pollInterval;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    }, () => {

      pollInterval = setInterval(() => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getTweets' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error fetching tweets:", chrome.runtime.lastError.message);
          } else {
            appendNewTweets(response.tweets);
            document.getElementById('tweet-count').textContent = `Tweets collected: ${response.tweets?.length}`;
          }
        });
      }, 2000);

      document.getElementById('download-btn').addEventListener('click', () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'downloadCSV' });
      });
    });
  });

  function appendNewTweets(tweets) {
    tweets.forEach((tweet, index) => {
      if (!displayedTweets.some(t => t.tweetText === tweet.tweetText && t.dateTime === tweet.dateTime)) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="row-number"></td>
          <td>${tweet.username}</td>
          <td>${tweet.name}</td>
          <td>${tweet.tweetText}</td>
          <td>${tweet.dateTime}</td>
        `;
        tweetList.prepend(row);
        displayedTweets.push(tweet);
      }
    });
  }

  window.addEventListener('unload', () => {
    clearInterval(pollInterval);
  });
});
