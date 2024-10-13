var collectedTweets = collectedTweets || []

function scrapeVisibleTweets() {
    const tweets = document.querySelectorAll('article');
    tweets.forEach((tweet) => {
        const dateTime = tweet.querySelector('a[dir] time') ? tweet.querySelector('a[dir] time').getAttribute('datetime') : null;
        let tweetText = tweet.querySelector('div[data-testid="tweetText"] span')?.innerHTML;
        if (dateTime && tweetText) {
            const username = tweet.querySelector('a[role="link"].r-dnmrzs').href.replace('https://x.com/', '@');
            const name = tweet.querySelector('div[dir="ltr"] span').textContent;
            const tweetData = { username, name, tweetText, dateTime };
            
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
    console.log("Page scrolled");
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
        'data:text/csv;charset=utf-8,' +
        'Username,Name,Tweet,DateTime\n' +
        collectedTweets
            .map((t) => `${t.username},${t.name},"${t.tweetText}",${t.dateTime}`)
            .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'tweets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
