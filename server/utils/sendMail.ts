import ejs from "ejs";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";

interface IMailOptions {
  email: string;
  subject: string;
  template: string;
  data: object;
}

const sendMail = async (options: IMailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, template, data } = options;

  // Get the path to the email template
  const templatePath = path.join(__dirname, `../mails`, template);

  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
