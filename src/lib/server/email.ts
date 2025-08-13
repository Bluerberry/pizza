
import log from '$lib/server/log';
import nodemailer from 'nodemailer';
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
			from: GMAIL_USER,
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
</head>
<body style="margin:0; padding:20px; font-family: Arial, sans-serif; background-color:#ffffff; color:#0C101D;">
	<table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
		<tr><td align="center">
	  		<table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#fafaff" style="border-radius:8px; padding:30px;">
				<tr><td align="center" style="font-size:24px; font-weight:bold; padding-bottom:20px;">
					Welcome friend ❤️
		  		</td></tr>
				<tr><td style="font-size:16px; line-height:24px; padding-bottom:20px;">
					Hi ${username}, <br />
					Thanks for signing up! To complete your registration, please verify your
					email address by clicking the button below.
		  		</td></tr>
				<tr><td align="center" style="padding-bottom:20px;">
					<a 
						href="${verificationUrl}" 
						style="display:inline-block; padding:12px 24px; background-color:#0C101D; color:#FAFAFF; text-decoration:none; font-weight:bold; border-radius:6px;"
					>
						Verify Email
					</a>
				</td></tr>
				<tr><td style="font-size:14px; line-height:20px; padding-bottom:20px;">
					Or manually visit this link <br />
					<a href="${verificationUrl}" style="word-break:break-all;">${verificationUrl}</a>
				</td></tr>
				<tr><td align="center" style="font-size:12px; color:#7f8491; padding-top:20px;">
					This link will expire in 30 minutes for your security.
				</td></tr>
	  		</table>
		</td></tr>
	</table>
</body>
</html>
`;