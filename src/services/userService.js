import bcrypt from "bcryptjs";
import User from "../model/userModal.js";
import jwt from "jsonwebtoken";

const secret_key = process.env.SECRET_KEY;


async function createUser(data) {
  const { username: userName, password, email } = data.values;
  try {
    if (!userName && !email && !password) {
      return { message: "Something is missing.", status: false, code: 400 };
    }
    const userByUsername = await User.findOne({ userName });
    const userByEmail = await User.findOne({ email });
    if (userByUsername && userByEmail) {
      return { message: "Username and Email Already Exist.", status: false, code: 404 };
    } if (userByUsername) {
      return { message: "Username Already in Use.", status: false, code: 404 };
    } if (userByEmail) {
      return { message: "Email Already in Use.", status: false, code: 404 };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      userName: userName,
      email: email,
      password: hashedPassword,
      source: data.source
    });
    await newUser.save();
    return { message: "User Successfully created.", status: true, code: 200 };
  } catch (error) {
    return { message: error, status: true, code: 500 };
  }
}

async function loginUser(req) {
  try {
    const { credential: decoded } = req

    if(decoded && req.source === "Facebook") {
      const fbUserExist = await User.findOne({userName: decoded.displayName, source: "Facebook"})
      if(fbUserExist && fbUserExist.source === "Facebook") {
        return { message: "Successfully Logged in with Facebook Account.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` } 
      }
      else {
        const fbCreateUser = new User({
          userName: decoded.displayName,
          email: decoded.providerData[0].email? decoded.providerData[0].email: "No email",
          source: "Facebook",
          profilePicture: decoded.picture,
          uid: decoded.uid
        })
        await fbCreateUser.save()
        return { message: "Sign in with Facebook Account Successful.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` }
      }
    }
    if (decoded && req.source === "Google") {
      const googleUserExist = await User.findOne({ email: decoded && decoded.email })
      if (googleUserExist && googleUserExist.source === "Google") {
        return { message: "Successfully Logged in with Google Account.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` }
      }
      if (googleUserExist === null) {
        const googleLoggedUser = new User({
          userName: decoded.displayName,
          email: decoded.email,
          source: "Google",
          profilePicture: decoded.picture,
          uid: decoded.uid
        })
        await googleLoggedUser.save()
        return { message: "Sign in with Google Account Successful.", status: true, code: 200, token: `firebase ${decoded.stsTokenManager.accessToken}` }
      }
    }
    if (!decoded) {
      const user = await User.findOne({
        email: req.values.email,
      });
      if (user == null) {
        return { message: "Account not found.", status: false, code: 404 };
      }
      const passwordChecker = await bcrypt.compare(req.values.password, user.password);
      if (!passwordChecker) {
        return { message: "password or email incorrect.", status: false, code: 400 };
      }
      const token = jwt.sign(
        {
          email: user.email,
          password: user.password,
          _id: user._id,
        },
        'new_web_secret',
        {
          expiresIn: "1d",
        }
      );
      return { token: `Bearer ${token}`, status: true };
    }
  } catch (err) {
    throw err;
  }
}

async function updateUser(_id, updatedUserData) {
  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return { message: "User does'nt exist.", status: false };
    }

    existingUser.userName = updatedUserData.userName;
    existingUser.description = updatedUserData.description;

    const updatedUser = await existingUser.save();
    return updatedUser;
  } catch (err) {
    throw err;
  }
}

async function userProfile(_id, sign_in_method) {
  try {
    let userProfile;
    if(sign_in_method === "Email Login") {
      userProfile = await User.findById(_id, 'createdAt email userName uid profilePicture');
    }
    if(sign_in_method === "Firebase Login"){
      userProfile = await User.findOne({uid: _id}, 'createdAt email userName uid profilePicture');
    }
    if (!userProfile) {
      throw { message: "Profile not found.", status: false, code: 404 };
    }
    return userProfile;
  } catch (err) {
    throw { message: "Internal Server Error", code: 500, err };
  }
}

export const resetPassword = async ({ token, password }) => {
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return { message: 'Invalid or expired token.', status: false, code: 400 };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return { message: "Password updated Successfully!", status: true }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
}

async function deleteUserById(_id) {
  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return false;
    }
    await User.findByIdAndDelete(_id);
    return true;
  } catch (err) {
    throw err;
  }
}

export default {
  createUser,
  loginUser,
  updateUser,
  resetPassword,
  userProfile,
  deleteUserById,
};
