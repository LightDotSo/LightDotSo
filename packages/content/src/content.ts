browser.runtime.sendMessage({ greeting: "hello" }).then(response => {
  // eslint-disable-next-line no-console
  console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // eslint-disable-next-line no-console
  console.log("Received request: ", request);
});
