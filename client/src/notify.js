import toast from "react-hot-toast";

const notify = (msg, type) => {
  switch (type) {
    case "success":
      toast.success(msg);
      break;
    case "error":
      toast.error(msg);
      break;
    default:
      toast(msg);
  }
};

export default notify;
