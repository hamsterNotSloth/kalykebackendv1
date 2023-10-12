import { getErrorMessage, } from "../../errors/errorMessages.js";
import User from "../model/userModal.js";
import userService from "../services/userService.js"
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const createUserController = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);

    res.status(result.code).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: getErrorMessage(500, error), status: false });
  }
}

export const loginController = async (req, res) => {
  try {
    const token = await userService.loginUser(
      req.body
    );
    if (token.status === true) {
      res.set("Authorization", `${token}`).status(200).json({
        message: "User successfully Logged In.",
        token,
      });
    } else {
      res.status(token.code).json(token)
    }
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(500, error),
      status: false,
    });
  }
};

export const resetPasswordRequestController = async (req, res) => {
  const { email } = req.body;

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenExpiration = Date.now() + 1600000;
  const newDate = new Date(resetTokenExpiration);
  try {
    const user = await User.findOne({ email });

    if (user.email === "Email") {
      user.resetToken = resetToken;
      user.resetTokenExpiration = resetTokenExpiration;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'Yahoo',
        auth: {
          user: 'abdul.806@yahoo.com',
          pass: 'flqfptptnklbahym',
        },
      });

      const mailOptions = {
        from: 'abdul.806@yahoo.com',
        to: email,
        subject: 'Password Reset Request',
        html: `
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <tr>
            <td align="center">
                <h3 style="color: #333;">Link Expires at:  ${newDate}</h3>
            </td>
         </tr>    
           <tr>
                <td align="center">
                    <h1 style="color: #333;">Password Reset</h1>
                </td>
            </tr>
            <tr>
                <td align="center" style="font-size: 16px; color: #333; padding-top: 10px;">
                    You have requested a password reset. Click the button below to reset your password.
                </td>
            </tr>
            <tr>
                <td align="center" style="padding-top: 20px;">
                    <a href="http://localhost:3000/reset-password/${resetToken}" style="text-decoration: none; background-color: #0073e6; color: #ffffff; padding: 10px 20px; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
                </td>
            </tr>
            <tr>
                <td align="center" style="font-size: 14px; color: #666; padding-top: 20px;">
                    If you did not request a password reset, please ignore this email.
                </td>
            </tr>
        </table>
    </body>
      `,
      };
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({ message: 'Password reset email sent. Please check your inbox or spam.', status: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.', status: false });
  }
}

export const resetPasswordController = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const response = await userService.resetPassword({ token, password })

    if (response.status == false) {
      return res.status(response.code).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
}

export const updateUserInfoController = async (req, res) => {
  try {
    const _id = req.user._id;
    const newUserData = {
      userName: req.body.userName,
      description: req.body.description,
    };

    const updatedUser = await userService.updateUser(_id, newUserData);

    if (updatedUser) {
      res.status(200).json({
        message: "User info Updated",
        status: true,
      });
    } else {
      res.status(404).json({ message: "User not found", status: false });
    }
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(500, error),
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    let userProfile;
    if (req.user.uid !== null) {
      const uid = req.user.uid;
      userProfile = await userService.userProfile(uid, "Firebase Login");
    }
    else {
      const _id = req.user._id;
      userProfile = await userService.userProfile(_id, "Email Login")
    }
    res.status(200).json({ message: "Userinfo Found", userProfile })
  } catch (error) {
    res.status(error.code).json({
      message: error.message, status: false
    });
  }
};

