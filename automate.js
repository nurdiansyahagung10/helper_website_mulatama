const puppeteer = require("puppeteer");
require("dotenv").config();

(async () => {
  const domain = process.env.DOMAIN;
  const apiurl = process.env.API_URL;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(domain);
  await page.type('input[name="email"]', process.env.EMAIL_SUPER_ADMIN);
  await page.type('input[name="password"]', process.env.PASSWORD_SUPER_ADMIN);
  await page.click(".btn-primary");
  await delay(2000);
  await page.goto(domain + "/manage-loan/application");
  await page.waitForSelector('select[name="datatable_length"]');
  await page.select('select[name="datatable_length"]', "100");
  await delay(2000);

  const dataItemsPengajuan = await page.evaluate(() => {
    const datatable = document.getElementById("datatable");
    const tr = datatable.querySelectorAll("tr");
    const dataItemsPengajuan = [];

    tr.forEach((item) => {
      const status = item.querySelectorAll("td")[8];
      if (status && status.textContent != "Disetujui") {
        dataItemsPengajuan.push({
          cabang: item.querySelectorAll("td")[5].textContent,
          anggota: item.querySelectorAll("td")[1].textContent,
          pdl: item.querySelectorAll("td")[4].textContent,
          pinjaman: item.querySelectorAll("td")[3].textContent,
          status: item.querySelectorAll("td")[8].textContent,
        });
      }
    });
    return dataItemsPengajuan;
  });

  await delay(2000);

  const requestDataPengajuan = {
    type: "pengajuan",
    data: dataItemsPengajuan,
  };

  fetch(`${apiurl}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataPengajuan),
  });

  await delay(2000);
  await page.goto(
    domain + "/manage-cashflow/weekly/disbursement"
  );
  await page.waitForSelector('select[name="datatable_length"]');
  await page.select('select[name="datatable_length"]', "100");
  await delay(2000);

  const dataItemsDropping = await page.evaluate(() => {
    const datatable = document.getElementById("datatable");
    const tr = datatable.querySelectorAll("tr");
    const dataItemsDropping = [];

    tr.forEach((item) => {
      const status = item.querySelectorAll("td")[6];
      if (status && status.textContent != "Selesai") {
        dataItemsDropping.push({
          cabang: item.querySelectorAll("td")[7].textContent,
          anggota: item.querySelectorAll("td")[1].textContent,
          pdl: item.querySelectorAll("td")[4].textContent,
          pinjaman: item.querySelectorAll("td")[3].textContent,
          status: item.querySelectorAll("td")[6].textContent,
        });
      }
    });
    return dataItemsDropping;
  });

  await delay(2000);

  const requestDataDropping = {
    type: "dropping",
    data: dataItemsDropping,
  };

  fetch(`${apiurl}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataDropping),
  });

  await delay(2000);
  await page.goto(
    domain + "/manage-cashflow/weekly/depositOffice"
  );
  await page.waitForSelector('select[name="datatable_length"]');
  await page.select('select[name="datatable_length"]', "100");
  await delay(2000);

  const dataItemsSetorTunai = await page.evaluate(() => {
    const datatable = document.getElementById("datatable");
    const tr = datatable.querySelectorAll("tr");
    const dataItemsSetorTunai = [];

    tr.forEach((item) => {
      const status = item.querySelectorAll("td")[3];
      if (status && status.textContent != "Rp 0") {
        dataItemsSetorTunai.push({
          cabang: item.querySelectorAll("td")[2].textContent,
          pdl: item.querySelectorAll("td")[1].textContent,
          saldo: item.querySelectorAll("td")[3].textContent,
        });
      }
    });
    return dataItemsSetorTunai;
  });

  await delay(2000);

  const requestDataSetorTunai = {
    type: "setor tunai",
    data: dataItemsSetorTunai,
  };

  fetch(`${apiurl}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestDataSetorTunai),
  });
  await delay(2000);
  await browser.close();
})();
