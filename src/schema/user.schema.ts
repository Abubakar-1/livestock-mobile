import * as yup from "yup";

export const profileSchema = yup.object().shape({
  bankName: yup.string().required("Bank name is required"),
  accountNumber: yup
    .string()
    .required("Account number is required")
    .matches(/^[0-9]{10}$/, "Account number must be exactly 10 digits"),
  accountName: yup.string().required("Account name is required"),
});
