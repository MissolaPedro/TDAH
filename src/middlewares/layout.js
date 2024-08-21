const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

module.exports = app => {
	app.use(expressLayouts);
	app.set("views", path.join(__dirname, "..", "views"));
	app.engine("html", require("ejs").renderFile);
	app.set("view engine", "html");
	app.use(express.static(path.join(__dirname, "..", "..", "public")));
};
