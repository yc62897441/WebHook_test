if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const exphbs = require('express-handlebars')
const app = express()
const port = process.env.PORT || 3001

// cors 的預設為全開放
app.use(cors())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

const axios = require('axios')

app.get('/', (req, res) => {
  return res.render('index')
})
app.post('/', async (req, res) => {
  let LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_TOKEN
  let LINE_USER_ID = process.env.LINE_USER_ID

  const instance = axios.create({
    baseURL: 'https://api.line.me/v2/bot/message/push',
    timeout: 1000,
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_TOKEN}`,
      "Content-Type": "application/json",
    },
  })

  let messages
  let stage
  let keys
  if (req.Content) {
    if (req.Content.ReadAsStringAsync()) {
      if (req.Content.ReadAsStringAsync().Result) {
        messages = req.Content.ReadAsStringAsync().Result ? req.Content.ReadAsStringAsync().Result : 'sss'
        stage = 'req.Content.ReadAsStringAsync().Result'
        for (item in req) {
          keys = keys + item + '\n'
        }
      } else {
        messages = req.Content.ReadAsStringAsync() ? req.Content.ReadAsStringAsync() : 'sss'
        stage = 'req.Content.ReadAsStringAsync()'
        for (item in req) {
          keys = keys + item + '\n'
        }
      }
    } else {
      messages = req.Content ? req.Content : 'sss'
      stage = 'req.Content'
      for (item in req) {
        keys = keys + item + '\n'
      }
    }
  } else {
    messages = req ? req : 'sss'
    stage = 'req'
    for (item in req) {
      keys = keys + item + '\n'
    }
  }

  try {
    const LineResponse = await instance.post('/', {
      to: LINE_USER_ID,
      messages: [{
        "type": "text",
        "text": `${messages}`
      },
      {
        "type": "text",
        "text": `stage: ${stage}`
      },
      {
        "type": "text",
        "text": `keys: ${keys}`
      }]
    })
  } catch (error) {
    console.warn(error)
    return res.json({ status: 'error', error: error })
  }


  // try {
  //   //取得 http Post RawData(should be JSON)
  //   // let postData = Request.Content.ReadAsStringAsync().Result;
  //   let postData = res.Content.ReadAsStringAsync().Result;
  //   console.log(postData)
  //   // //剖析JSON
  //   // var ReceivedMessage = isRock.LineBot.Utility.Parsing(postData);
  //   // //回覆訊息
  //   // let Message;
  //   // Message = "你說了:" + ReceivedMessage.events[0].message.text;
  //   // //回覆用戶
  //   // isRock.LineBot.Utility.ReplyMessage(ReceivedMessage.events[0].replyToken, Message, LINE_CHANNEL_TOKEN);

  //   return res.json({ status: 'success' })
  // } catch (error) {
  //   return
  // }

  return res.json({ status: 'success' })
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`)
})
