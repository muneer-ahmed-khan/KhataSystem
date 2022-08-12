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
  ROZNAMCHA: {
    QUERIES: {
      TODAY: "today",
      YESTERDAY: "yesterday",
      WEEK: "week",
      MONTH: "month",
      TOTAL: "total",
    },
    FILE_SETTINGS: {
      FILE_PATH: "./pdf/roznamcha_",
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
    VIEW_BOOK: template`Press 1️⃣  for View *Today* ${0} Book
Press 2️⃣  for View *Yesterday* ${0} Book
Press 3️⃣  for View *Last Week* ${0} Book
Press 4️⃣  for View *Last Month* ${0} Book
Press 5️⃣  for Search By Date* ${0} Book

Press #️⃣  for *Back*
Press 0️⃣ for *Main Menu*`,
  },
};
