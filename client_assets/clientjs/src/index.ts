document.addEventListener("DOMContentLoaded", (ev) => {
  navigator.sendBeacon(
    "https://mrdcga8zxd.execute-api.us-east-1.amazonaws.com/prod/event",
    JSON.stringify({
      site_id: "georgerodier.com",
      path: "/test",
    })
  );
});
