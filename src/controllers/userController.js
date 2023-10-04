import { getErrorMessage } from "../../errors/errorMessages.js";
import userService from "../services/userService.js"

export const createUserController = async(req, res) => {
  try {
    const { userName, password, role } = req.body;
    const created_by = req.user._id;
    const result = await userService.createUser(req.body);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: getErrorMessage(500, error), status: false });
  }
}

export const loginController = async (req, res) => {
  if (!req.body.userName || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Something is missing.", status: false });
  }

  try {
    const token = await userService.loginUser(
      req.body.userName,
      req.body.password
    );

    if (token) {
      res.set("Authorization", `Bearer ${token}`).status(200).json({
        message: "User successfully Logged In.",
        status: true,
      });
    } else {
      res.status(404).json({
        message: "Username or Password Incorrect..",
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Unsuccessful login. Please Try Again...",
      status: false,
    });
  }
};

export const updateUserInfoController = async (req, res) => {
  try {
    const _id = req.body._id;
    const updatedUserData = {
      userName: req.body.userName,
      role: req.body.role,
    };

    const updatedUser = await userService.updateUser(_id, updatedUserData);

    if (updatedUser) {
      res.status(200).json({
        message: "User info Updated",
        status: true,
        updatedUser,
      });
    } else {
      res.status(404).json({ message: "User not found", status: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong. Failed to update info",
      status: false,
    });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const _id = req.body._id;
    const userDeleted = await userService.deleteUserById(_id);

    if (userDeleted) {
      res
        .status(200)
        .json({ message: "User deleted Successfully", status: true });
    } else {
      res.status(404).json({
        message: "User doesn't exist or it is already deleted.",
        status: false,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete User", status: false });
  }
};
