const dns = require("dns").promises;

const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function isValidEmail(email) {
  return emailRegex.test(email);
}

async function isValidDomain(email) {
  const domain = email.split("@")[1];
  try {
    await dns.lookup(domain);
    return true;
  } catch {
    return false;
  }
}

function isValidPassword(password) {
  return password.length >= 6;
}

module.exports = {
  isValidEmail,
  isValidDomain,
  isValidPassword,
};