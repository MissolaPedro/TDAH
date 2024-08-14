const {
	registrarUsuario,
	signInUser,
	sendPasswordResetEmailFirebase,
	signOutUser,
} = require("../firebase/functions/login");

const {
	isNotEmpty,
	validarEmailCompleto,
	validateLoginPassword,
	validateRegisterPassword,
} = require("../modules/verifications");

function routeEJS(app) {
	app.post("/login", async (req, res) => {
		const { loginemail, loginpassword, loginrememberMe } = req.body;
		let errorMessageEmail = "";
		let errorMessagePassword = "";

		// Validação do email
		const emailValidationResult = await validarEmailCompleto(loginemail);
		if (emailValidationResult !== "O email é válido.") {
			errorMessageEmail = emailValidationResult;
		}

		// Validação da senha
		const passwordErrors = validateLoginPassword(loginpassword);
		if (passwordErrors.length > 0) {
			errorMessagePassword = passwordErrors.join(", ");
		}

		// Se houver erros, renderiza o formulário com as mensagens de erro
		if (errorMessageEmail || errorMessagePassword) {
			return res.render("partials/form-login", {
				title: "Login",
				errorMessageEmail,
				errorMessagePassword,
				csrfToken: req.csrfToken(),
			});
		}

		// Tentativa de login
		signInUser(
			loginemail,
			loginpassword,
			loginrememberMe === "true",
			req,
			(error, user) => {
				if (error) {
					console.error("Erro ao fazer login:", error);
					return res.status(400).json({ error: error.message });
				}
				res.cookie("loggedIn", true, {
					maxAge: 900000,
					httpOnly: true,
				});
				res.redirect("/dashboard");
			}
		);
	});

	app.post("/register", async (req, res) => {
		const {
			registername,
			registersurname,
			registeremail,
			registerpassword,
			registerconfirmpassword,
			termos,
		} = req.body;
		let errorMessageName = "";
		let errorMessageSurname = "";
		let errorMessageEmail = "";
		let errorMessagePassword = "";
		let errorMessageConfirmPassword = "";
		let errorMessageTermos = "";

		if (!isNotEmpty(registername)) {
			errorMessageName = "Nome é obrigatório";
		}

		if (!isNotEmpty(registersurname)) {
			errorMessageSurname = "Sobrenome é obrigatório";
		}

		const emailValidationResult = await validarEmailCompleto(registeremail);
		if (emailValidationResult !== "O email é válido.") {
			errorMessageEmail = emailValidationResult;
		}

		const passwordErrors = validateRegisterPassword(registerpassword);
		if (passwordErrors.length > 0) {
			errorMessagePassword = passwordErrors.join(", ");
		}

		if (registerconfirmpassword !== registerpassword) {
			errorMessageConfirmPassword =
				"Confirmação de senha não corresponde à senha";
		}

		if (!termos) {
			errorMessageTermos = "Você deve aceitar os termos de serviço.";
		}

		if (
			errorMessageName ||
			errorMessageSurname ||
			errorMessageEmail ||
			errorMessagePassword ||
			errorMessageConfirmPassword ||
			errorMessageTermos
		) {
			return res.render("form-register", {
				errorMessageName,
				errorMessageSurname,
				errorMessageEmail,
				errorMessagePassword,
				errorMessageConfirmPassword,
				errorMessageTermos,
				csrfToken: req.csrfToken(),
			});
		}

		registrarUsuario(registeremail, registerpassword, (error, user) => {
			if (error) {
				console.error("Erro ao registrar usuário:", error);
				return res.render("form-register", {
					errorMessageName,
					errorMessageSurname,
					errorMessageEmail,
					errorMessagePassword,
					errorMessageConfirmPassword,
					errorMessageTermos,
					csrfToken: req.csrfToken(),
				});
			}
			console.log("Usuário registrado com sucesso");
			res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
			res.redirect("/?registerSuccess=true");
		});
	});

	app.post("/logout", (req, res) => {
		signOutUser(error => {
			if (error) {
				console.error("Erro ao deslogar:", error);
				res.redirect("/");
			} else {
				console.log("Usuário deslogado com sucesso");
				res.clearCookie("loggedIn");
				res.redirect("/home");
			}
		});
	});

	app.post("/resetpassword", async (req, res) => {
		const { email } = req.body;
		let errorMessageEmail = "";

		const emailValidationResult = await validarEmailCompleto(email);
		if (emailValidationResult !== "O email é válido.") {
			errorMessageEmail = emailValidationResult;
			return res.render("form-reset", {
				title: "Resetar senha",
				errorMessageEmail,
				csrfToken: req.csrfToken(),
			});
		}

		sendPasswordResetEmailFirebase(email, (error, message) => {
			if (error) {
				errorMessageEmail = error.message;
				return res.render("form-reset", {
					title: "Resetar senha",
					errorMessageEmail,
					csrfToken: req.csrfToken(),
				});
			}
			res.status(200).json({
				message: "Email de redefinição de senha enviado com sucesso.",
			});
		});
	});

	app.post("/contact", async (req, res) => {
		const { name, email, message } = req.body;

		if (!isNotEmpty(name)) {
			return res.status(400).json({ error: "Nome é obrigatório" });
		}

		const emailValidationResult = await validarEmailCompleto(email);
		if (emailValidationResult !== "O email é válido.") {
			return res.status(400).json({ error: emailValidationResult });
		}

		if (!isNotEmpty(message)) {
			return res.status(400).json({ error: "Mensagem é obrigatória" });
		}

		res.status(200).json({ message: "Contato recebido com sucesso" });
	});
}

module.exports = routeEJS;
