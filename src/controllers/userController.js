import { getErrorMessage, } from "../../errors/errorMessages.js";
import User from "../model/userModal.js";
import userService from "../services/userService.js"


export const createUserController = async(req, res) => {
  try {
    const result = await userService.createUser(req.body);

    res.status(200).json(result);
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
    console.log(token,"token")
    if (token) {
      res.set("Authorization", `Bearer ${token}`).status(200).json({
        message: "User successfully Logged In.",
        token,
        status: true,
      });
    }
    //  else {
    //   res.status(404).json({
    //     message: "Email or Password Incorrect..",
    //     status: false,
    //   });
    // }
  } catch (error) {
    res.status(500).json({
      message: getErrorMessage(500, error),
      status: false,
    });
  }
};

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
    console.log(error)
    res.status(500).json({
      message: getErrorMessage(500, error),
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const _id = req.user._id;
    const userProfile = await userService.userProfile(_id)
    console.log(userProfile, "userProfile")
    res.status(200).json({message: "Userinfo Found", userProfile})
  } catch(error) {
    res.status(error.code).json({
      message: getErrorMessage(500, error),
    });
  }
};

export const googleSignUpHandler = async (req, res) => {
  try {
    // const {credential} = req.body
    // const decoded = jwt.decode(credential);

    // console.log(decoded)
    // res.json({mess:"success", decoded})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}