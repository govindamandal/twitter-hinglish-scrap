var collectedTweets = collectedTweets || []

function scrapeVisibleTweets() {
  const tweets = document.querySelectorAll('article');
  tweets.forEach((tweet) => {
    const dateTime = tweet.querySelector('a[dir] time') ? tweet.querySelector('a[dir] time').getAttribute('datetime') : null;
    let tweetText = tweet.querySelector('div[data-testid="tweetText"]')?.textContent;
    if (dateTime && tweetText) {
      const username = tweet.querySelector('a[role="link"].r-dnmrzs').href.replace('https://x.com/', '@');
      const name = tweet.querySelector('div[dir="ltr"] span').textContent;

      let video = '';

      if (tweet.querySelector('video')) {
        video = tweet.querySelector('a[dir] time').parentElement.href;
      }

      let images = [];

      if (tweet.querySelectorAll('img').length) {
        tweet.querySelectorAll('img').forEach((img) => {
          if (img.src.includes('https://pbs.twimg.com/media/')) {
            images.push(img.src);
          }
        })
      }

      const tweetData = { username, name, tweetText, dateTime, video, images: images.join('\n') };

      if (!collectedTweets.some((t) => t.tweetText === tweetData.tweetText)) {
        collectedTweets.push(tweetData);
      }
    }
  });

}

function handleScrollEvent() {
  window.addEventListener('scroll', () => {
    scrapeVisibleTweets();
  });
}

window.addEventListener('scroll', () => {
  scrapeVisibleTweets();
});

window.onload = function () {
  handleScrollEvent();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTweets') {
    sendResponse({ tweets: collectedTweets });
  }
  if (message.action === 'getTweetsCount') {
    chrome.runtime.sendMessage({
      action: 'updateCount',
      count: collectedTweets.length
    });
  }
  if (message.action === 'downloadCSV') {
    downloadCSV();
  }
});

function downloadCSV() {
  const csvContent =
    'Username,Name,Tweet,DateTime,Video Link,Image Link(s)\n' +
    collectedTweets
      .map((t) => `${t.username},${t.name},"${t.tweetText}",${t.dateTime},${t.video},${t.images}`)
      .join('\n');

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const fileName = `tweet-${year}-${month}-${day}-${hours}_${minutes}_${seconds}.csv`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}
