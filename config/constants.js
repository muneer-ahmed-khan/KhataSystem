exports.CONSTANTS = {
  WELCOME_INTENT: "Default Welcome Intent",
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
      AMOUNT: "amount",
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
  },
};
