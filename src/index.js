const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessions = {};

app.post("/ussd", (req, res) => {
  const { USERID, MSISDN, USERDATA, MSGTYPE, SESSIONID } = req.body;

  const input = (USERDATA || "").trim();
  const isFirst = MSGTYPE == 1;

  if (isFirst) {
    sessions[SESSIONID] = { step: "main_menu" };
  }

  const session = sessions[SESSIONID] || { step: "main_menu" };
  let msg = "";
  let keepOpen = true;

  switch (session.step) {
    case "main_menu":
      msg =
        "Welcome to HandPay\n" +
        "1. Send money\n" +
        "2. Check balance\n" +
        "3. Update Info\n" +
        "0. Exit";
      session.step = "main_choice";
      break;
    case "main_choice":
      if (input == "1") {
        msg = "Receivers number:";
        session.step = "main_choice_recv_no";
      } else if (input == "2") {
        msg = "Your balance is GHS 45.00";
        keepOpen = false;
      } else if (input == "3") {
        msg = "1. username\n" + "2. age\n";
        session.step = "main_choice_update";
      } else if (input == "0") {
        msg= "Goodbye"
        keepOpen = false;
      }
      break;
    case "main_choice_update":
      if (input == "1") {
        msg = "Enter new username:";
        session.step = "main_choice_update_username";
      } else if (input == "2") {
        msg = "Enter new age:";
        session.step = "main_choice_update_age";
      }
      break;
    case "main_choice_update_username":
      msg = `username changed to ${input}`;
      keepOpen = false;
      break;

    case "main_choice_update_age":
      msg = `age changed to ${input}`;
      keepOpen = false;
      break;
    case "main_choice_recv_no":
      session.receiverNumber = input; 
      msg = `Enter amount `;
      session.step = "main_choice_amount";
      break;
    case "main_choice_amount":
      msg = `GHS${input}.00 sent to ${session.receiverNumber} `;
      keepOpen = false;
      break;
    default:
      msg = "Something went wrong. Please dial again. Thank you";
      keepOpen = false;
  }

  if (!keepOpen) {
    delete sessions[SESSIONID];
  }

  res.json({
    USERID,
    MSGTYPE: keepOpen,
    MSG: msg,
    MSISDN,
    USERDATA,
  });
});
app.get("/healthcheck",(req,res)=>res.send("I am running!!!!"))

app.listen(3000, ()=>console.log("USSD app running on port 3000"))