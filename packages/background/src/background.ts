browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // eslint-disable-next-line no-console
  console.log("Received request: ", request);

  if (request.greeting === "hello") {
    sendResponse({ farewell: "goodbye" });
  }
});
