import { createTransport } from 'nodemailer';

const MAIL_SETTINGS = {
    service: 'gmail',
    auth: {
        user: "mukeshkumar87086@gmail.com",
        pass: "wgqqxqfashperolx",
    },
}

const transporter = createTransport(MAIL_SETTINGS);

export async function sendMail(params) {
    try {
        let info = await transporter.sendMail({
            from: MAIL_SETTINGS.auth.user,
            to: params.to,
            subject: 'Hello ✔',
            html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Hospital Management System</h2>
          <h4>OTP for Reset Password ✔</h4>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
     </div>
      `,
        });
        return info;
    } catch (error) {
        console.log(error);
        return false;
    }
}
