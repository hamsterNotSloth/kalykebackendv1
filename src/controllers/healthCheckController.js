export const serverHealthCheck = async (req, res) => {
    res.status(200).json("Hello world from the server!")
  } 