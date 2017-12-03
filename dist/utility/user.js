"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatName = formatName;
function formatName(user) {
  return `${user.username}#${user.discriminator}`;
}