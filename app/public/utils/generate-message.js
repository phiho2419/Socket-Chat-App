const dateFormat = require("date-format");

const generateMessage = (username, message) => {
  return {
    username,
    message,
    time: dateFormat("dd/mm/yyyy - hh:mm", new Date()),
  };
};

module.exports = {
  generateMessage,
};
