const { template } = require("../helpers/helpers");

exports.CONSTANTS = {
  DIALOGFLOW: {
    WELCOME_INTENT: "Default Welcome Intent",
    FALLBACK_INTENT: "Default Fallback Intent",
    STOCK_BOOK: "stock_book",
    ADD_TO_STOCK_BOOK: "stock_book_add",
    SELL_FROM_STOCK_BOOK: "stock_book_sell",
    VIEW_STOCK_BOOK: "stock_book_view",
    CASH_BOOK: "cash_book",
    CREDIT_TO_CASH_BOOK: "cash_book_credit",
    DEBIT_FROM_CASH_BOOK: "cash_book_debit",
    VIEW_CASH_BOOK: "cash_book_view",
    CUSTOMERS_KHATA: "khata_customer",
    BANK_KHATA: "khata_bank",
    STOCK_KHATA: "khata_stock",
    SEARCH_BY_TODAY: "_view_today",
    SEARCH_BY_YESTERDAY: "_view_yesterday",
    SEARCH_BY_LAST_WEEK: "_view_week",
    SEARCH_BY_LAST_MONTH: "_view_month",
    SEARCH_BY_DATE: "_view_search",
  },
  WHATSAPP_FORMS_URLS: {
    ADD_TO_STOCK_BOOK: "/add-stock-book/?addStock=true&whatsapp=true",
    SELL_FROM_STOCK_BOOK: "/add-stock-book/?sellStock=true&whatsapp=true",
    SEARCH_STOCK_BOOK: "/search-stock-book/?whatsapp=true&user=",
  },
  WHATSAPP_GROUP_NAME: "Khata App Group",
  CURRENT_USER_ID: null,
  ROZNAMCHA: {
    QUERIES: {
      TODAY: "today",
      YESTERDAY: "yesterday",
      WEEK: "week",
      MONTH: "month",
      TOTAL: "total",
    },
    FILE_SETTINGS: {
      STOCK_BOOK_FILE_PATH: "./pdf/stock_book_",
      FILE_DATE_FORMAT: "DD-MMM-YYYY",
      FILE_FORMAT: ".pdf",
    },
  },
  DATABASE_FIELDS: {
    ENTRY_TYPE: {
      ADD_STOCK: "addStock",
      SELL_STOCK: "sellStock",
      CREDIT_AMOUNT: "creditAmount",
      DEBIT_AMOUNT: "debitAmount",
      WHATSAPP_FORM: "whatsapp",
    },
    CUSTOMER_TYPE: {
      NON_CASH: "nonCash",
      CASH: "cash",
    },
    PAYMENT_TYPE: {
      CHECK: "check",
      TRANSFER: "transfer",
      CASH: "cash",
    },
    AMOUNT_TYPE: {
      CREDIT: "credit",
      DEBIT: "debit",
      BOTH: "both",
    },
  },
  MESSAGES_TEMPLATES: {
    MAIN: template`*Hi* @${0}!🙂 \n*${1}* \n
Here's what I can do for you! \n 
Press 1️⃣  for *Stock Book*
Press 2️⃣  for *Cash Book*
Press 3️⃣  for *Customers Khata*
Press 4️⃣  for *Stock Khata*
Press 5️⃣  for *Banks Khata*`,
    BACK_MENU: `Press #️⃣  for *Back*
Press 0️⃣  for *Main Menu*`,
    STOCK_BOOK: `Press 1️⃣  for *Add* to Stock Book
Press 2️⃣  for *Sell* from Stock Book
Press 3️⃣  for *View* Stock Book

Press #️⃣  for *Back*
Press 0️⃣  for *Main Menu*`,
    CASH_BOOK: `Press 1️⃣  for *Credit* to Cash Book
Press 2️⃣  for *Debit* from Cash Book
Press 3️⃣  for *View* Cash Book

Press #️⃣  for *Back*
Press 0️⃣  for *Main Menu*`,
    VIEW_BOOK: template`Press 1️⃣  for *Today* ${0} Book
Press 2️⃣  for *Yesterday* ${0} Book
Press 3️⃣  for *Last Week* ${0} Book
Press 4️⃣  for *Last Month* ${0} Book
Press 5️⃣  for *Search By Date* ${0} Book

Press #️⃣  for *Back*
Press 0️⃣ for *Main Menu*`,
    SEND_LINK: template`Link: ${0}

Press #️⃣  for *Back*
Press 0️⃣  for *Main Menu*`,
    ADD_STOCK_BOOK_RES: template` Added *New* Stock.

*New Stock Details*
Receive - *${0}* Tyres
Pattern - *${1}*
Size - *${2}*
Truck Number - *${3}*
Truck Rent - *${4}*

*${1} ${2}* Stock Update
*${5}* ⬆️ *${6}*`,
    SELL_STOCK_BOOK_CASH_RES: template` *Sell* Stock.

*Sell Stock Details*
Sell - *${0}* Tyres
Pattern - *${1}*
Size - *${2}*
Customer - *${3}*
Price - *${4}*
Total - *${5}*

*${1} ${2}* Stock Update
*${6}* ⬇️ *${7}*`,
    SELL_STOCK_BOOK_NON_CASH_RES: template` *Sell* Stock.

*Sell Stock Details*
Sell - *${0}* Tyres
Pattern - *${1}*
Size - *${2}*
Customer - *${3}*
Price - *${4}*
Total - *${5}*

*${1} ${2}* Stock Update
*${6}* ⬇️ *${7}*

*${3} Khata* Balance Update
*${8}* ⬇️ *${9}*
`,
  },
};
