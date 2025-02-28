require("dotenv").config();

const { Client, LocalAuth } = require("whatsapp-web.js");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const express = require("express");
const app = express();
const client = new Client({ authStrategy: new LocalAuth() });
let group_name = null;
if (process.env.SEND_AS_TEST == "y") {
  group_name = JSON.parse(process.env.GROUP_TEST);
} else {
  group_name = JSON.parse(process.env.GROUP_NAME);
}

const group_id = [];
client.once("ready", async () => {
  const chat = await client.getChats();
  chat.forEach((chatitem) => {
    group_name.forEach((groupitem) => {
      if (chatitem.name == groupitem[1]) {
        group_id.push({ cabang: groupitem[0], id: chatitem.id.user });
      }
    });
  });
  console.log(group_id);
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
app.use(cors());
app.use(express.json());

app.post("/send-message", async (req, res) => {
  const { data, type } = req.body;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  let waktu = null;
  if (hours <= 10 && hours >= 0) {
    waktu = "pagi";
  } else if (hours <= 15 && hours > 10) {
    waktu = "siang";
  } else if (hours <= 24 && hours > 15) {
    waktu = "sore";
  }

  group_id.forEach((group_item) => {
    let full_message = "";
    let message = "";
    if (type != "morning") {
      console.log(data);
      data
        // .filter((item) => item.cabang == group_item.cabang)
        .forEach((item, index) => {
          switch (type) {
            case "setor tunai":
              if (item) {
                message += `${index + 1}. Pdl: ${
                  item.pdl
                }\n    Saldo Di Apps: ${item.saldo}\n\n`;
              }
              break;
            case "pengajuan":
              if (item) {
                message += `${index + 1}. Anggota: ${
                  item.anggota
                }\n    Pinjaman: ${item.pinjaman}\n    Pdl: ${
                  item.pdl
                }\n    Status: ${item.status}\n\n`;
              }
              break;
            case "dropping":
              if (item) {
                message += `${index + 1}. Anggota: ${
                  item.anggota
                }\n    Pinjaman: ${item.pinjaman}\n    Pdl: ${
                  item.pdl
                }\n    Status: ${item.status}\n\n`;
              }
              break;
            default:
              break;
          }
        });

      if (type == "pengajuan") {
        full_message = message
          ? `PEMBERITAHUAN PENGAJUAN\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan bahwa anggota yang belum menyelesaikan pengajuan pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang} adalah sebagai berikut:\n\n${message}\nDimohon untuk para PDL agar tidak lupa menyelesaikan pengajuan tersebut. Terima kasih dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`
          : `PEMBERITAHUAN PENGAJUAN\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan bahwa semua anggota sudah menyelesaikan pengajuan pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang}.\n\nTerima kasih atas kerja kerasnya, dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`;
      } else if (type == "setor tunai") {
        full_message = message
          ? `PEMBERITAHUAN SETOR TUNAI\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan bahwa PDL yang belum melakukan setor tunai pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang} adalah sebagai berikut:\n\n${message}\nDimohon untuk para PDL agar tidak lupa melakukan setor tunai. Terima kasih dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`
          : `PEMBERITAHUAN SETOR TUNAI\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan bahwa semua PDL sudah melakukan setor tunai pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang}.\n\nTerima kasih atas kerja kerasnya, dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`;
      } else if (type == "dropping") {
        full_message = message
          ? `PEMBERITAHUAN DROPPING\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan bahwa anggota yang belum menyelesaikan dropping pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang} adalah sebagai berikut:\n\n${message}\nDimohon untuk para PDL agar tidak lupa menyelesaikan dropping tersebut. Terima kasih dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`
          : `PEMBERITAHUAN DROPPING\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan bahwa semua anggota sudah menyelesaikan dropping pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang}.\n\nTerima kasih atas kerja kerasnya, dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`;
      }
    } else {
      full_message = `PEMBERITAHUAN KEPADA KASIR\nSelamat ${waktu}, maaf mengganggu waktunya. Kami hanya ingin menginformasikan agar para kasir tidak lupa untuk memasukkan data uang makan dan transport kepada PDL pada ${day}-${month}-${year} ${hours}:${minutes} untuk cabang ${group_item.cabang}.\n\nTerima kasih atas kerja kerasnya, dan semangat!\n\nBot by,\n[AGUNG NURDIANSYAH]`;
    }

    client
      .sendMessage(group_item.id + "@g.us", full_message)
      .then((response) => {
        if (response.id.fromMe) {
          console.log("Message successfully sent to", group_item.cabang);
        }
      })
      .catch((err) => {
        console.error("Failed to send message:", err);
      });
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
