
import nodemailer from 'nodemailer';
import log from '$lib/server/logging';
import { GMAIL_USER, GMAIL_APP_PASSWORD } from '$env/static/private';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: GMAIL_USER,
		pass: GMAIL_APP_PASSWORD
	}
});

export async function sendEmail(to: string, subject: string, html: string) {
	try {
		await transporter.sendMail({
			from: `"Bram Kreulen" <${GMAIL_USER}>`, // Use your app name and email
			to, subject, html
		});

		log.info({ to, subject }, 'Email sent successfully');
	} catch (error) {
		log.error({ error, to, subject }, 'Failed to send email');
		throw new Error('Failed to send email');
	}
}

export const verificationTemplate = (username: string, verificationUrl: string) => `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<title>Verify Your Email</title>
		<style>
			body {
				font-family: sans-serif;
				background-color: #ffffff;
				color: #0C101D;
				padding: 20px;
				margin: 0;
			}
			p {
				margin: 0;
				width: 100%;
			}
			.container {
				display: flex;
				flex-direction: column;
				align-items: center;
				background-color: #fafaff;
				max-width: 600px;
				margin: 0 auto;
				padding: 30px;
				border-radius: 8px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
			}
			.button {
				display: inline-block;
				margin: 20px 0;
				padding: 12px 24px;
				color: #FAFAFF;
				text-decoration: none;
				background-color: #0C101D;
				border-radius: 6px;
				font-weight: bold;
			}
			.footer {
				margin-top: 30px;
				font-size: 12px;
				color: rgba(12, 16, 29, 0.5);
				text-align: center;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<h2> Welcome friend ❤️ </h2>
			<p>
				Hi ${username}, <br />
				Thanks for signing up! To complete your registration, please verify your
				email address by clicking the button below.
			</p>
			<a href="${verificationUrl}" class="button">Verify Email</a>
			<p>
				Or manually visit this link <br />
				<a href="${verificationUrl}">${verificationUrl}</a>
			</p>
			<p class="footer">This link will expire in 30 minutes for your security.</p>
		</div>
	</body>
</html>
`;