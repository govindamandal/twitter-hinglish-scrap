document.addEventListener('DOMContentLoaded', async () => {
  const scrapeBtn = document.getElementById('scrape-btn');
  const tweetCountDisplay = document.getElementById('tweet-count');
  console.log('document loaded');
  
  // Get the tweet count from the current Twitter page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: countTweets,
      },
      (results) => {
        const tweetCount = results[0].result;
        tweetCountDisplay.textContent = `Tweets on page: ${tweetCount}`;
      }
    );
  });

  // When the scrape button is clicked
  scrapeBtn.addEventListener('click', () => {
    console.log('scrap clicked');
    
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
  const tweets = document.querySelectorAll('article');
  return tweets.length;
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
  
  return tweetData;
}

// Function to generate CSV
function generateCSV(data) {
  const csvRows = [];
  const headers = ['Username', 'Name', 'Tweet Text', 'Datetime'];
  csvRows.push(headers.join(','));

  data.forEach((row) => {
    const values = [row.username, row.name, row.tweetText, row.datetime];
    csvRows.push(values.map((val) => `"${val.replace(/"/g, '""')}"`).join(','));
  });

  return csvRows.join('\n');
}

// Function to download CSV
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}