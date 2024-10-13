document.addEventListener('DOMContentLoaded', async () => {
  const scrapeBtn = document.getElementById('scrape-btn');
  const tweetCountDisplay = document.getElementById('tweet-count');

  // Get the tweet count from the current Twitter page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Active tab:", tabs[0]); // Add this log to verify tab ID
    if (!tabs.length || !tabs[0].id) {
      console.error("No active tab found");
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: countTweets,
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log("Script executed, results:", results);
          const tweetCount = results[0]?.result || 0;
          tweetCountDisplay.textContent = `Tweets on page: ${tweetCount}`;
        }
      }
    );
  });

  // When the scrape button is clicked
  scrapeBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: scrapeTweets,
        },
        (results) => {
          console.log('results: ', results);

          const tweetData = results[0].result;
          const csv = generateCSV(tweetData);
          downloadCSV(csv, 'tweets.csv');
        }
      );
    });
  });
});

// Function to count tweets
function countTweets() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const tweets = document.querySelectorAll('article');
      return tweets.length;
    });
  } else {
    const tweets = document.querySelectorAll('article');
    return tweets.length;
  }
}

// Function to scrape tweets
function scrapeTweets() {
  const tweets = document.querySelectorAll('article');
  const tweetData = [];

  tweets.forEach((tweet) => {
    const username = tweet.querySelector('a[role="link"].r-dnmrzs').href.replace('https://x.com/', '@');
    const name = tweet.querySelector('div[dir="ltr"] span').textContent;
    const tweetText = tweet.querySelector('div[lang]').textContent;
    const datetime = tweet.querySelector('time') ? tweet.querySelector('time').getAttribute('datetime') : null;

    tweetData.push({ username, name, tweetText, datetime });
  });

  console.log('tweetData ', tweetData);

  const csv = generateCSV(tweetData);
  downloadCSV(csv, 'tweets.csv');
  return tweetData;
}
