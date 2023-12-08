import { getErrorMessage, getSuccessMessage, } from "../../errors/errorMessages.js";
import User from "../model/product.js";
import userService from "../services/userService.js"
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from "dotenv";
dotenv.config();

const email_user = process.env.EMAIL;
const email_pass = process.env.EMAIL_PASS;

export const signIn = async (req, res) => {
  if (req && !req.body) {
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  }
  try {
    const userData = await userService.signIn(
      req.body
    );
    if (userData) {
      if (userData.status === true) {
        return res.status(200).json({
          userData
        });
      }
      return res.status(userData.code).json({ message: getErrorMessage(userData.code), status: false, code: userData.code })
    }
    return res.status(400).json({ message: getErrorMessage(400), status: false, code: 400 })
  } catch (error) {
    
    console.log(error, 'ourside')
    res.status(500).json({
      message: getErrorMessage(500),
      status: false,
    });
  }
};

export const verifyUser = async (req, res) => {
  const token = req.params.token;

  try {
    // const response = await userService.verifyUser()
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

// export const resetPasswordRequestController = async (req, res) => {
//   const { email } = req.body;

//   const resetToken = crypto.randomBytes(20).toString('hex');
//   const resetTokenExpiration = Date.now() + 1600000;
//   const newDate = new Date(resetTokenExpiration);
//   try {
//     const user = await User.findOne({ email });

//     if (user.email === "Email") {
//       user.resetToken = resetToken;
//       user.resetTokenExpiration = resetTokenExpiration;
//       await user.save();

//       const transporter = nodemailer.createTransport({
//         service: 'Yahoo',
//         auth: {
//           user: email_user,
//           pass: email_pass,
//         },
//       });

//       const mailOptions = {
//         from: email_user,
//         to: email,
//         subject: 'Password Reset Request',
//         html: `
//         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
//         <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
//         <tr>
//             <td align="center">
//                 <h3 style="color: #333;">Link Expires at:  ${newDate}</h3>
//             </td>
//          </tr>    
//            <tr>
//                 <td align="center">
//                     <h1 style="color: #333;">Password Reset</h1>
//                 </td>
//             </tr>
//             <tr>
//                 <td align="center" style="font-size: 16px; color: #333; padding-top: 10px;">
//                     You have requested a password reset. Click the button below to reset your password.
//                 </td>
//             </tr>
//             <tr>
//                 <td align="center" style="padding-top: 20px;">
//                     <a href="http://localhost:3000/reset-password/${resetToken}" style="text-decoration: none; background-color: #0073e6; color: #ffffff; padding: 10px 20px; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
//                 </td>
//             </tr>
//             <tr>
//                 <td align="center" style="font-size: 14px; color: #666; padding-top: 20px;">
//                     If you did not request a password reset, please ignore this email.
//                 </td>
//             </tr>
//         </table>
//     </body>
//       `,
//       };
//       await transporter.sendMail(mailOptions);
//     }

//     return res.status(200).json({ message: 'Password reset email sent. Please check your inbox or spam.', status: true });
//   } catch (error) {
//     return res.status(500).json({
//       message: getErrorMessage(500), status: false
//     });
//   }
// }


export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const response = await userService.resetPassword({ token, password })
    if (response.status == false) {
      return res.status(response.code).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
}

export const updateUserInfo = async (req, res) => {
  try {
    const newUserData = {
      userName: req.body.userName,
      description: req.body.description,
      socialMedia: req.body.socialMedia,
      profilePicture: req.body.profilePicture
    };
    const updatedUser = await userService.updateUser(req.user.email, newUserData);
    if (updatedUser) {
      res.status(updatedUser.code).json({
        message: getSuccessMessage(201),
        status: true,
      });

    } else {
      res.status(404).json({ message: "User not found", status: false });
    }
    return
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
};

export const getUserProfile = async (req, res) => {
  let authId = `is not equal ${Math.random * Date.now()}`;
  if (req.user && req.user.uid) {
    authId = req.user.uid
  }
  const id = req.params.id;
  try {
    const userProfile = await userService.userProfile(id, authId);
    return res.status(userProfile.code).json(userProfile)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
};

export const getMyProfile = async (req, res) => {
  if (!req.user) {
    return
  }
  if (req.user && !req.user.email) {
    return
  }
  const email = req.user.email;
  try {
    const userProfile = await userService.myProfile(email);
    return res.status(userProfile.code).json(userProfile)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
};

export const follow = async (req, res) => {
  if (!req.user.email || !req.body.email) {
    return { message: getErrorMessage(404), status: false, code: 404 }
  }
  const follower_email = req.user.email;
  const following_email = req.body.email
  try {
    const response = await userService.followUser(follower_email, following_email)
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const getPromotedUsers = async (req, res) => {
  try {
    const response = await userService.promotedUsers()
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const serverHealthCheck = async (req, res) => {
  res.status(200).json("Hello world from the server!")
}

export const wishList = async (req, res) => {
  if (req.body && !req.body.productId) {
    return res.status(400).json({
      message: getErrorMessage(400), status: false
    });
  }
  if (req.user && !req.user.email) {
    return res.status(400).json({
      message: getErrorMessage(400), status: false
    });
  }
  const productId = req.body.productId;
  const userEmail = req.user.email
  try {
    const response = await userService.wishList({ productId, userEmail })
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const getWishListItems = async (req, res) => {
  if(req.user && !req.user.email) {
    return res.status(400).json({
      message: getErrorMessage(400), status: false
    });
  }
  const userEmail = req.user.email
  try {
    const response = await userService.getWishListItems(userEmail)
    return res.status(response.code).json(response)
  } catch (error) {
    return res.status(500).json({
      message: getErrorMessage(500), status: false
    });
  }
}

export const getUserDownloadableItems = async(req, res) => {
  const {email} = req.user
  
  try {
    const response = await userService.getDownloadableItems(
      email
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// For now this function is not being used, converting current authentication method to firebase auth
export const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenExpiration = Date.now() + 1600000;
  const newDate = new Date(resetTokenExpiration);
  try {
    const user = await User.findOne({ email });
    const emailTemplate = fs.readFileSync('resetPasswordEmailTemplate.html', 'utf8');
    const templateData = {
      newDate: newDate,
      resetToken: resetToken,
    };
    const renderedEmail = ejs.render(emailTemplate, templateData);

    if (user.email === "Email") {
      user.resetToken = resetToken;
      user.resetTokenExpiration = resetTokenExpiration;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'Yahoo',
        auth: {
          user: email_user,
          pass: email_pass,
        },
      });

      const mailOptions = {
        from: email_user,
        to: email,
        subject: 'Password Reset Request',
        html: renderedEmail
      };
      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({ message: 'Password reset email sent. Please check your inbox or spam.', status: true });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.', status: false });
  }
}