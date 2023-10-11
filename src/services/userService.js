import bcrypt from "bcryptjs"; 
import User from "../model/userModal.js";
import jwt from "jsonwebtoken";

const secret_key = process.env.SECRET_KEY;


async function createUser(data) {
  const { username: userName, password,  email } = data;
  try {
    console.log(userName,'userName')
    if (!userName && !email && !password ) {
      return {message: "Something is missing.", status: false, code: 400};
    }
    const userExists = await User.findOne({ userName });
    if (userExists !== null) {
       return ({message: "userName or Email Already Exists.", status: false, code: 404});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      userName: userName,
      email: email,
      password: hashedPassword
    });
    await newUser.save();
    return { message: "User Successfully created.", status: true };
  } catch (error) {
    return error; 
  }
}

async function loginUser(req) {
  try {
    const {credential} = req
    const decoded = jwt.decode(credential);
    const googleUserExist = await User.findOne({email: decoded && decoded.email})
    if(googleUserExist) {
      return credential 
    }
    if(googleUserExist === null && decoded) {
      const googleLoggedUser = new User({
        userName: decoded.name,
        email: decoded.email,
        firstName: decoded.given_name,
        LastName: decoded.family_name,
        source: "Google",
        profilePicture: decoded.picture
      })
      await googleLoggedUser.save()
    } 
    if(decoded === null) {
      const user = await User.findOne({
        email: req.email,
      });
      if (user == null) {
        return {message: "Account not found.", status: false, code: 404 }; 
      }
      const passwordChecker = await bcrypt.compare(req.password, user.password);
      if (!passwordChecker) {
        return {message: "password or email incorrect.", status: false, code: 400 }; 
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
      return {token, status: true};
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateUser(_id, updatedUserData) {
  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return {message: "User does'nt exist.", status: false}; 
    }

    existingUser.userName = updatedUserData.userName;
    existingUser.description = updatedUserData.description;

    const updatedUser = await existingUser.save();
    return updatedUser; 
  } catch (err) {
    throw err; 
  }
}

async function userProfile(_id) {
  try {
    const userProfile = await User.findById(_id);
    if(!userProfile) {
      throw {message: "Profile not found.", status: false, code: 404};
    }
    console.log(userProfile)
    return userProfile;
  } catch(err) {
    throw {message: "Internal Server Error",code: 500, err};
  }
}

export const resetPassword = async ({token, password}) => {
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
    return {message: "Password updated Successfully!", status: true}
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
    console.log(err);
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
