(async () => {
  const apiurl =
    "https://9571-2001-448a-3050-5cd0-78fe-b2ae-42d4-cede.ngrok-free.app";

  const requestDataPengajuan = {
    type: "morning",
  };


  await fetch(`${apiurl}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataPengajuan),
  });
}
)();