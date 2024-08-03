const { registrarUsuario } = require("../firebase/functions/register");
const { signInUser } = require("../firebase/functions/login");
const { signOutUser } = require("../firebase/functions/signout");
const {
	sendPasswordResetEmailFirebase,
} = require("../firebase/functions/resetpassword");
const dns = require("dns").promises;

function routeEJS(app) {
	app.post("/login", async (req, res) => {
		const { loginemail, loginpassword, loginrememberMe } = req.body;

		if (!loginemail) {
			return res.render("partials/form-login", {
				title: "Login",
				errorMessage: "O email é obrigatório.",
				successMessage: null,
			});
		}
		if (!loginpassword) {
			return res.render("partials/form-login", {
				title: "Login",
				errorMessage: "A senha é obrigatória.",
				successMessage: null,
			});
		}

		const emailRegex =
			/^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
		if (!emailRegex.test(loginemail)) {
			return res.render("partials/form-login", {
				title: "Login",
				errorMessage: "Formato de email inválido.",
				successMessage: null,
			});
		}

		// Extrai o domínio do email
		const domain = loginemail.split("@")[1];
		try {
			await dns.resolveMx(domain); // Verifica se o domínio tem registros MX (Mail Exchange)
		} catch (error) {
			return res.render("partials/form-login", {
				title: "Login",
				errorMessage: "Domínio de email não existe.",
				successMessage: null,
			});
		}

		if (loginpassword.length < 6) {
			return res.render("partials/form-login", {
				title: "Login",
				errorMessage: "Senha deve ter pelo menos 6 caracteres.",
				successMessage: null,
			});
		}

		signInUser(
			loginemail,
			loginpassword,
			loginrememberMe === "true",
			req,
			(error, user) => {
				if (error) {
					return res.render("partials/form-login", {
						title: "Login",
						errorMessage:
							"Falha no login. Verifique seu email e senha e tente novamente.",
						successMessage: null,
					});
				}
				// Define o cookie com a persistência baseada em "rememberMe"
				const cookieOptions =
					loginrememberMe === "true"
						? { maxAge: 900000, httpOnly: true }
						: { httpOnly: true, maxAge: null };
				res.cookie("loggedIn", true, cookieOptions);
				res.redirect("/?loginSuccess=true");
			}
		);
	});

	app.post("/register", (req, res) => {
		const { registeremail, verificationemail, registerpassword, registerconfirmpassword } = req.body;
		if(!registeremail){
			return res.render("partials/form-register", {
				title: "Registre-se",
				errorMessage: "O email é obrigatório.",
			});
		}
			const emailRegex =
			/^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
		if (!emailRegex.test(registeremail)) {
			return res.render("partials/form-register", {
				title: "Registre-se",
				errorMessage: "Formato de email inválido.",
			});
		}

		const domain = registeremail.split("@")[1];
		try {
			dns.resolveMx(domain); // Verifica se o domínio tem registros MX (Mail Exchange)
		} catch (error) {
			return res.render("partials/form-register", {
				title: "Registre-se",
				errorMessage: "Domínio de email não existe.",
				successMessage: null,
			});
		}

		// Validação da senha
		if (!registerpassword) {
				return res.render("partials/form-register", {
					title: "Registre-se",
					errorMessage: "A senha é obrigatória.",
				});
		}
		if (registerpassword.length < 6) {
			return res.render("partials/form-register", {
				title: "Registre-se",
				errorMessage: "A senha deve ter pelo menos 6 caracteres.",
			});
		}
		// Validação da confirmação da senha
		if (!registerconfirmpassword) {
			return res.render("partials/form-register", {
				title: "Registre-se",
				errorMessage: "Confirme a senha.",
			});
		}
		if (registerconfirmpassword !== registerpassword ) {
			return res.render("partials/form-register", {
				title: "Registre-se",
				errorMessage: "As senhas não coincidem.",
			});
		}

		registrarUsuario(registeremail, registerpassword, (error, user) => {
			if (error) {
				return res.render("partials/form-register", {
					errorMessage: "Falha no registro. Tente novamente.",
				});
			}
			console.log("Usuário registrado com sucesso");
			res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
			res.redirect("/?registerSuccess=true");
		});
	});

	//Troca do get para post--
	app.post("/logout", (req, res) => {
		signOutUser(error => {
			if (error) {
				console.error("Erro ao deslogar:", error);
				res.redirect("/");
			} else {
				console.log("Usuário deslogado com sucesso");
				res.clearCookie("loggedIn");
				res.redirect("/home");
				//adicionar perguntar para o usuarío se quer se logar de novo
			}
		});
	});

	// Rota POST para redefinição de senha

	app.post("/resetpassword", async (req, res) => {
		const { email } = req.body;
		if (!email) {
			return res.render("partials/form-reset", {
				title: "Resetar a senha",
				errorMessage: "O email é obrigatório.",
				successMessage: null,
			});
		}
		const emailRegex =
			/^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
			return res.render("partials/form-reset", {
				title: "Resetar a senha",
				errorMessage: "Formato de email inválido.",
				successMessage: null,
			});
		}
		// Extrai o domínio do email
		const domain = email.split("@")[1];
		try {
			await dns.resolveMx(domain); // Verifica se o domínio tem registros MX (Mail Exchange)
		} catch (error) {
			return res.render("partials/form-reset", {
				title: "Resetar a senha",
				errorMessage: "Domínio de email não existe.",
				successMessage: null,
			});
		}
		sendPasswordResetEmailFirebase(email, (error, message) => {
			if (error) {
				res.render("partials/form-reset", {
					title: "Resetar a senha",
					errorMessage: error,
					successMessage: null,
				});
			} else {
				res.render("partials/form-reset", {
					title: "Resetar a senha",
					errorMessage: null,
					successMessage: message,
				});
			}
		});
	});
	app.post("/contact", async (req, res) => {
        const { name, email, message } = req.body;
        const showContact = false; // Altere para false se não quiser mostrar o botão de contato
		const showRegister = false; // Altere para false se não quiser mostrar o botão de registro
        
        if (!name) {
            return res.render("contact", {
                title: "Contato",
                errorMessage: null,
                welcomeMenssage: null,
                description: "Caso tenha a necessidade de entrar em contato utilize do formulario abaixo",
                showContact,
                showRegister,
                errorMessage: "O nome é obrigatório.",
                successMessage: null,
            });
        }
        if (!email) {
            return res.render("contact", {
                title: "Contato",
                errorMessage: null,
                welcomeMenssage: null,
                description: "Caso tenha a necessidade de entrar em contato utilize do formulario abaixo",
                showContact,
                showRegister,
                errorMessage: "O email é obrigatório.",
                successMessage: null,
            });
        }
        if (!message) {
            return res.render("contact", {
                title: "Contato",
                errorMessage: null,
                welcomeMenssage: null,
                description: "Caso tenha a necessidade de entrar em contato utilize do formulario abaixo",
                showContact,
                showRegister,
                errorMessage: "A mensagem é obrigatória.",
                successMessage: null,
            });
        }
    });
}

module.exports = routeEJS;
