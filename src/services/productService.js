async function productUploader(data) {
    try {
        res.status(200).json({message: "success"})
    } catch(err) {
        res.status(500).json({message: "Internal Server Error", status: false})
    }
}


export default {
    productUploader
  };